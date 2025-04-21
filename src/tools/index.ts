import { ToolWithClass } from '../types/mcp.js';
import { ListProjectsTool } from './projects/list.js';
import { CreateProjectTool } from './projects/create.js';
import { UpdateProjectTool } from './projects/update.js';
import { DeleteProjectTool } from './projects/delete.js';
import { ListIssuesTools } from './issues/list.js';
import { CreateIssueTool } from './issues/create.js';
import { GetIssueTool } from './issues/get.js';
import { UpdateIssueTool } from './issues/update.js';

// Export all tools with their classes
export const allTools: ToolWithClass[] = [
  {
    name: 'claudeus_plane_projects__list',
    description: 'Lists all projects in a Plane workspace. If no workspace is specified, lists projects from the default workspace.',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace to list projects from. If not provided, uses the default workspace.'
        },
        include_archived: {
          type: 'boolean',
          description: 'Whether to include archived projects',
          default: false
        }
      }
    },
    class: ListProjectsTool
  },
  {
    name: 'claudeus_plane_projects__create',
    description: 'Creates a new project in a workspace. If no workspace is specified, uses the default workspace.',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace to create the project in. If not provided, uses the default workspace.'
        },
        name: {
          type: 'string',
          description: 'The name of the project'
        },
        identifier: {
          type: 'string',
          description: 'The unique identifier for the project'
        },
        description: {
          type: 'string',
          description: 'A description of the project'
        }
      },
      required: ['name', 'identifier']
    },
    class: CreateProjectTool
  },
  {
    name: 'claudeus_plane_projects__update',
    description: 'Updates an existing project in a workspace. If no workspace is specified, uses the default workspace.',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace to update the project in. If not provided, uses the default workspace.'
        },
        project_id: {
          type: 'string',
          description: 'The ID of the project to update.'
        },
        name: {
          type: 'string',
          description: 'The new name of the project.'
        },
        description: {
          type: 'string',
          description: 'The new description of the project.'
        },
        start_date: {
          type: 'string',
          format: 'date',
          description: 'The new start date of the project.'
        },
        end_date: {
          type: 'string',
          format: 'date',
          description: 'The new end date of the project.'
        },
        status: {
          type: 'string',
          description: 'The new status of the project.'
        }
      },
      required: ['project_id']
    },
    class: UpdateProjectTool
  },
  {
    name: 'claudeus_plane_projects__delete',
    description: 'Deletes an existing project in a workspace. If no workspace is specified, uses the default workspace.',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace to delete the project from. If not provided, uses the default workspace.'
        },
        project_id: {
          type: 'string',
          description: 'The ID of the project to delete.'
        }
      },
      required: ['project_id']
    },
    class: DeleteProjectTool
  },
  {
    name: 'claudeus_plane_issues__list',
    description: 'Lists issues in a Plane project',
    status: 'enabled',
    inputSchema: {
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
    },
    class: ListIssuesTools
  },
  {
    name: 'claudeus_plane_issues__create',
    description: 'Creates a new issue in a Plane project',
    status: 'enabled',
    inputSchema: {
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
    },
    class: CreateIssueTool
  },
  {
    name: 'claudeus_plane_issues__get',
    description: 'Gets a single issue by ID from a Plane project',
    status: 'enabled',
    inputSchema: {
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
    },
    class: GetIssueTool
  },
  {
    name: 'claudeus_plane_issues__update',
    description: 'Updates an existing issue in a Plane project',
    status: 'enabled',
    inputSchema: {
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
    },
    class: UpdateIssueTool
  }
];

// Define tool capabilities
export const toolCapabilities = {
  // Projects
  claudeus_plane_projects__list: true,
  claudeus_plane_projects__get: false, // Coming soon
  claudeus_plane_projects__create: true,
  claudeus_plane_projects__update: true,
  claudeus_plane_projects__delete: true,
  
  // Issues
  claudeus_plane_issues__list: true,
  claudeus_plane_issues__get: true,
  claudeus_plane_issues__create: true,
  claudeus_plane_issues__update: true,
  claudeus_plane_issues__delete: false, // Coming soon
  
  // Cycles (Coming soon)
  claudeus_plane_cycles__list: false,
  claudeus_plane_cycles__get: false,
  claudeus_plane_cycles__create: false,
  claudeus_plane_cycles__update: false,
  claudeus_plane_cycles__delete: false,
  
  // Modules (Coming soon)
  claudeus_plane_modules__list: false,
  claudeus_plane_modules__get: false,
  claudeus_plane_modules__create: false,
  claudeus_plane_modules__update: false,
  claudeus_plane_modules__delete: false
}; 