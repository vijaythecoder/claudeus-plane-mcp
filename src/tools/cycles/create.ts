import { Tool, ToolResponse } from '../../types/mcp.js';
import { CyclesClient } from '../../api/cycles/client.js';
import { CreateCycleData } from '../../api/cycles/types.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

export class CreateCycleTool implements Tool {
  private cyclesClient: CyclesClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_cycles__create';
  description = 'Creates a new cycle in a Plane project';
  status = 'enabled' as const;
  inputSchema = {
    type: 'object',
    properties: {
      workspace_slug: {
        type: 'string',
        description: 'The slug of the workspace to create the cycle in. If not provided, uses the default workspace.'
      },
      project_id: {
        type: 'string',
        description: 'The ID of the project to create the cycle in'
      },
      name: {
        type: 'string',
        description: 'The name of the cycle'
      },
      description: {
        type: 'string',
        description: 'The description of the cycle'
      },
      start_date: {
        type: 'string',
        format: 'date',
        description: 'The start date of the cycle (YYYY-MM-DD)'
      },
      end_date: {
        type: 'string',
        format: 'date',
        description: 'The end date of the cycle (YYYY-MM-DD)'
      },
      owned_by: {
        type: 'string',
        description: 'The ID of the user who owns the cycle'
      }
    },
    required: ['project_id', 'name']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.cyclesClient = new CyclesClient(this.instance);
  }

  async execute(args: Record<string, unknown>): Promise<ToolResponse> {
    const input = args as {
      workspace_slug?: string;
      project_id: string;
      name: string;
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

    if (!input.name) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Cycle name is required. Please provide a name parameter.'
        }]
      };
    }

    // Prepare cycle data
    const cycleData: CreateCycleData = {
      name: input.name,
      description: input.description,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      owned_by: input.owned_by
    };

    try {
      const response = await this.cyclesClient.create(
        workspace_slug,
        input.project_id,
        cycleData
      );

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to create cycle: ${errorMessage}`);
      
      // Provide more helpful error message
      let detailedError = `Failed to create cycle: ${errorMessage}`;
      if (errorMessage.includes('404')) {
        detailedError += `\n\nPossible reasons for 404 error:\n` +
          `1. The project ID "${input.project_id}" might not exist\n` +
          `2. The workspace "${workspace_slug}" might not exist\n` +
          `3. The API endpoint structure might be incorrect`;
      } else if (errorMessage.includes('400')) {
        detailedError += `\n\nPossible reasons for 400 error:\n` +
          `1. Invalid data format (check date formats: YYYY-MM-DD)\n` +
          `2. Missing required fields\n` +
          `3. Invalid owned_by user ID`;
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
