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
      page_size: {
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
    const input = args as {
      workspace_slug?: string;
      project_id: string;
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
      page_size?: number;
    };

    const {
      workspace_slug = this.instance.defaultWorkspace,
      project_id,
      page = 1,
      page_size = 100,
      ...filters
    } = input;

    // Validate workspace
    if (!workspace_slug) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Workspace slug is required'
        }]
      };
    }

    // Validate project ID
    if (!project_id) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Project ID is required'
        }]
      };
    }

    try {
      const response = await this.issuesClient.list(
        workspace_slug,
        project_id,
        filters as IssueListFilters,
        page,
        page_size
      );

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response)
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Failed to list issues: ${errorMessage}`
        }]
      };
    }
  }
} 
