import { Tool, ToolResponse } from '../../types/mcp.js';
import { IssueCommentsClient } from '../../api/issue-comments/client.js';
import { UpdateIssueCommentData, IssueCommentAccess } from '../../api/issue-comments/types.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

export class UpdateIssueCommentTool implements Tool {
  private issueCommentsClient: IssueCommentsClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_issue_comments__update';
  description = 'Updates an existing comment for an issue';
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
        description: 'The ID of the issue containing the comment'
      },
      comment_id: {
        type: 'string',
        description: 'The ID of the comment to update'
      },
      comment_html: {
        type: 'string',
        description: 'The new HTML content of the comment'
      },
      access: {
        type: 'string',
        enum: ['INTERNAL', 'EXTERNAL'],
        description: 'The new access level of the comment (INTERNAL or EXTERNAL)'
      }
    },
    required: ['project_id', 'issue_id', 'comment_id']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.issueCommentsClient = new IssueCommentsClient(this.instance);
  }

  async execute(args: Record<string, unknown>): Promise<ToolResponse> {
    // Log the input arguments for debugging
    console.error(`[DEBUG] Update issue comment tool called with args: ${JSON.stringify(args)}`);
    
    const input = args as {
      workspace_slug?: string;
      project_id: string;
      issue_id: string;
      comment_id: string;
      comment_html?: string;
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

    if (!input.comment_id) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Comment ID is required. Please provide a comment_id parameter.'
        }]
      };
    }

    // Check if there's anything to update
    if (!input.comment_html && !input.access) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'No update data provided. Please provide at least one field to update (comment_html or access).'
        }]
      };
    }
    
    console.error(`[DEBUG] Using workspace: ${workspace_slug}, project: ${input.project_id}, issue: ${input.issue_id}, comment: ${input.comment_id}`);

    // Prepare update data
    const updateData: UpdateIssueCommentData = {};
    
    if (input.comment_html !== undefined) updateData.comment_html = input.comment_html;
    if (input.access !== undefined) updateData.access = input.access;

    try {
      const response = await this.issueCommentsClient.updateComment(
        workspace_slug,
        input.project_id,
        input.issue_id,
        input.comment_id,
        updateData
      );

      console.error(`[DEBUG] Successfully updated issue comment`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to update issue comment: ${errorMessage}`);
      
      // Provide more helpful error message
      let detailedError = `Failed to update issue comment: ${errorMessage}`;
      if (errorMessage.includes('404')) {
        detailedError += `\n\nPossible reasons for 404 error:\n` +
          `1. The comment ID "${input.comment_id}" might not exist\n` +
          `2. The issue ID "${input.issue_id}" might not exist\n` +
          `3. The project ID "${input.project_id}" might not exist\n` +
          `4. The workspace "${workspace_slug}" might not exist\n` +
          `5. You might not have permission to update this comment`;
      } else if (errorMessage.includes('400')) {
        detailedError += `\n\nPossible reasons for 400 error:\n` +
          `1. Invalid comment format\n` +
          `2. Invalid access value`;
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
