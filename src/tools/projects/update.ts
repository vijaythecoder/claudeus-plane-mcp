import { z } from 'zod';
import { Tool, ToolResponse } from '../../types/mcp.js';
import { PlaneApiClient } from '../../api/client.js';

const inputSchema = {
    type: 'object',
    properties: {
        workspace_slug: {
            type: 'string',
            description: 'The slug of the workspace containing the project. If not provided, uses the default workspace.'
        },
        project_id: {
            type: 'string',
            description: 'The ID of the project to update (required)'
        },
        // Optional fields - any field can be updated
        name: {
            type: 'string',
            description: 'New name for the project'
        },
        identifier: {
            type: 'string',
            description: 'New unique identifier for the project in the workspace. Example: "PROJ1"'
        },
        description: {
            type: 'string',
            description: 'New description for the project'
        },
        network: {
            type: 'integer',
            description: 'Project visibility: 0 for Secret (private), 2 for Public',
            enum: [0, 2]
        },
        emoji: {
            type: 'string',
            description: 'HTML emoji DEX code without the "&#". Example: "1f680" for rocket'
        },
        icon_prop: {
            type: 'object',
            description: 'Custom icon properties for the project'
        },
        module_view: {
            type: 'boolean',
            description: 'Enable/disable module view for the project'
        },
        cycle_view: {
            type: 'boolean',
            description: 'Enable/disable cycle view for the project'
        },
        issue_views_view: {
            type: 'boolean',
            description: 'Enable/disable project views for the project'
        },
        page_view: {
            type: 'boolean',
            description: 'Enable/disable pages for the project'
        },
        inbox_view: {
            type: 'boolean',
            description: 'Enable/disable intake for the project'
        },
        cover_image: {
            type: 'string',
            description: 'URL for the project cover image'
        },
        archive_in: {
            type: 'integer',
            description: 'Months in which issues should be automatically archived (0-12)',
            minimum: 0,
            maximum: 12
        },
        close_in: {
            type: 'integer',
            description: 'Months in which issues should be auto-closed (0-12)',
            minimum: 0,
            maximum: 12
        },
        default_assignee: {
            type: 'string',
            description: 'UUID of the user who will be the default assignee for issues'
        },
        project_lead: {
            type: 'string',
            description: 'UUID of the user who will lead the project'
        },
        estimate: {
            type: 'string',
            description: 'UUID of the estimate to use for the project'
        },
        default_state: {
            type: 'string',
            description: 'Default state to use when issues are auto-closed'
        }
    },
    required: ['project_id']
};

const zodInputSchema = z.object({
    workspace_slug: z.string().optional(),
    project_id: z.string(),
    // All fields are optional for updates
    name: z.string().optional(),
    identifier: z.string().optional(),
    description: z.string().optional(),
    network: z.number().min(0).max(2).optional(),
    emoji: z.string().optional(),
    icon_prop: z.record(z.unknown()).optional(),
    module_view: z.boolean().optional(),
    cycle_view: z.boolean().optional(),
    issue_views_view: z.boolean().optional(),
    page_view: z.boolean().optional(),
    inbox_view: z.boolean().optional(),
    cover_image: z.string().nullable().optional(),
    archive_in: z.number().min(0).max(12).optional(),
    close_in: z.number().min(0).max(12).optional(),
    default_assignee: z.string().nullable().optional(),
    project_lead: z.string().nullable().optional(),
    estimate: z.string().nullable().optional(),
    default_state: z.string().nullable().optional()
});

export class UpdateProjectTool implements Tool {
    name = 'claudeus_plane_projects__update';
    description = 'Updates an existing project in a workspace. If no workspace is specified, uses the default workspace. Allows updating any project properties including name, visibility, views, and automation settings.';
    status: 'enabled' | 'disabled' = 'enabled';
    inputSchema = inputSchema;

    constructor(private client: PlaneApiClient) {}

    async execute(args: Record<string, unknown>): Promise<ToolResponse> {
        const input = zodInputSchema.parse(args);
        const { workspace_slug, project_id, ...updateData } = input;

        try {
            // Use the workspace from config if not provided
            const workspace = workspace_slug || this.client.instance.defaultWorkspace;
            if (!workspace) {
                throw new Error('No workspace provided or configured');
            }

            this.client.notify({
                type: 'info',
                message: `Updating project ${project_id} in workspace: ${workspace}`,
                source: this.name,
                data: { workspace, project_id, ...updateData }
            });

            const project = await this.client.updateProject(workspace, project_id, updateData);
            
            this.client.notify({
                type: 'info',
                message: `Successfully updated project ${project_id}`,
                data: { 
                    projectId: project.id,
                    workspace
                },
                source: this.name
            });

            return {
                content: [{
                    type: 'text',
                    text: `Successfully updated project (ID: ${project.id}) in workspace "${workspace}"\n\nUpdated project details:\n${JSON.stringify(project, null, 2)}`
                }]
            };
        } catch (error) {
            if (error instanceof Error) {
                this.client.notify({
                    type: 'error',
                    message: `Failed to update project: ${error.message}`,
                    data: { 
                        error: error.message,
                        workspace: workspace_slug,
                        project_id
                    },
                    source: this.name
                });

                return {
                    isError: true,
                    content: [{
                        type: 'text',
                        text: `Failed to update project: ${error.message}`
                    }]
                };
            }
            throw error;
        }
    }
} 
