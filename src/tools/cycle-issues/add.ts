import { Tool, ToolResponse } from '../../types/mcp.js';
import { CycleIssuesClient } from '../../api/cycle-issues/client.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

export class AddCycleIssuesTool implements Tool {
  private cycleIssuesClient: CycleIssuesClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_cycle_issues__add';
  description = 'Adds issues to a cycle';
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
        description: 'The ID of the cycle to add issues to'
      },
      issue_ids: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of issue IDs to add to the cycle'
      }
    },
    required: ['project_id', 'cycle_id', 'issue_ids']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.cycleIssuesClient = new CycleIssuesClient(this.instance);
  }

  async execute(args: Record<string, unknown>): Promise<ToolResponse> {
    // Log the input arguments for debugging
    console.error(`[DEBUG] Add cycle issues tool called with args: ${JSON.stringify(args)}`);
    
    const input = args as {
      workspace_slug?: string;
      project_id: string;
      cycle_id: string;
      issue_ids: string[];
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

    if (!input.issue_ids || input.issue_ids.length === 0) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'At least one issue ID is required. Please provide issue_ids parameter.'
        }]
      };
    }
    
    console.error(`[DEBUG] Using workspace: ${workspace_slug}, project: ${input.project_id}, cycle: ${input.cycle_id}`);
    console.error(`[DEBUG] Adding ${input.issue_ids.length} issues to cycle`);

    try {
      const response = await this.cycleIssuesClient.addIssues(
        workspace_slug,
        input.project_id,
        input.cycle_id,
        input.issue_ids
      );

      console.error(`[DEBUG] Successfully added issues to cycle`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to add issues to cycle: ${errorMessage}`);
      
      // Provide more helpful error message
      let detailedError = `Failed to add issues to cycle: ${errorMessage}`;
      if (errorMessage.includes('404')) {
        detailedError += `\n\nPossible reasons for 404 error:\n` +
          `1. The cycle ID "${input.cycle_id}" might not exist\n` +
          `2. The project ID "${input.project_id}" might not exist\n` +
          `3. The workspace "${workspace_slug}" might not exist\n` +
          `4. You might not have permission to modify this cycle`;
      } else if (errorMessage.includes('400')) {
        detailedError += `\n\nPossible reasons for 400 error:\n` +
          `1. One or more of the issue IDs might not exist\n` +
          `2. The issues might already be in the cycle\n` +
          `3. The issues might belong to a different project`;
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
