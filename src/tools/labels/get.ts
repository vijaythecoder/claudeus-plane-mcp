import { Tool, ToolResponse } from '../../types/mcp.js';
import { LabelsClient } from '../../api/labels/client.js';
import { LabelResponse } from '../../api/labels/types.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

/**
 * Tool for getting a specific label by ID
 */
export class GetLabelTool implements Tool {
  private labelsClient: LabelsClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_labels__get';
  description = 'Gets a single label by ID';
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
        description: 'The ID of the project containing the label'
      },
      label_id: {
        type: 'string',
        description: 'The ID of the label to retrieve'
      }
    },
    required: ['project_id', 'label_id']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.labelsClient = new LabelsClient(instance);
  }

  /**
   * Execute the tool
   */
  async execute(params: Record<string, any>): Promise<ToolResponse> {
    const { workspace_slug, project_id, label_id } = params;
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

    if (!label_id) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Missing required parameter: label_id'
        }]
      };
    }

    try {
      const response = await this.labelsClient.getLabel(workspaceSlug, project_id, label_id);
      return {
        isError: false,
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error) {
      console.error(`Error getting label: ${error instanceof Error ? error.message : String(error)}`);
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Failed to get label: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}
