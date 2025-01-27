import { z } from 'zod';
import { Prompt } from '@modelcontextprotocol/sdk/types.js';

export interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
  type?: string;
  enum?: string[];
  default?: unknown;
}

export interface PromptDefinition extends Prompt {
  handler: PromptHandler;
}

export interface Prompts {
  [key: string]: PromptDefinition;
}

export interface PromptMessage {
  role: 'assistant';
  content: {
    type: 'text';
    text: string;
  };
}

export interface PromptResponse {
  messages: PromptMessage[];
  metadata?: Record<string, unknown>;
}

export interface PromptContext {
  workspace: string;
  connectionId?: string;
  project?: string;
  user?: string;
  environment?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export type PromptHandler = (args: Record<string, unknown>, context: PromptContext) => Promise<PromptResponse>;

export interface PromptRegistry {
  [key: string]: {
    definition: PromptDefinition;
    handler: PromptHandler;
  };
}

export interface ListPromptsResponse {
  prompts: PromptDefinition[];
}

export interface ExecutePromptResponse {
  result: PromptResponse;
}

export interface PromptExample {
  name: string;
  args: Record<string, unknown>;
} 