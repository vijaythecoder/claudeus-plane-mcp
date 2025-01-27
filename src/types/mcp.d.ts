import { z } from 'zod';

declare module '@modelcontextprotocol/sdk' {
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
    constructor(definition: MCPToolDefinition);
    abstract execute(input: z.infer<TInput>): Promise<z.infer<TOutput>>;
  }
} 