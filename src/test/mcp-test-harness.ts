import { EventEmitter } from 'events';
import dummyProjects from '@/dummy-data/projects.json' with { type: 'json' };

export interface MCPContentItem {
  type: string;
  text: string;
}

export interface MCPMessage {
  jsonrpc: '2.0';
  id: number;
  method?: string;
  params?: Record<string, unknown>;
  result?: {
    content?: MCPContentItem[];
    capabilities?: Record<string, unknown>;
    [key: string]: unknown;
  };
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface Transport {
  onMessage: (handler: (message: MCPMessage) => void) => void;
  send: (message: MCPMessage) => void;
}

class InMemoryTransport implements Transport {
  private messageHandler?: (message: MCPMessage) => void;
  private otherTransport?: InMemoryTransport;

  onMessage(handler: (message: MCPMessage) => void): void {
    this.messageHandler = handler;
  }

  send(message: MCPMessage): void {
    if (this.otherTransport?.messageHandler) {
      this.otherTransport.messageHandler(message);
    }
  }

  static createLinkedPair(): [InMemoryTransport, InMemoryTransport] {
    const client = new InMemoryTransport();
    const server = new InMemoryTransport();
    client.otherTransport = server;
    server.otherTransport = client;
    return [client, server];
  }
}

export class MCPTestHarness {
  private clientTransport: InMemoryTransport;
  private serverTransport: InMemoryTransport;
  private responseHandlers = new Map<number, (response: MCPMessage) => void>();
  private isConnected = false;
  private nextMessageId = 1;

  constructor() {
    [this.clientTransport, this.serverTransport] = InMemoryTransport.createLinkedPair();
    
    // Set up server-side message handling
    this.serverTransport.onMessage((message: MCPMessage) => {
      if (message.method === 'initialize') {
        this.handleInitialize(message);
      } else if (message.method === 'tool/call') {
        this.handleToolCall(message);
      }
    });

    // Set up client-side message handling
    this.clientTransport.onMessage((message: MCPMessage) => {
      if (message.id && this.responseHandlers.has(message.id)) {
        const handler = this.responseHandlers.get(message.id)!;
        handler(message);
      }
    });
  }

  private handleInitialize(message: MCPMessage): void {
    if (!message.id) {
      return;
    }
    
    this.serverTransport.send({
      jsonrpc: '2.0',
      id: message.id,
      result: {
        capabilities: {
          sampling: {},
          roots: { listChanged: true }
        }
      }
    });
  }

  private handleToolCall(message: MCPMessage): void {
    if (!message.id || !message.params) {
      return;
    }

    const { name, args } = message.params as { name: string; args: Record<string, unknown> };
    
    if (name === 'claudeus_plane_projects__list') {
      if (!args.workspace) {
        this.serverTransport.send({
          jsonrpc: '2.0',
          id: message.id,
          result: {
            content: [{
              type: 'text',
              text: 'Error: Missing required workspace parameter'
            }]
          }
        });
        return;
      }

      if (args.workspace === 'invalid-workspace-id') {
        this.serverTransport.send({
          jsonrpc: '2.0',
          id: message.id,
          result: {
            content: [{
              type: 'text',
              text: 'Error: Invalid workspace ID'
            }]
          }
        });
        return;
      }

      // Return actual dummy projects for valid workspace
      this.serverTransport.send({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          content: [{
            type: 'text',
            text: JSON.stringify(dummyProjects)
          }]
        }
      });
    }
  }

  async connect(): Promise<MCPMessage> {
    if (this.isConnected) {
      throw new Error('Already connected');
    }
    this.isConnected = true;
    return this.sendInitialize();
  }

  async sendInitialize(): Promise<MCPMessage> {
    const initMessage: MCPMessage = {
      jsonrpc: '2.0',
      id: this.nextMessageId++,
      method: 'initialize',
      params: {
        capabilities: {
          sampling: {},
          roots: { listChanged: true }
        }
      }
    };
    
    return this.sendMessage(initMessage);
  }

  async sendMessage(message: MCPMessage): Promise<MCPMessage> {
    if (!this.isConnected) {
      throw new Error('Not connected');
    }

    if (!message.id) {
      throw new Error('Message must have an ID');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.responseHandlers.delete(message.id!);
        reject(new Error('Message timeout'));
      }, 5000);

      this.responseHandlers.set(message.id, (response: MCPMessage) => {
        clearTimeout(timeout);
        this.responseHandlers.delete(message.id!);
        resolve(response);
      });

      this.clientTransport.send(message);
    });
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<MCPMessage> {
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id: this.nextMessageId++,
      method: 'tool/call',
      params: {
        name,
        args
      }
    };

    return this.sendMessage(message);
  }

  onServerMessage(message: MCPMessage): void {
    this.serverTransport.send(message);
  }

  clearHandlers(): void {
    this.responseHandlers.clear();
    this.isConnected = false;
  }
} 