import { Server } from '@modelcontextprotocol/sdk/server/index.js';
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
import { Tool, ToolResponse } from '../types/mcp.js';

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

    // Register tool handlers according to MCP standards
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        // Return all tools with proper schema
        return {
            tools: allTools.map(tool => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema || { type: 'object', properties: {} },
                annotations: {
                    title: tool.name.split('__').pop()?.replace(/_/g, ' ') || tool.name,
                    readOnlyHint: tool.name.startsWith('claudeus_plane_') && 
                                 (tool.name.includes('__list') || tool.name.includes('__get')),
                    destructiveHint: tool.name.includes('__delete'),
                    idempotentHint: tool.name.includes('__update'),
                    openWorldHint: true // All tools interact with external Plane API
                }
            }))
        };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request): Promise<ServerResult> => {
        const { name, arguments: args } = request.params;
        const toolDef = allTools.find(t => t.name === name);

        if (!toolDef) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `Error: Tool not found: ${name}`
                    }
                ]
            };
        }

        try {
            const instance = (args?.instance as string) || DEFAULT_INSTANCE;
            const client = clients.get(instance);
            if (!client) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: `Error: Unknown Plane instance: ${instance}`
                        }
                    ]
                };
            }

            // Pass the client instance to the tool class
            const toolInstance = new toolDef.class(client);
            const result = await toolInstance.execute(args || {});

            return {
                content: result.content,
                _meta: request.params._meta
            };
        } catch (error) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
                    }
                ]
            };
        }
    });
}

interface ExecutableTool extends Tool {
    execute(args: Record<string, unknown>): Promise<ToolResponse>;
}

type ToolClass = new (client: PlaneApiClient) => ExecutableTool;