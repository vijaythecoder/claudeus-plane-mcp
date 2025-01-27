import { z } from 'zod';

export interface ServerCapabilities {
  prompts?: { listChanged?: boolean };
  tools?: { listChanged?: boolean };
  resources?: { listChanged?: boolean };
}

export interface Connection {
  id: string;
  transport: any;
  initialized: boolean;
  capabilities?: ServerCapabilities;
}

export interface ToolDefinition {
  name: string;
  description: string;
  status?: 'enabled' | 'disabled';
  inputSchema: {
    type: string;
    required?: string[];
    properties?: Record<string, unknown>;
  };
}

export interface Tool extends ToolDefinition {
  execute: (args: Record<string, unknown>) => Promise<ToolResponse>;
}

export interface ToolWithClass extends ToolDefinition {
  class: new (...args: any[]) => Tool;
}

export interface ToolResponse {
  isError?: boolean;
  content: Array<{
    type: string;
    text: string;
  }>;
}

export interface ListToolsResponse {
  tools: Tool[];
}

export interface CallToolResponse {
  result: ToolResponse;
}

export interface ResourceTemplate {
  id: string;
  name: string;
  description: string;
  tool: string;
  arguments: Record<string, unknown>;
}

export interface ListResourceTemplatesResponse {
  resourceTemplates: ResourceTemplate[];
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  uri: string;
  metadata: Record<string, unknown>;
}

export interface ListResourcesResponse {
  resources: Resource[];
}

export interface ResourceContent {
  type: string;
  uri: string;
  text: string;
}

export interface ReadResourceResponse {
  resource: Resource;
  contents: ResourceContent[];
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  outputSchema: z.ZodType<any>;
}

export abstract class MCPTool<
  TInput extends z.ZodType<any>,
  TOutput extends z.ZodType<any>
> {
  constructor(protected definition: MCPToolDefinition) {}
  abstract execute(input: z.infer<TInput>): Promise<z.infer<TOutput>>;
}

export interface JsonRpcMessage {
  jsonrpc: '2.0';
  id?: number | string;
  method?: string;
  params?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface McpError extends Error {
  code: number;
  data?: unknown;
}

export interface McpRequest {
  id: string | number;
  method: string;
  params: Record<string, unknown>;
}

export interface McpResponse {
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface McpNotification {
  method: string;
  params?: Record<string, unknown>;
} 