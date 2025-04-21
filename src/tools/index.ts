import { ToolWithClass } from '../types/mcp.js';
import { ListProjectsTool } from './projects/list.js';
import { CreateProjectTool } from './projects/create.js';
import { UpdateProjectTool } from './projects/update.js';
import { DeleteProjectTool } from './projects/delete.js';
import { ListIssuesTools } from './issues/list.js';
import { CreateIssueTool } from './issues/create.js';
import { GetIssueTool } from './issues/get.js';
import { UpdateIssueTool } from './issues/update.js';
import { ListCyclesTools } from './cycles/list.js';
import { GetCycleTool } from './cycles/get.js';
import { CreateCycleTool } from './cycles/create.js';
import { UpdateCycleTool } from './cycles/update.js';
import { DeleteCycleTool } from './cycles/delete.js';
import { ListCycleIssuesTools } from './cycle-issues/list.js';
import { AddCycleIssuesTool } from './cycle-issues/add.js';
import { RemoveCycleIssueTool } from './cycle-issues/remove.js';

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
        per_page: {
          type: 'number',
          description: 'Number of items per page (max 100)',
          default: 100
        },
        cursor: {
          type: 'string',
          description: 'Cursor string for pagination (format: value:offset:is_prev)'
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
  },
  {
    name: 'claudeus_plane_cycles__list',
    description: 'Lists cycles in a Plane project',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace to list cycles from. If not provided, uses the default workspace.'
        },
        project_id: {
          type: 'string',
          description: 'The ID of the project to list cycles from'
        },
        owned_by: {
          type: 'string',
          description: 'Filter cycles by owner ID'
        },
        start_date: {
          type: 'string',
          format: 'date',
          description: 'Filter cycles by start date (YYYY-MM-DD)'
        },
        end_date: {
          type: 'string',
          format: 'date',
          description: 'Filter cycles by end date (YYYY-MM-DD)'
        },
        per_page: {
          type: 'number',
          description: 'Number of items per page (max 100)',
          default: 100
        },
        cursor: {
          type: 'string',
          description: 'Cursor string for pagination'
        }
      },
      required: ['project_id']
    },
    class: ListCyclesTools
  },
  {
    name: 'claudeus_plane_cycles__get',
    description: 'Gets a single cycle by ID from a Plane project',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace containing the cycle. If not provided, uses the default workspace.'
        },
        project_id: {
          type: 'string',
          description: 'The ID of the project containing the cycle'
        },
        cycle_id: {
          type: 'string',
          description: 'The ID of the cycle to retrieve'
        }
      },
      required: ['project_id', 'cycle_id']
    },
    class: GetCycleTool
  },
  {
    name: 'claudeus_plane_cycles__create',
    description: 'Creates a new cycle in a Plane project',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace to create the cycle in. If not provided, uses the default workspace.'
        },
        project_id: {
          type: 'string',
          description: 'The ID of the project to create the cycle in'
        },
        name: {
          type: 'string',
          description: 'The name of the cycle'
        },
        description: {
          type: 'string',
          description: 'The description of the cycle'
        },
        start_date: {
          type: 'string',
          format: 'date',
          description: 'The start date of the cycle (YYYY-MM-DD)'
        },
        end_date: {
          type: 'string',
          format: 'date',
          description: 'The end date of the cycle (YYYY-MM-DD)'
        },
        owned_by: {
          type: 'string',
          description: 'The ID of the user who owns the cycle'
        }
      },
      required: ['project_id', 'name']
    },
    class: CreateCycleTool
  },
  {
    name: 'claudeus_plane_cycles__update',
    description: 'Updates an existing cycle in a Plane project',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace containing the cycle. If not provided, uses the default workspace.'
        },
        project_id: {
          type: 'string',
          description: 'The ID of the project containing the cycle'
        },
        cycle_id: {
          type: 'string',
          description: 'The ID of the cycle to update'
        },
        name: {
          type: 'string',
          description: 'The new name of the cycle'
        },
        description: {
          type: 'string',
          description: 'The new description of the cycle'
        },
        start_date: {
          type: 'string',
          format: 'date',
          description: 'The new start date of the cycle (YYYY-MM-DD)'
        },
        end_date: {
          type: 'string',
          format: 'date',
          description: 'The new end date of the cycle (YYYY-MM-DD)'
        },
        owned_by: {
          type: 'string',
          description: 'The new owner ID of the cycle'
        }
      },
      required: ['project_id', 'cycle_id']
    },
    class: UpdateCycleTool
  },
  {
    name: 'claudeus_plane_cycles__delete',
    description: 'Deletes an existing cycle from a Plane project',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace containing the cycle. If not provided, uses the default workspace.'
        },
        project_id: {
          type: 'string',
          description: 'The ID of the project containing the cycle'
        },
        cycle_id: {
          type: 'string',
          description: 'The ID of the cycle to delete'
        }
      },
      required: ['project_id', 'cycle_id']
    },
    class: DeleteCycleTool
  },
  {
    name: 'claudeus_plane_cycle_issues__list',
    description: 'Lists all issues in a cycle',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace. If not provided, uses the default workspace.'
        },
        project_id: {
          type: 'string',
          description: 'The ID of the project containing the cycle'
        },
        cycle_id: {
          type: 'string',
          description: 'The ID of the cycle to list issues from'
        }
      },
      required: ['project_id', 'cycle_id']
    },
    class: ListCycleIssuesTools
  },
  {
    name: 'claudeus_plane_cycle_issues__add',
    description: 'Adds issues to a cycle',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace. If not provided, uses the default workspace.'
        },
        project_id: {
          type: 'string',
          description: 'The ID of the project containing the cycle'
        },
        cycle_id: {
          type: 'string',
          description: 'The ID of the cycle to add issues to'
        },
        issue_ids: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'Array of issue IDs to add to the cycle'
        }
      },
      required: ['project_id', 'cycle_id', 'issue_ids']
    },
    class: AddCycleIssuesTool
  },
  {
    name: 'claudeus_plane_cycle_issues__remove',
    description: 'Removes an issue from a cycle',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace. If not provided, uses the default workspace.'
        },
        project_id: {
          type: 'string',
          description: 'The ID of the project containing the cycle'
        },
        cycle_id: {
          type: 'string',
          description: 'The ID of the cycle to remove the issue from'
        },
        issue_id: {
          type: 'string',
          description: 'The ID of the issue to remove from the cycle'
        }
      },
      required: ['project_id', 'cycle_id', 'issue_id']
    },
    class: RemoveCycleIssueTool
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
  
  // Cycles
  claudeus_plane_cycles__list: true,
  claudeus_plane_cycles__get: true,
  claudeus_plane_cycles__create: true,
  claudeus_plane_cycles__update: true,
  claudeus_plane_cycles__delete: true,
  
  // Cycle Issues
  claudeus_plane_cycle_issues__list: true,
  claudeus_plane_cycle_issues__add: true,
  claudeus_plane_cycle_issues__remove: true,
  
  // Modules (Coming soon)
  claudeus_plane_modules__list: false,
  claudeus_plane_modules__get: false,
  claudeus_plane_modules__create: false,
  claudeus_plane_modules__update: false,
  claudeus_plane_modules__delete: false
}; 