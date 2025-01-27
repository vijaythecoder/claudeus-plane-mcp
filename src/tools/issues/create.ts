import { Tool, ToolResponse } from '../../types/mcp.js';
import { IssuesClient } from '../../api/issues/client.js';
import { CreateIssueData, IssuePriority } from '../../api/issues/types.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

interface CreateIssueInput extends CreateIssueData {
  workspace_slug?: string;
  project_id: string;
}

export class CreateIssueTool implements Tool {
  private issuesClient: IssuesClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_issues__create';
  description = 'Creates a new issue in a Plane project';
  status = 'enabled' as const;
  inputSchema = {
    type: 'object',
    properties: {
      workspace_slug: {
        type: 'string',
        description: 'The slug of the workspace to create the issue in. If not provided, uses the default workspace.'
      },
      project_id: {
        type: 'string',
        description: 'The ID of the project to create the issue in'
      },
      name: {
        type: 'string',
        description: 'The name/title of the issue'
      },
      description_html: {
        type: 'string',
        description: 'The HTML description of the issue'
      },
      priority: {
        type: 'string',
        enum: ['urgent', 'high', 'medium', 'low', 'none'],
        description: 'The priority of the issue',
        default: 'none'
      },
      start_date: {
        type: 'string',
        format: 'date',
        description: 'The start date of the issue (YYYY-MM-DD)'
      },
      target_date: {
        type: 'string',
        format: 'date',
        description: 'The target date of the issue (YYYY-MM-DD)'
      },
      estimate_point: {
        type: 'number',
        description: 'Story points or time estimate for the issue'
      },
      state: {
        type: 'string',
        description: 'The state ID for the issue'
      },
      assignees: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of user IDs to assign to the issue'
      },
      labels: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of label IDs to apply to the issue'
      },
      parent: {
        type: 'string',
        description: 'ID of the parent issue (for sub-issues)'
      },
      is_draft: {
        type: 'boolean',
        description: 'Whether this is a draft issue',
        default: false
      }
    },
    required: ['project_id', 'name']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.issuesClient = new IssuesClient(this.instance);
  }

  async execute(args: Record<string, unknown>): Promise<ToolResponse> {
    // Type cast with validation
    const input = args as unknown as CreateIssueInput;
    if (!this.validateInput(input)) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Invalid input: missing required fields'
        }]
      };
    }

    const {
      workspace_slug = this.instance.defaultWorkspace,
      project_id,
      ...issueData
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

    // Validate name
    if (!issueData.name) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Issue name is required'
        }]
      };
    }

    try {
      const response = await this.issuesClient.create(
        workspace_slug,
        project_id,
        issueData
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
          text: `Failed to create issue: ${errorMessage}`
        }]
      };
    }
  }

  private validateInput(input: unknown): input is CreateIssueInput {
    if (typeof input !== 'object' || input === null) return false;
    const data = input as Record<string, unknown>;
    return typeof data.name === 'string' && typeof data.project_id === 'string';
  }
} 
