import { z } from 'zod';
import { Tool, ToolResponse } from '../../types/mcp.js';
import { PlaneApiClient } from '../../api/client.js';

const inputSchema = {
    type: 'object',
    properties: {
        workspace_slug: {
            type: 'string',
            description: 'The workspace to list projects from. If not provided, the default workspace will be used.'
        }
    }
};

const zodInputSchema = z.object({
    workspace_slug: z.string().optional().describe('The workspace to list projects from. If not provided, the default workspace will be used.')
});

interface Project {
    id: string;
    name: string;
    identifier: string;
    [key: string]: unknown;
}

interface PaginatedResponse {
    results: Project[];
    [key: string]: unknown;
}

/**
 * Tool for listing projects in a Plane workspace.
 * If no workspace is specified, the default workspace from the client's configuration will be used.
 */
export class ListProjectsTool implements Tool {
    name = 'claudeus_plane_projects__list';
    description = 'Lists all projects in a Plane workspace';
    inputSchema = inputSchema;

    constructor(private client: PlaneApiClient) {}

    async execute(args: Record<string, unknown>): Promise<ToolResponse> {
        try {
            const input = zodInputSchema.parse(args);
            const workspace = input.workspace_slug || this.client.instance.defaultWorkspace;

            this.client.notify({
                type: 'info',
                message: 'Fetching projects',
                source: this.name,
                data: {}
            });

            const response = await this.client.listProjects(workspace);
            const projects = 'results' in response ? response.results : response;

            this.client.notify({
                type: 'success',
                message: `Successfully retrieved ${projects.length} projects`,
                source: this.name,
                data: {
                    workspace,
                    projectCount: projects.length
                }
            });

            return {
                isError: false,
                content: [{
                    type: 'text',
                    text: `Successfully retrieved ${projects.length} projects: ${JSON.stringify(projects)}`
                }]
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.client.notify({
                type: 'error',
                message: `Failed to list projects: ${errorMessage}`,
                source: this.name,
                data: {
                    error: errorMessage
                }
            });

            return {
                isError: true,
                content: [{
                    type: 'text',
                    text: `Failed to list projects: ${errorMessage}`
                }]
            };
        }
    }
} 