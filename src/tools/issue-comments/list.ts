import { Tool, ToolResponse } from '../../types/mcp.js';
import { IssueCommentsClient } from '../../api/issue-comments/client.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

export class ListIssueCommentsTools implements Tool {
  private issueCommentsClient: IssueCommentsClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_issue_comments__list';
  description = 'Lists all comments for an issue';
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
        description: 'The ID of the project containing the issue'
      },
      issue_id: {
        type: 'string',
        description: 'The ID of the issue to list comments from'
      }
    },
    required: ['project_id', 'issue_id']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.issueCommentsClient = new IssueCommentsClient(this.instance);
  }

  async execute(args: Record<string, unknown>): Promise<ToolResponse> {
    // Log the input arguments for debugging
    console.error(`[DEBUG] Issue comments list tool called with args: ${JSON.stringify(args)}`);
    
    const input = args as {
      workspace_slug?: string;
      project_id: string;
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

    // Validate project ID and issue ID
    if (!input.project_id) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Project ID is required. Please provide a project_id parameter.'
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
    
    console.error(`[DEBUG] Using workspace: ${workspace_slug}, project: ${input.project_id}, issue: ${input.issue_id}`);

    try {
      console.error(`[DEBUG] Calling issueCommentsClient.list with workspace=${workspace_slug}, project=${input.project_id}, issue=${input.issue_id}`);
      const response = await this.issueCommentsClient.list(
        workspace_slug,
        input.project_id,
        input.issue_id
      );

      console.error(`[DEBUG] Successfully retrieved issue comments response`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to list issue comments: ${errorMessage}`);
      
      // Provide more helpful error message
      let detailedError = `Failed to list issue comments: ${errorMessage}`;
      if (errorMessage.includes('404')) {
        detailedError += `\n\nPossible reasons for 404 error:\n` +
          `1. The issue ID "${input.issue_id}" might not exist\n` +
          `2. The project ID "${input.project_id}" might not exist\n` +
          `3. The workspace "${workspace_slug}" might not exist\n` +
          `4. You might not have permission to access this issue's comments`;
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
