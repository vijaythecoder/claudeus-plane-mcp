import { Tool, ToolResponse } from '../../types/mcp.js';
import { IssueCommentsClient } from '../../api/issue-comments/client.js';
import { CreateIssueCommentData, IssueCommentAccess } from '../../api/issue-comments/types.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

export class CreateIssueCommentTool implements Tool {
  private issueCommentsClient: IssueCommentsClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_issue_comments__create';
  description = 'Creates a new comment for an issue';
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
        description: 'The ID of the issue to add a comment to'
      },
      comment_html: {
        type: 'string',
        description: 'The HTML content of the comment'
      },
      access: {
        type: 'string',
        enum: ['INTERNAL', 'EXTERNAL'],
        description: 'The access level of the comment (INTERNAL or EXTERNAL)',
        default: 'INTERNAL'
      }
    },
    required: ['project_id', 'issue_id', 'comment_html']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.issueCommentsClient = new IssueCommentsClient(this.instance);
  }

  async execute(args: Record<string, unknown>): Promise<ToolResponse> {
    // Log the input arguments for debugging
    console.error(`[DEBUG] Create issue comment tool called with args: ${JSON.stringify(args)}`);
    
    const input = args as {
      workspace_slug?: string;
      project_id: string;
      issue_id: string;
      comment_html: string;
      access?: IssueCommentAccess;
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

    if (!input.issue_id) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Issue ID is required. Please provide an issue_id parameter.'
        }]
      };
    }

    if (!input.comment_html) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Comment HTML is required. Please provide a comment_html parameter.'
        }]
      };
    }
    
    console.error(`[DEBUG] Using workspace: ${workspace_slug}, project: ${input.project_id}, issue: ${input.issue_id}`);

    // Prepare comment data
    const commentData: CreateIssueCommentData = {
      comment_html: input.comment_html,
      access: input.access || 'INTERNAL'
    };

    try {
      const response = await this.issueCommentsClient.createComment(
        workspace_slug,
        input.project_id,
        input.issue_id,
        commentData
      );

      console.error(`[DEBUG] Successfully created issue comment`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to create issue comment: ${errorMessage}`);
      
      // Provide more helpful error message
      let detailedError = `Failed to create issue comment: ${errorMessage}`;
      if (errorMessage.includes('404')) {
        detailedError += `\n\nPossible reasons for 404 error:\n` +
          `1. The issue ID "${input.issue_id}" might not exist\n` +
          `2. The project ID "${input.project_id}" might not exist\n` +
          `3. The workspace "${workspace_slug}" might not exist\n` +
          `4. You might not have permission to add comments to this issue`;
      } else if (errorMessage.includes('400')) {
        detailedError += `\n\nPossible reasons for 400 error:\n` +
          `1. Invalid comment format\n` +
          `2. Missing required fields`;
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
