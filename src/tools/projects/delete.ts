import { z } from 'zod';
import { Tool, ToolResponse } from '../../types/mcp.js';
import { PlaneApiClient } from '../../api/client.js';

const inputSchema = {
    type: 'object',
    properties: {
        workspace_slug: {
            type: 'string',
            description: 'The slug of the workspace to delete the project from. If not provided, uses the default workspace.'
        },
        project_id: {
            type: 'string',
            description: 'The ID of the project to delete.'
        }
    },
    required: ['project_id']
};

const zodInputSchema = z.object({
    workspace_slug: z.string().optional(),
    project_id: z.string()
});

export class DeleteProjectTool implements Tool {
    name = 'claudeus_plane_projects__delete';
    description = 'Deletes an existing project in a workspace. If no workspace is specified, uses the default workspace.';
    status: 'enabled' | 'disabled' = 'enabled';
    inputSchema = inputSchema;

    constructor(private client: PlaneApiClient) {}

    async execute(args: Record<string, unknown>): Promise<ToolResponse> {
        const input = zodInputSchema.parse(args);
        const { workspace_slug, project_id } = input;

        try {
            const workspace = workspace_slug || this.client.instance.defaultWorkspace;
            if (!workspace) {
                throw new Error('No workspace provided or configured');
            }

            await this.client.deleteProject(workspace, project_id);
            
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({ 
                        success: true, 
                        message: 'Project deleted successfully',
                        project_id,
                        workspace
                    }, null, 2)
                }]
            };
        } catch (error) {
            if (error instanceof Error) {
                const workspace = workspace_slug || this.client.instance.defaultWorkspace;
                this.client.notify({
                    type: 'error',
                    message: `Failed to delete project: ${error.message}`,
                    source: this.name,
                    data: { 
                        error: error.message,
                        workspace,
                        project_id
                    }
                });

                return {
                    isError: true,
                    content: [{
                        type: 'text',
                        text: `Error: ${error.message}`
                    }]
                };
            }
            throw error;
        }
    }
} 
