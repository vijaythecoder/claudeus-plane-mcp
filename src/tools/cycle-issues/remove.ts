import { Tool, ToolResponse } from '../../types/mcp.js';
import { CycleIssuesClient } from '../../api/cycle-issues/client.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

export class RemoveCycleIssueTool implements Tool {
  private cycleIssuesClient: CycleIssuesClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_cycle_issues__remove';
  description = 'Removes an issue from a cycle';
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
        description: 'The ID of the project containing the cycle'
      },
      cycle_id: {
        type: 'string',
        description: 'The ID of the cycle to remove the issue from'
      },
      issue_id: {
        type: 'string',
        description: 'The ID of the issue to remove from the cycle'
      }
    },
    required: ['project_id', 'cycle_id', 'issue_id']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.cycleIssuesClient = new CycleIssuesClient(this.instance);
  }

  async execute(args: Record<string, unknown>): Promise<ToolResponse> {
    // Log the input arguments for debugging
    console.error(`[DEBUG] Remove cycle issue tool called with args: ${JSON.stringify(args)}`);
    
    const input = args as {
      workspace_slug?: string;
      project_id: string;
      cycle_id: string;
      issue_id: string;
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

    if (!input.issue_id) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Issue ID is required. Please provide an issue_id parameter.'
        }]
      };
    }
    
    console.error(`[DEBUG] Using workspace: ${workspace_slug}, project: ${input.project_id}, cycle: ${input.cycle_id}`);
    console.error(`[DEBUG] Removing issue ${input.issue_id} from cycle`);

    try {
      await this.cycleIssuesClient.removeIssue(
        workspace_slug,
        input.project_id,
        input.cycle_id,
        input.issue_id
      );

      console.error(`[DEBUG] Successfully removed issue from cycle`);
      return {
        content: [{
          type: 'text',
          text: `Successfully removed issue ${input.issue_id} from cycle ${input.cycle_id}.`
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to remove issue from cycle: ${errorMessage}`);
      
      // Provide more helpful error message
      let detailedError = `Failed to remove issue from cycle: ${errorMessage}`;
      if (errorMessage.includes('404')) {
        detailedError += `\n\nPossible reasons for 404 error:\n` +
          `1. The cycle ID "${input.cycle_id}" might not exist\n` +
          `2. The project ID "${input.project_id}" might not exist\n` +
          `3. The issue ID "${input.issue_id}" might not exist in this cycle\n` +
          `4. The workspace "${workspace_slug}" might not exist\n` +
          `5. You might not have permission to modify this cycle`;
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
