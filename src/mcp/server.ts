import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express, { Express, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { PromptDefinition, PromptContext } from '../types/prompt.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { 
  ListResourcesRequestSchema, 
  ReadResourceRequestSchema, 
  ListResourceTemplatesRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

type ServerCapabilities = {
  [key: string]: unknown;
  prompts?: { list?: boolean, execute?: boolean };
  tools?: { list?: boolean, call?: boolean };
  resources?: { list?: boolean, read?: boolean };
};

interface Connection {
  id: string;
  transport: any;
  initialized: boolean;
}

interface ServerRequest<T = unknown> {
  method: string;
  params: T;
}

export class McpServer {
  private server: Server;
  private app: Express;
  private connections: Map<string, Connection> = new Map();
  private nextConnectionId = 1;
  private capabilities = {
    prompts: { list: true, execute: true, listChanged: true },
    tools: { list: true, call: true, listChanged: true },
    resources: { list: true, read: true, listChanged: true }
  };
  private registeredPrompts: PromptDefinition[] = [];

  constructor(name: string = 'claudeus-plane-mcp', version: string = '1.0.0') {
    // Create server with proper initialization
    this.server = new Server(
      { name, version },
      { capabilities: this.capabilities }
    );

    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());

    // Register resource handlers first
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return { resources: [] }; // Placeholder - will be overridden by tools.ts
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async () => {
      return { resource: null, contents: [] }; // Placeholder - will be overridden by tools.ts
    });

    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
      return { resourceTemplates: [] }; // Placeholder - will be overridden by tools.ts
    });

    // Register prompt handlers using SDK schemas
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return { 
        prompts: this.registeredPrompts.map(p => ({
          name: p.name,
          description: p.description,
          schema: p.schema
        }))
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const promptName = request.params?.name;
      if (!promptName || typeof promptName !== 'string') {
        throw new Error('Prompt name is required');
      }

      const prompt = this.registeredPrompts.find(p => p.name === promptName);
      if (!prompt) {
        throw new Error(`Unknown prompt: ${promptName}`);
      }

      return {
        name: prompt.name,
        description: prompt.description,
        schema: prompt.schema
      };
    });

    // Then register initialization and shutdown handlers
    const initializeSchema = z.object({
      method: z.literal('initialize'),
      params: z.object({
        capabilities: z.record(z.unknown())
      })
    });

    const shutdownSchema = z.object({
      method: z.literal('shutdown')
    });

    this.server.setRequestHandler(initializeSchema, async (request) => {
      if (!this.isValidCapabilities(request.params.capabilities)) {
        throw {
          code: -32602,
          message: 'Invalid params: capabilities must be an object'
        };
      }
      return {
        protocolVersion: '2024-11-05',
        serverInfo: {
          name,
          version
        },
        capabilities: this.capabilities
      };
    });

    this.server.setRequestHandler(shutdownSchema, async () => {
      return { success: true };
    });
  }

  private isValidCapabilities(capabilities: unknown): boolean {
    return typeof capabilities === 'object' && capabilities !== null && !Array.isArray(capabilities);
  }

  private trackConnection(transport: any): void {
    const id = `conn_${this.nextConnectionId++}`;
    this.connections.set(id, { id, transport, initialized: true });
    console.error(`🔌 New connection established: ${id}`);
  }

  private untrackConnection(transport: any): void {
    for (const [id, conn] of this.connections.entries()) {
      if (conn.transport === transport) {
        this.connections.delete(id);
        console.error(`🔌 Connection closed: ${id}`);
        break;
      }
    }
  }

  getServer(): Server {
    return this.server;
  }

  getApp(): Express {
    return this.app;
  }

  getActiveConnections(): number {
    return this.connections.size;
  }

  async connectStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    this.trackConnection(transport);
    try {
      await this.server.connect(transport);
    } catch (error) {
      this.untrackConnection(transport);
      throw error;
    }
  }

  async connectSSE(port = 3000, path = '/sse'): Promise<void> {
    this.app.get(path, (req, res: Response) => {
      const transport = new SSEServerTransport(path, res);
      
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      this.trackConnection(transport);

      this.server.connect(transport).catch(error => {
        console.error('Failed to connect transport:', error);
        this.untrackConnection(transport);
        res.end();
      });

      res.on('close', () => {
        this.untrackConnection(transport);
      });
    });

    await new Promise<void>((resolve) => {
      this.app.listen(port, () => {
        console.error(`Server listening on port ${port}`);
        resolve();
      });
    });
  }

  registerPrompt(prompt: PromptDefinition): void {
    // Register the execute handler for this specific prompt
    const executeSchema = z.object({
      method: z.literal(`prompts/${prompt.name}/execute`),
      params: z.object({
        arguments: z.record(z.unknown())
      })
    });

    this.server.setRequestHandler(executeSchema, async (request, extra) => {
      try {
        const context: PromptContext = {
          workspace: process.env.WORKSPACE_PATH || '',
          connectionId: 'default'
        };

        // Execute the prompt handler with the arguments
        const result = await prompt.handler(request.params.arguments, context);
        console.error(`Executed prompt: ${prompt.name}`);
        
        // Ensure we have a properly structured response
        if (!result?.messages || !Array.isArray(result.messages)) {
          throw new Error('Prompt handler must return a messages array');
        }
        
        return {
          messages: result.messages,
          metadata: result.metadata || {},
          tools: []
        };
      } catch (error) {
        console.error(`Failed to execute prompt ${prompt.name}:`, error);
        return {
          messages: [{
            role: 'assistant',
            content: {
              type: 'text',
              text: `Error executing prompt ${prompt.name}: ${error instanceof Error ? error.message : String(error)}`
            }
          }],
          metadata: { error: error instanceof Error ? error.message : String(error) },
          tools: []
        };
      }
    });

    // Track the registered prompt
    this.registeredPrompts.push(prompt);
    console.error(`Registered prompt: ${prompt.name}`);
  }

  async initialize(): Promise<void> {
    try {
      await this.connectStdio();
      console.error('Server initialized successfully');
    } catch (error) {
      console.error('Failed to initialize server:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    try {
      console.error('Server started successfully');
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  }
} 