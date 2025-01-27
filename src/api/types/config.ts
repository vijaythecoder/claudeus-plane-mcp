import { z } from 'zod';

// Instance configuration schema
export const PlaneInstanceConfigSchema = z.object({
  baseUrl: z.string().url(),
  defaultWorkspace: z.string(),
  otherWorkspaces: z.array(z.string()).optional(),
  apiKey: z.string(),
});

export type PlaneInstanceConfig = z.infer<typeof PlaneInstanceConfigSchema>;

// Full configuration schema for multiple instances
export const PlaneConfigSchema = z.record(z.string(), PlaneInstanceConfigSchema);

export type PlaneConfig = z.infer<typeof PlaneConfigSchema>;

// API client options
export interface PlaneClientOptions {
  instance: PlaneInstanceConfig;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
} 