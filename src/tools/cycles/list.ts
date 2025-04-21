import { Tool, ToolResponse } from '../../types/mcp.js';
import { CyclesClient } from '../../api/cycles/client.js';
import { CycleListFilters } from '../../api/cycles/types.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

export class ListCyclesTools implements Tool {
  private cyclesClient: CyclesClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_cycles__list';
  description = 'Lists cycles in a Plane project';
  status = 'enabled' as const;
  inputSchema = {
    type: 'object',
    properties: {
      workspace_slug: {
        type: 'string',
        description: 'The slug of the workspace to list cycles from. If not provided, uses the default workspace.'
      },
      project_id: {
        type: 'string',
        description: 'The ID of the project to list cycles from'
      },
      owned_by: {
        type: 'string',
        description: 'Filter cycles by owner ID'
      },
      start_date: {
        type: 'string',
        format: 'date',
        description: 'Filter cycles by start date (YYYY-MM-DD)'
      },
      end_date: {
        type: 'string',
        format: 'date',
        description: 'Filter cycles by end date (YYYY-MM-DD)'
      },
      per_page: {
        type: 'number',
        description: 'Number of items per page (max 100)',
        default: 100
      },
      cursor: {
        type: 'string',
        description: 'Cursor string for pagination'
      }
    },
    required: ['project_id']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.cyclesClient = new CyclesClient(this.instance);
  }

  async execute(args: Record<string, unknown>): Promise<ToolResponse> {
    // Log the input arguments for debugging
    console.error(`[DEBUG] Cycles list tool called with args: ${JSON.stringify(args)}`);
    
    const input = args as {
      workspace_slug?: string;
      project_id?: string;
      owned_by?: string;
      start_date?: string;
      end_date?: string;
      per_page?: number;
      cursor?: string;
    };

    // Get workspace slug with fallback to default
    let workspace_slug = input.workspace_slug;
    if (!workspace_slug) {
      workspace_slug = this.instance.defaultWorkspace;
      console.error(`[DEBUG] No workspace_slug provided, using default: ${workspace_slug}`);
    }

    const {
      project_id,
      per_page = 100,
      cursor,
      ...filters
    } = input;

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

    // Validate project ID
    if (!project_id) {
      console.error(`[ERROR] No project_id provided`);
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Project ID is required. Please provide a project_id parameter.'
        }]
      };
    }
    
    console.error(`[DEBUG] Using workspace: ${workspace_slug}, project: ${project_id}`);

    try {
      console.error(`[DEBUG] Calling cyclesClient.list with workspace=${workspace_slug}, project=${project_id}`);
      const response = await this.cyclesClient.list(
        workspace_slug,
        project_id,
        filters as CycleListFilters,
        per_page,
        cursor
      );

      console.error(`[DEBUG] Successfully retrieved cycles response`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to list cycles: ${errorMessage}`);
      
      // Provide more helpful error message
      let detailedError = `Failed to list cycles: ${errorMessage}`;
      if (errorMessage.includes('404')) {
        detailedError += `\n\nPossible reasons for 404 error:\n` +
          `1. The project ID "${project_id}" might not exist\n` +
          `2. The workspace "${workspace_slug}" might not exist\n` +
          `3. The API endpoint structure might be incorrect\n` +
          `4. You might not have permission to access this project's cycles`;
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
