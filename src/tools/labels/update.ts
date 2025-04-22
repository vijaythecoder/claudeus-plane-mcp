import { Tool, ToolResponse } from '../../types/mcp.js';
import { LabelsClient } from '../../api/labels/client.js';
import { UpdateLabelData } from '../../api/labels/types.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

/**
 * Tool for updating an existing label
 */
export class UpdateLabelTool implements Tool {
  private labelsClient: LabelsClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_labels__update';
  description = 'Updates an existing label';
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
        description: 'The ID of the label to update'
      },
      name: {
        type: 'string',
        description: 'The new name of the label'
      },
      description: {
        type: 'string',
        description: 'The new description of the label'
      },
      color: {
        type: 'string',
        description: 'The new color of the label as a hex code'
      },
      parent: {
        type: 'string',
        description: 'The new parent label ID, or null to remove parent'
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
    const { workspace_slug, project_id, label_id, name, description, color, parent } = params;
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
    
    const data: UpdateLabelData = {};

    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (color !== undefined) data.color = color;
    if (parent !== undefined) data.parent = parent;

    // Check if at least one field is being updated
    if (Object.keys(data).length === 0) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'At least one field must be provided to update the label'
        }]
      };
    }

    try {
      const response = await this.labelsClient.update(workspaceSlug, project_id, label_id, data);
      return {
        isError: false,
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error) {
      console.error(`Error updating label: ${error instanceof Error ? error.message : String(error)}`);
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Failed to update label: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}
