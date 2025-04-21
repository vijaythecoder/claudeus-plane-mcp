import { Tool, ToolResponse } from '../../types/mcp.js';
import { CyclesClient } from '../../api/cycles/client.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

export class DeleteCycleTool implements Tool {
  private cyclesClient: CyclesClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_cycles__delete';
  description = 'Deletes an existing cycle from a Plane project';
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
        description: 'The ID of the cycle to delete'
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

    try {
      await this.cyclesClient.deleteCycle(
        workspace_slug,
        input.project_id,
        input.cycle_id
      );

      return {
        content: [{
          type: 'text',
          text: `Successfully deleted cycle ${input.cycle_id} from project ${input.project_id} in workspace ${workspace_slug}.`
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to delete cycle: ${errorMessage}`);
      
      // Provide more helpful error message
      let detailedError = `Failed to delete cycle: ${errorMessage}`;
      if (errorMessage.includes('404')) {
        detailedError += `\n\nPossible reasons for 404 error:\n` +
          `1. The cycle ID "${input.cycle_id}" might not exist\n` +
          `2. The project ID "${input.project_id}" might not exist\n` +
          `3. The workspace "${workspace_slug}" might not exist\n` +
          `4. You might not have permission to delete this cycle`;
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
