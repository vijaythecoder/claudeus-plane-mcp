import { z } from 'zod';
import { Tool, ToolResponse } from '../../types/mcp.js';
import { PlaneApiClient } from '../../api/client.js';

const zodInputSchema = z.object({
    workspace_slug: z.string().optional(),
    name: z.string(),
    identifier: z.string(),
    description: z.string().optional(),
    network: z.number().min(0).max(2).optional(),
    emoji: z.string().optional(),
    module_view: z.boolean().optional(),
    cycle_view: z.boolean().optional(),
    issue_views_view: z.boolean().optional(),
    page_view: z.boolean().optional(),
    inbox_view: z.boolean().optional()
});

export class CreateProjectTool implements Tool {
    name = 'claudeus_plane_projects__create';
    description = 'Creates a new project in a Plane workspace';
    inputSchema = {
        type: 'object',
        properties: {
            workspace_slug: {
                type: 'string',
                description: 'The workspace to create the project in. If not provided, the default workspace will be used.'
            },
            name: {
                type: 'string',
                description: 'The name of the project'
            },
            identifier: {
                type: 'string',
                description: 'The unique identifier for the project'
            },
            description: {
                type: 'string',
                description: 'A description of the project'
            },
            network: {
                type: 'number',
                description: 'The network visibility of the project (0: Private, 1: Public, 2: Internal)'
            },
            emoji: {
                type: 'string',
                description: 'The emoji to use for the project'
            },
            module_view: {
                type: 'boolean',
                description: 'Whether to enable module view'
            },
            cycle_view: {
                type: 'boolean',
                description: 'Whether to enable cycle view'
            },
            issue_views_view: {
                type: 'boolean',
                description: 'Whether to enable issue views'
            },
            page_view: {
                type: 'boolean',
                description: 'Whether to enable page view'
            },
            inbox_view: {
                type: 'boolean',
                description: 'Whether to enable inbox view'
            }
        },
        required: ['name', 'identifier']
    };

    constructor(private client: PlaneApiClient) {}

    async execute(args: Record<string, unknown>): Promise<ToolResponse> {
        try {
            const input = zodInputSchema.parse(args);
            const { workspace_slug, ...projectData } = input;
            const workspace = workspace_slug || this.client.instance.defaultWorkspace;

            this.client.notify({
                type: 'info',
                message: `Creating project "${projectData.name}" in workspace: ${workspace}`,
                source: this.name,
                data: {
                    workspace,
                    ...projectData
                }
            });

            try {
                const project = await this.client.createProject(workspace, projectData);
                
                this.client.notify({
                    type: 'success',
                    message: `Successfully created project "${project.name}" (ID: ${project.id}) in workspace "${workspace}"`,
                    source: this.name,
                    data: {
                        workspace,
                        projectId: project.id
                    }
                });

                return {
                    isError: false,
                    content: [{
                        type: 'text',
                        text: `Successfully created project "${project.name}" (ID: ${project.id}) in workspace "${workspace}"`
                    }]
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.client.notify({
                    type: 'error',
                    message: `Failed to create project: ${errorMessage}`,
                    source: this.name,
                    data: {
                        error: errorMessage
                    }
                });

                return {
                    isError: true,
                    content: [{
                        type: 'text',
                        text: `Failed to create project: ${errorMessage}`
                    }]
                };
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                isError: true,
                content: [{
                    type: 'text',
                    text: `Failed to create project: ${errorMessage}`
                }]
            };
        }
    }
} 
