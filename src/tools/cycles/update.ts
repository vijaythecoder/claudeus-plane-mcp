import { Tool, ToolResponse } from '../../types/mcp.js';
import { CyclesClient } from '../../api/cycles/client.js';
import { UpdateCycleData } from '../../api/cycles/types.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

export class UpdateCycleTool implements Tool {
  private cyclesClient: CyclesClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_cycles__update';
  description = 'Updates an existing cycle in a Plane project';
  status = 'enabled' as const;
  inputSchema = {
    type: 'object',
    properties: {
      workspace_slug: {
        type: 'string',
        description: 'The slug of the workspace containing the cycle. If not provided, uses the default workspace.'
      },
      project_id: {
        type: 'string',
        description: 'The ID of the project containing the cycle'
      },
      cycle_id: {
        type: 'string',
        description: 'The ID of the cycle to update'
      },
      name: {
        type: 'string',
        description: 'The new name of the cycle'
      },
      description: {
        type: 'string',
        description: 'The new description of the cycle'
      },
      start_date: {
        type: 'string',
        format: 'date',
        description: 'The new start date of the cycle (YYYY-MM-DD)'
      },
      end_date: {
        type: 'string',
        format: 'date',
        description: 'The new end date of the cycle (YYYY-MM-DD)'
      },
      owned_by: {
        type: 'string',
        description: 'The new owner ID of the cycle'
      }
    },
    required: ['project_id', 'cycle_id']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.cyclesClient = new CyclesClient(this.instance);
  }

  async execute(args: Record<string, unknown>): Promise<ToolResponse> {
    const input = args as {
      workspace_slug?: string;
      project_id: string;
      cycle_id: string;
      name?: string;
      description?: string;
      start_date?: string;
      end_date?: string;
      owned_by?: string;
    };

    // Get workspace slug with fallback to default
    let workspace_slug = input.workspace_slug;
    if (!workspace_slug) {
      workspace_slug = this.instance.defaultWorkspace;
      console.error(`[DEBUG] No workspace_slug provided, using default: ${workspace_slug}`);
    }

    // Validate workspace
    if (!workspace_slug) {
      console.error(`[ERROR] No workspace slug available, neither provided nor default`);
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Workspace slug is required. Please provide a workspace_slug or configure a default workspace.'
        }]
      };
    }

    // Validate required fields
    if (!input.project_id) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Project ID is required. Please provide a project_id parameter.'
        }]
      };
    }

    if (!input.cycle_id) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Cycle ID is required. Please provide a cycle_id parameter.'
        }]
      };
    }

    // Check if there's anything to update
    if (!input.name && !input.description && !input.start_date && 
        !input.end_date && !input.owned_by) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'No update data provided. Please provide at least one field to update.'
        }]
      };
    }

    // Prepare update data
    const updateData: UpdateCycleData = {};
    
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.start_date !== undefined) updateData.start_date = input.start_date;
    if (input.end_date !== undefined) updateData.end_date = input.end_date;
    if (input.owned_by !== undefined) updateData.owned_by = input.owned_by;

    try {
      const response = await this.cyclesClient.update(
        workspace_slug,
        input.project_id,
        input.cycle_id,
        updateData
      );

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to update cycle: ${errorMessage}`);
      
      // Provide more helpful error message
      let detailedError = `Failed to update cycle: ${errorMessage}`;
      if (errorMessage.includes('404')) {
        detailedError += `\n\nPossible reasons for 404 error:\n` +
          `1. The cycle ID "${input.cycle_id}" might not exist\n` +
          `2. The project ID "${input.project_id}" might not exist\n` +
          `3. The workspace "${workspace_slug}" might not exist\n` +
          `4. You might not have permission to access this cycle`;
      } else if (errorMessage.includes('400')) {
        detailedError += `\n\nPossible reasons for 400 error:\n` +
          `1. Invalid data format (check date formats: YYYY-MM-DD)\n` +
          `2. Invalid owned_by user ID`;
      }
      
      return {
        isError: true,
        content: [{
          type: 'text',
          text: detailedError
        }]
      };
    }
  }
}
