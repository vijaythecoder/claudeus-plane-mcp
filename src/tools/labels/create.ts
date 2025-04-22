import { Tool, ToolResponse } from '../../types/mcp.js';
import { LabelsClient } from '../../api/labels/client.js';
import { CreateLabelData } from '../../api/labels/types.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

/**
 * Tool for creating a new label
 */
export class CreateLabelTool implements Tool {
  private labelsClient: LabelsClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_labels__create';
  description = 'Creates a new label in a project';
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
        description: 'The ID of the project to create the label in'
      },
      name: {
        type: 'string',
        description: 'The name of the label'
      },
      description: {
        type: 'string',
        description: 'The description of the label'
      },
      color: {
        type: 'string',
        description: 'The color of the label as a hex code'
      },
      parent: {
        type: 'string',
        description: 'The ID of the parent label'
      }
    },
    required: ['project_id', 'name']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.labelsClient = new LabelsClient(instance);
  }

  /**
   * Execute the tool
   */
  async execute(params: Record<string, any>): Promise<ToolResponse> {
    const { workspace_slug, project_id, name, description, color, parent } = params;
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

    if (!name) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Missing required parameter: name'
        }]
      };
    }
    
    const data: CreateLabelData = {
      name: name,
    };

    if (description) data.description = description;
    if (color) data.color = color;
    if (parent) data.parent = parent;

    try {
      const response = await this.labelsClient.create(workspaceSlug, project_id, data);
      return {
        isError: false,
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error) {
      console.error(`Error creating label: ${error instanceof Error ? error.message : String(error)}`);
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Failed to create label: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}
