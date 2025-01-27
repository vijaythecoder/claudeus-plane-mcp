import axios, { AxiosInstance, AxiosError } from 'axios';
import { PlaneInstanceConfig } from './types/config.js';

export type QueryParams = Record<string, string | number | boolean | Array<string | number> | null | undefined>;

interface PlaneErrorResponse {
    message: string;
    [key: string]: any;
}

export class BaseApiClient {
    protected client: AxiosInstance;
    protected _instance: PlaneInstanceConfig;
    public readonly baseUrl: string;

    constructor(instance: PlaneInstanceConfig) {
        this._instance = instance;
        this.baseUrl = instance.baseUrl;
        
        // Keep the full baseUrl including /api/v1 since it's part of the base URL
        const baseURL = this.baseUrl.endsWith('/') 
            ? this.baseUrl.slice(0, -1) // Remove trailing slash if present
            : this.baseUrl;

        this.client = axios.create({
            baseURL,
            headers: {
                'X-API-Key': instance.apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Add response interceptor for better error handling
        this.client.interceptors.response.use(
            response => response,
            error => {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError<PlaneErrorResponse>;
                    if (axiosError.response?.status === 403) {
                        throw new Error(`API Error (403): Authentication failed. Please check your API key.`);
                    }
                    const errorMessage = axiosError.response?.data?.message || axiosError.message;
                    const errorCode = axiosError.response?.status;
                    throw new Error(`API Error (${errorCode}): ${errorMessage}`);
                }
                throw error;
            }
        );
    }

    get instance(): PlaneInstanceConfig {
        return this._instance;
    }

    protected handleError(error: AxiosError<PlaneErrorResponse>): never {
        if (error.response?.status === 403) {
            throw new Error(`API Error: Authentication failed. Please check your API key.`);
        }
        if (error.response?.data?.message) {
            throw new Error(`API Error: ${error.response.data.message}`);
        } else if (error.response?.status) {
            throw new Error(`HTTP Error ${error.response.status}: ${error.message}`);
        } else {
            throw new Error(`Network Error: ${error.message}`);
        }
    }

    protected async get<T>(endpoint: string, params?: QueryParams): Promise<T> {
        try {
            const response = await this.client.get<T>(endpoint, { params });
            return response.data;
        } catch (error) {
            this.handleError(error as AxiosError<PlaneErrorResponse>);
        }
    }

    protected async post<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
        try {
            const response = await this.client.post<T>(endpoint, data);
            return response.data;
        } catch (error) {
            this.handleError(error as AxiosError<PlaneErrorResponse>);
        }
    }

    protected async put<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
        try {
            const response = await this.client.put<T>(endpoint, data);
            return response.data;
        } catch (error) {
            this.handleError(error as AxiosError<PlaneErrorResponse>);
        }
    }

    protected async delete<T>(endpoint: string): Promise<T> {
        try {
            const response = await this.client.delete<T>(endpoint);
            return response.data;
        } catch (error) {
            this.handleError(error as AxiosError<PlaneErrorResponse>);
        }
    }

    protected async patch<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
        try {
            const response = await this.client.patch<T>(endpoint, data);
            return response.data;
        } catch (error) {
            this.handleError(error as AxiosError<PlaneErrorResponse>);
        }
    }
} 