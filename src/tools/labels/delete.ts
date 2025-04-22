import { Tool, ToolResponse } from '../../types/mcp.js';
import { LabelsClient } from '../../api/labels/client.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

/**
 * Tool for deleting a label
 */
export class DeleteLabelTool implements Tool {
  private labelsClient: LabelsClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_labels__delete';
  description = 'Deletes a label from a project';
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
        description: 'The ID of the label to delete'
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
      await this.labelsClient.deleteLabel(workspaceSlug, project_id, label_id);
      return {
        isError: false,
        content: [{
          type: 'text',
          text: 'Label deleted successfully'
        }]
      };
    } catch (error) {
      console.error(`Error deleting label: ${error instanceof Error ? error.message : String(error)}`);
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Failed to delete label: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}
