import { BaseApiClient } from './base-client.js';
import { PlaneInstanceConfig } from './types/config.js';
import { PromptContext } from '../types/prompt.js';

export interface NotificationOptions {
    type: 'info' | 'error' | 'warning' | 'success';
    message: string;
    source: string;
    data?: Record<string, unknown>;
}

export interface ToolExecutionOptions {
    progressToken: string;
    workspace?: string;
}

export interface CreateProjectData {
    name: string;
    identifier: string;
    description?: string;
    network?: number;
    emoji?: string;
    icon_prop?: Record<string, unknown>;
    module_view?: boolean;
    cycle_view?: boolean;
    issue_views_view?: boolean;
    page_view?: boolean;
    inbox_view?: boolean;
    cover_image?: string | null;
    archive_in?: number;
    close_in?: number;
    default_assignee?: string | null;
    project_lead?: string | null;
    estimate?: string | null;
    default_state?: string | null;
    [key: string]: unknown | undefined;
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
    network?: number;
    emoji?: string;
    icon_prop?: Record<string, unknown>;
    module_view?: boolean;
    cycle_view?: boolean;
    issue_views_view?: boolean;
    page_view?: boolean;
    inbox_view?: boolean;
    cover_image?: string | null;
    archive_in?: number;
    close_in?: number;
    default_assignee?: string | null;
    project_lead?: string | null;
    estimate?: string | null;
    default_state?: string | null;
    [key: string]: unknown | undefined;
}

interface Project {
    id: string;
    name: string;
    identifier: string;
    description?: string;
    network?: number;
    emoji?: string;
    icon_prop?: Record<string, unknown>;
    module_view?: boolean;
    cycle_view?: boolean;
    issue_views_view?: boolean;
    page_view?: boolean;
    inbox_view?: boolean;
    cover_image?: string | null;
    archive_in?: number;
    close_in?: number;
    default_assignee?: string | null;
    project_lead?: string | null;
    estimate?: string | null;
    default_state?: string | null;
    [key: string]: unknown | undefined;
}

interface PaginatedResponse {
    results: Project[];
    count: number;
    next: string | null;
    previous: string | null;
    [key: string]: unknown;
}

export class PlaneApiClient extends BaseApiClient {
    protected _instance: PlaneInstanceConfig;

    constructor(instance: PlaneInstanceConfig, private context: PromptContext) {
        super(instance);
        this._instance = instance;
    }

    get instance(): PlaneInstanceConfig {
        return this._instance;
    }

    notify(options: NotificationOptions) {
        // Format notification as a JSON-RPC notification message
        const notification = {
            jsonrpc: '2.0',
            method: 'notification',
            params: {
                type: options.type,
                message: options.message,
                source: options.source,
                data: options.data || {}
            }
        };

        // Send the notification as a JSON string
        process.stdout.write(JSON.stringify(notification) + '\n');
    }

    async listProjects(workspace: string): Promise<Project[] | PaginatedResponse> {
        return this.get(`/workspaces/${workspace}/projects`);
    }

    async createProject(workspaceSlug: string, data: CreateProjectData): Promise<Project> {
        const response = await this.post<Project | PaginatedResponse>(`/workspaces/${workspaceSlug}/projects`, data);
        
        if (!response) {
            throw new Error('Failed to create project: No response from server');
        }

        // Handle paginated response
        if ('results' in response && Array.isArray(response.results)) {
            // Find the newly created project in the results
            const project = response.results.find(p => p.name === data.name && p.identifier === data.identifier);
            if (project) {
                return project;
            }
        }
        
        // Handle direct project response
        if ('id' in response) {
            return response as Project;
        }
        
        throw new Error('Failed to create project: Invalid response format from server');
    }

    async updateProject(workspaceSlug: string, projectId: string, data: UpdateProjectData): Promise<Project> {
        return this.put(`/workspaces/${workspaceSlug}/projects/${projectId}`, data);
    }

    async deleteProject(workspaceSlug: string, projectId: string): Promise<void> {
        await this.delete(`/workspaces/${workspaceSlug}/projects/${projectId}`);
    }

    async executeTool(toolName: string, options: ToolExecutionOptions): Promise<{ content: Array<{ text: string }> }> {
        // This is a mock implementation - the actual implementation will be provided by the MCP server
        return {
            content: [{
                text: '[]' // Default empty array as JSON string
            }]
        };
    }
} 