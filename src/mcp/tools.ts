import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
    ListToolsRequestSchema, 
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
    ReadResourceRequestSchema,
    ServerResult
} from '@modelcontextprotocol/sdk/types.js';
import { PlaneApiClient } from '../api/client.js';
import { allTools } from '../tools/index.js';
import { DEFAULT_INSTANCE } from '../config/plane-config.js';
import { z } from 'zod';
import { Tool, ToolResponse } from '../types/mcp.js';
import { McpServer } from './server.js';

interface MCPMessage {
    jsonrpc: '2.0';
    id?: number;
    method?: string;
    params?: Record<string, unknown>;
    result?: {
        content?: Array<{ type: string; text: string }>;
        _meta?: Record<string, unknown>;
    };
}

function constructResourceUri(name: string, url: string): string {
    return `plane://${name}@${new URL(url).hostname}`;
}

export function registerTools(server: Server, clients: Map<string, PlaneApiClient>) {
    // Register resource handlers
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        const resources = Array.from(clients.entries()).map(([name, client]) => ({
            id: name,
            name: `Instance: ${name}`,
            type: "plane_instance",
            uri: constructResourceUri(name, client.baseUrl),
            metadata: {
                url: client.baseUrl,
                authType: "api_key"
            }
        }));
        return { resources };
    });

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        if (!request.params?.uri || typeof request.params.uri !== 'string') {
            throw { code: -32602, message: 'Resource URI must be a non-empty string' };
        }

        const match = request.params.uri.match(/^plane:\/\/([^@]+)@/);
        if (!match) {
            throw { code: -32602, message: `Invalid Plane resource URI format: ${request.params.uri}` };
        }

        const name = match[1];
        const client = clients.get(name);
        if (!client) {
            throw { code: -32602, message: `Unknown instance: ${name}` };
        }

        return {
            resource: {
                id: name,
                name: `Instance: ${name}`,
                type: "plane_instance",
                uri: constructResourceUri(name, client.baseUrl),
                metadata: {
                    url: client.baseUrl,
                    authType: "api_key",
                    capabilities: {
                        projects: true,
                        issues: true,
                        cycles: true,
                        modules: true
                    }
                }
            },
            contents: [{
                type: 'text',
                uri: constructResourceUri(name, client.baseUrl),
                text: JSON.stringify({
                    url: client.baseUrl,
                    authType: "api_key",
                    capabilities: {
                        projects: true,
                        issues: true,
                        cycles: true,
                        modules: true
                    }
                }, null, 2)
            }]
        };
    });

    server.setRequestHandler(ListResourceTemplatesRequestSchema, async (request) => {
        const resourceId = request.params?.id;
        if (!resourceId || typeof resourceId !== 'string') {
            return { resourceTemplates: [] };
        }

        const client = clients.get(resourceId);
        if (!client) {
            return { resourceTemplates: [] };
        }

        return {
            resourceTemplates: [{
                id: "claudeus_plane_discover_endpoints_template",
                name: "Discover Endpoints",
                description: "Discover available REST API endpoints on this Plane instance",
                tool: "claudeus_plane_discover_endpoints",
                arguments: {
                    instance: resourceId
                }
            }]
        };
    });

    // Register tool handlers
    server.setRequestHandler(ListToolsRequestSchema, async (request) => {
        const instance = (request.params?.instance as string) || DEFAULT_INSTANCE;
        const client = clients.get(instance);
        
        if (!client) {
            throw new Error(`Unknown instance: ${instance}`);
        }

        return {
            tools: allTools.map(tool => ({
                name: tool.name,
                description: tool.description,
                status: tool.status || 'enabled',
                inputSchema: tool.inputSchema || { type: 'object', properties: {} }
            }))
        };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request): Promise<ServerResult> => {
        const { name, arguments: args } = request.params;
        const toolDef = allTools.find(t => t.name === name);

        if (!toolDef) {
            throw new Error(`Tool not found: ${name}`);
        }

        const instance = (args?.instance as string) || DEFAULT_INSTANCE;
        const client = clients.get(instance);
        if (!client) {
            throw new Error(`Unknown instance: ${instance}`);
        }

        const toolInstance = new toolDef.class(client);
        const result = await toolInstance.execute(args || {});

        return {
            content: result.content,
            _meta: request.params._meta
        };
    });
}

interface ExecutableTool extends Tool {
    execute(args: Record<string, unknown>): Promise<ToolResponse>;
}

type ToolClass = new (client: PlaneApiClient) => ExecutableTool;

export function setupToolHandlers(server: Server, client: PlaneApiClient): void {
    // Register tool list handler
    server.setRequestHandler(z.object({
        method: z.literal('tools/list')
    }), async () => {
        return {
            tools: allTools.map(tool => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema
            }))
        };
    });

    // Register tool call handler
    server.setRequestHandler(z.object({
        method: z.literal('tools/call'),
        params: z.object({
            name: z.string(),
            arguments: z.record(z.unknown()).optional(),
            _meta: z.object({
                progressToken: z.union([z.string(), z.number()]).optional()
            }).optional()
        })
    }), async (request) => {
        const { name, arguments: args } = request.params;
        const toolDef = allTools.find(t => t.name === name);

        if (!toolDef) {
            throw new Error(`Tool not found: ${name}`);
        }

        const ToolClass = toolDef.class as ToolClass;
        const toolInstance = new ToolClass(client);
        const result = await toolInstance.execute(args || {});

        return {
            content: result.content,
            _meta: request.params._meta
        };
    });
}