import { Tool, ToolResponse } from '../../types/mcp.js';
import { IssuesClient } from '../../api/issues/client.js';
import { UpdateIssueData, IssuePriority } from '../../api/issues/types.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';

interface UpdateIssueInput extends UpdateIssueData {
  workspace_slug?: string;
  project_id: string;
  issue_id: string;
}

export class UpdateIssueTool implements Tool {
  private issuesClient: IssuesClient;
  private instance: PlaneInstanceConfig;

  name = 'claudeus_plane_issues__update';
  description = 'Updates an existing issue in a Plane project';
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
        description: 'The ID of the issue to update'
      },
      name: {
        type: 'string',
        description: 'The new name/title of the issue'
      },
      description_html: {
        type: 'string',
        description: 'The new HTML description of the issue'
      },
      priority: {
        type: 'string',
        enum: ['urgent', 'high', 'medium', 'low', 'none'],
        description: 'The new priority of the issue'
      },
      start_date: {
        type: 'string',
        format: 'date',
        description: 'The new start date of the issue (YYYY-MM-DD)'
      },
      target_date: {
        type: 'string',
        format: 'date',
        description: 'The new target date of the issue (YYYY-MM-DD)'
      },
      estimate_point: {
        type: 'number',
        description: 'The new story points or time estimate for the issue'
      },
      state: {
        type: 'string',
        description: 'The new state ID for the issue'
      },
      assignees: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'New array of user IDs to assign to the issue'
      },
      labels: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'New array of label IDs to apply to the issue'
      },
      parent: {
        type: 'string',
        description: 'New parent issue ID (for sub-issues)'
      },
      is_draft: {
        type: 'boolean',
        description: 'Whether this issue should be marked as draft'
      },
      archived_at: {
        type: 'string',
        format: 'date-time',
        description: 'When to archive the issue (ISO 8601 format)'
      },
      completed_at: {
        type: 'string',
        format: 'date-time',
        description: 'When the issue was completed (ISO 8601 format)'
      }
    },
    required: ['project_id', 'issue_id']
  };

  constructor(instance: PlaneInstanceConfig) {
    this.instance = instance;
    this.issuesClient = new IssuesClient(this.instance);
  }

  async execute(args: Record<string, unknown>): Promise<ToolResponse> {
    // Type cast with validation
    const input = args as unknown as UpdateIssueInput;
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
      issue_id,
      ...updateData
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

    // Validate issue ID
    if (!issue_id) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'Issue ID is required'
        }]
      };
    }

    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: 'At least one field must be provided for update'
        }]
      };
    }

    try {
      const response = await this.issuesClient.update(
        workspace_slug,
        project_id,
        issue_id,
        updateData
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
          text: `Failed to update issue: ${errorMessage}`
        }]
      };
    }
  }

  private validateInput(input: unknown): input is UpdateIssueInput {
    if (typeof input !== 'object' || input === null) return false;
    const data = input as Record<string, unknown>;
    return typeof data.project_id === 'string' && typeof data.issue_id === 'string';
  }
} 