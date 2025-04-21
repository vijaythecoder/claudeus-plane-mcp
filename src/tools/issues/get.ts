import { Tool, ToolResponse } from '../../types/mcp.js';
import { IssuesClient } from '../../api/issues/client.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

export class GetIssueTool implements Tool {
  private issuesClient: IssuesClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_issues__get';
  description = 'Gets a single issue by ID from a Plane project';
  status = 'enabled' as const;
  inputSchema = {
    type: 'object',
    properties: {
      workspace_slug: {
        type: 'string',
        description: 'The slug of the workspace containing the issue. If not provided, uses the default workspace.'
      },
      project_id: {
        type: 'string',
        description: 'The ID of the project containing the issue'
      },
      issue_id: {
        type: 'string',
        description: 'The ID of the issue to retrieve'
      }
    },
    required: ['project_id', 'issue_id']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.issuesClient = new IssuesClient(this.instance);
  }

  async execute(args: Record<string, unknown>): Promise<ToolResponse> {
    // Log the input arguments for debugging
    console.error(`[DEBUG] Get issue tool called with args: ${JSON.stringify(args)}`);
    
    const input = args as {
      workspace_slug?: string;
      project_id?: string;
      issue_id?: string;
    };

    // Get workspace slug with fallback to default
    let workspace_slug = input.workspace_slug;
    if (!workspace_slug) {
      workspace_slug = this.instance.defaultWorkspace;
      console.error(`[DEBUG] No workspace_slug provided, using default: ${workspace_slug}`);
    }

    const {
      project_id,
      issue_id
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

    // Validate issue ID
    if (!issue_id) {
      console.error(`[ERROR] No issue_id provided`);
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Issue ID is required. Please provide an issue_id parameter.'
        }]
      };
    }
    
    console.error(`[DEBUG] Using workspace: ${workspace_slug}, project: ${project_id}, issue: ${issue_id}`);
    console.error(`[DEBUG] Instance details: ${JSON.stringify({
      baseUrl: this.instance.baseUrl,
      defaultWorkspace: this.instance.defaultWorkspace,
      hasApiKey: !!this.instance.apiKey
    })}`);

    try {
      console.error(`[DEBUG] Calling issuesClient.getIssue with workspace=${workspace_slug}, project=${project_id}, issue=${issue_id}`);
      const response = await this.issuesClient.getIssue(
        workspace_slug,
        project_id,
        issue_id
      );

      console.error(`[DEBUG] Successfully retrieved issue response`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to get issue: ${errorMessage}`);
      
      // Provide more helpful error message
      let detailedError = `Failed to get issue: ${errorMessage}`;
      if (errorMessage.includes('404')) {
        detailedError += `\n\nPossible reasons for 404 error:\n` +
          `1. The issue ID "${issue_id}" might not exist\n` +
          `2. The project ID "${project_id}" might not exist\n` +
          `3. The workspace "${workspace_slug}" might not exist\n` +
          `4. The API endpoint structure might be incorrect\n` +
          `5. You might not have permission to access this issue`;
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