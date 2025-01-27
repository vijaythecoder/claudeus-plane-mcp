import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

export interface PlaneInstance {
  name: string;
  baseUrl: string;
  apiKey: string;
  workspaceSlug: string;
}

export interface PlaneErrorResponse {
  message: string;
  code?: number;
  details?: Record<string, unknown>;
}

export class PlaneError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PlaneError';
  }
}

export interface ApiClientConfig {
  baseUrl: string;
  apiKey: string;
  workspaceSlug: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: number;
    details?: Record<string, unknown>;
  };
} 