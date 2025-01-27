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
    const input = args as {
      workspace_slug?: string;
      project_id: string;
      issue_id: string;
    };

    const {
      workspace_slug = this.instance.defaultWorkspace,
      project_id,
      issue_id
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

    try {
      const response = await this.issuesClient.getIssue(
        workspace_slug,
        project_id,
        issue_id
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
          text: `Failed to get issue: ${errorMessage}`
        }]
      };
    }
  }
} 