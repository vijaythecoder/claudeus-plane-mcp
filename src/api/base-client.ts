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
        
        // Log the base URL from the config
        console.error(`[DEBUG] Using Plane API base URL from config: ${this.baseUrl}`); 
        
        // Keep the full baseUrl including /api/v1 since it's part of the base URL
        const baseURL = this.baseUrl.endsWith('/') 
            ? this.baseUrl.slice(0, -1) // Remove trailing slash if present
            : this.baseUrl;
            
        // Hardcode the API key for testing
        const hardcodedApiKey = 'plane_api_daddab8158ed483085f4d13a564cd8c1';
        console.error(`[DEBUG] Using hardcoded API key: ${hardcodedApiKey.substring(0, 10)}...`);
        
        // Create the Axios client with authentication as per Plane API docs
        this.client = axios.create({
            baseURL,
            headers: {
                'x-api-key': hardcodedApiKey, // Use lowercase header name as shown in the documentation
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        // Add request interceptor to ensure authentication headers are included in every request
        this.client.interceptors.request.use(config => {
            // Ensure headers object exists
            config.headers = config.headers || {};
            
            // Add authentication header with hardcoded API key
            const hardcodedApiKey = 'plane_api_daddab8158ed483085f4d13a564cd8c1';
            config.headers['x-api-key'] = hardcodedApiKey; // Use lowercase header name as shown in the documentation
            
            // Log the full request details for debugging
            console.error(`[DEBUG] Making request to: ${config.baseURL}${config.url}`);
            console.error(`[DEBUG] Full request URL: ${config.baseURL}${config.url}`);
            console.error(`[DEBUG] Method: ${config.method?.toUpperCase()}`);
            
            // Safely log API key with null checks
            const apiKeyPreview = hardcodedApiKey ? (hardcodedApiKey.substring(0, 10) + '...') : 'undefined';
            console.error(`[DEBUG] With headers: ${JSON.stringify({
                'x-api-key': apiKeyPreview
            })}`);
            
            if (config.params) {
                console.error(`[DEBUG] With query params: ${JSON.stringify(config.params)}`);
            }
            
            return config;
        });

        // Add response interceptor for better error handling
        this.client.interceptors.response.use(
            response => response,
            error => {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError<PlaneErrorResponse>;
                    const errorCode = axiosError.response?.status;
                    const errorMessage = axiosError.response?.data?.message || axiosError.message;
                    
                    // Handle different error codes with more specific messages
                    if (errorCode === 401) {
                        throw new Error(`API Error (401): Authentication failed. Please check your API key or ensure it has the necessary permissions.`);
                    } else if (errorCode === 403) {
                        throw new Error(`API Error (403): Forbidden. You don't have permission to access this resource.`);
                    } else if (errorCode === 404) {
                        throw new Error(`API Error (404): Resource not found. Please check the workspace slug, project ID, or issue ID.`);
                    } else if (errorCode === 429) {
                        throw new Error(`API Error (429): Rate limit exceeded. Please try again later.`);
                    } else {
                        throw new Error(`API Error (${errorCode}): ${errorMessage}`);
                    }
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