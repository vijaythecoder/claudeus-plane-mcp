import { Tool, ToolResponse } from '../../types/mcp.js';
import { IssuesClient } from '../../api/issues/client.js';
import { IssueListFilters, IssueListResponse, IssuePriority } from '../../api/issues/types.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

export class ListIssuesTools implements Tool {
  private issuesClient: IssuesClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_issues__list';
  description = 'Lists issues in a Plane project';
  status = 'enabled' as const;
  inputSchema = {
    type: 'object',
    properties: {
      workspace_slug: {
        type: 'string',
        description: 'The slug of the workspace to list issues from. If not provided, uses the default workspace.'
      },
      project_id: {
        type: 'string',
        description: 'The ID of the project to list issues from'
      },
      state: {
        type: 'string',
        description: 'Filter issues by state ID'
      },
      priority: {
        type: 'string',
        enum: ['urgent', 'high', 'medium', 'low', 'none'],
        description: 'Filter issues by priority'
      },
      assignee: {
        type: 'string',
        description: 'Filter issues by assignee ID'
      },
      label: {
        type: 'string',
        description: 'Filter issues by label ID'
      },
      created_by: {
        type: 'string',
        description: 'Filter issues by creator ID'
      },
      start_date: {
        type: 'string',
        format: 'date',
        description: 'Filter issues by start date (YYYY-MM-DD)'
      },
      target_date: {
        type: 'string',
        format: 'date',
        description: 'Filter issues by target date (YYYY-MM-DD)'
      },
      subscriber: {
        type: 'string',
        description: 'Filter issues by subscriber ID'
      },
      is_draft: {
        type: 'boolean',
        description: 'Filter draft issues',
        default: false
      },
      archived: {
        type: 'boolean',
        description: 'Filter archived issues',
        default: false
      },
      page: {
        type: 'number',
        description: 'Page number (1-based)',
        default: 1
      },
      per_page: {
        type: 'number',
        description: 'Number of items per page',
        default: 100
      }
    },
    required: ['project_id']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.issuesClient = new IssuesClient(this.instance);
  }

  async execute(args: Record<string, unknown>): Promise<ToolResponse> {
    // Log the input arguments for debugging
    console.error(`[DEBUG] Issues list tool called with args: ${JSON.stringify(args)}`);
    
    const input = args as {
      workspace_slug?: string;
      project_id?: string;
      state?: string;
      priority?: IssuePriority;
      assignee?: string;
      label?: string;
      created_by?: string;
      start_date?: string;
      target_date?: string;
      subscriber?: string;
      is_draft?: boolean;
      archived?: boolean;
      page?: number;
      per_page?: number;
    };

    // Get workspace slug with fallback to default
    let workspace_slug = input.workspace_slug;
    if (!workspace_slug) {
      workspace_slug = this.instance.defaultWorkspace;
      console.error(`[DEBUG] No workspace_slug provided, using default: ${workspace_slug}`);
    }

    const {
      project_id,
      page = 1,
      per_page = 100,
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
    console.error(`[DEBUG] Instance details: ${JSON.stringify({
      baseUrl: this.instance.baseUrl,
      defaultWorkspace: this.instance.defaultWorkspace,
      hasApiKey: !!this.instance.apiKey
    })}`);


    try {
      console.error(`[DEBUG] Calling issuesClient.list with workspace=${workspace_slug}, project=${project_id}`);
      const response = await this.issuesClient.list(
        workspace_slug,
        project_id,
        filters as IssueListFilters,
        page,
        per_page
      );

      console.error(`[DEBUG] Successfully retrieved issues response`);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to list issues: ${errorMessage}`);
      
      // Provide more helpful error message
      let detailedError = `Failed to list issues: ${errorMessage}`;
      if (errorMessage.includes('404')) {
        detailedError += `\n\nPossible reasons for 404 error:\n` +
          `1. The project ID "${project_id}" might not exist\n` +
          `2. The workspace "${workspace_slug}" might not exist\n` +
          `3. The API endpoint structure might be incorrect\n` +
          `4. You might not have permission to access this project's issues`;
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
