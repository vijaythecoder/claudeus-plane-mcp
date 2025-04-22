import { Tool, ToolResponse } from '../../types/mcp.js';
import { LabelsClient } from '../../api/labels/client.js';
import { LabelsListResponse } from '../../api/labels/types.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

/**
 * Tool for listing all labels in a project
 */
export class ListLabelsTools implements Tool {
  private labelsClient: LabelsClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_labels__list';
  description = 'Lists all labels in a project';
  status = 'enabled' as const;
  inputSchema = {
    type: 'object',
    properties: {
      workspace_slug: {
        type: 'string',
        description: 'The slug of the workspace. If not provided, uses the default workspace.'
      },
      project_id: {
        type: 'string',
        description: 'The ID of the project to list labels from'
      }
    },
    required: ['project_id']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.labelsClient = new LabelsClient(instance);
  }

  /**
   * Execute the tool
   */
  async execute(params: Record<string, any>): Promise<ToolResponse> {
    const { workspace_slug, project_id } = params;
    const workspaceSlug = workspace_slug || this.instance.defaultWorkspace;

    if (!project_id) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Missing required parameter: project_id'
        }]
      };
    }

    try {
      const response = await this.labelsClient.list(workspaceSlug, project_id);
      return {
        isError: false,
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error) {
      console.error(`Error listing labels: ${error instanceof Error ? error.message : String(error)}`);
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Failed to list labels: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}
