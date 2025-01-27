import { ToolDefinition } from '../../types/mcp.js';
import { ListProjectsTool } from './list.js';

// Export project tool definitions
export const projectTools: ToolDefinition[] = [
  {
    name: 'claudeus_plane_projects__list',
    description: 'List all projects in a workspace',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string'
        }
      }
    }
  },
  {
    name: 'claudeus_plane_projects__create',
    description: 'Creates a new project in a workspace',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace to create the project in'
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
      required: ['workspace_slug', 'name', 'identifier']
    }
  },
  {
    name: 'claudeus_plane_projects__update',
    description: 'Updates an existing project in a workspace',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace to update the project in.'
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
      }
    }
  },
  {
    name: 'claudeus_plane_projects__delete',
    description: 'Deletes an existing project in a workspace',
    status: 'enabled',
    inputSchema: {
      type: 'object',
      properties: {
        workspace_slug: {
          type: 'string',
          description: 'The slug of the workspace to delete the project from.'
        },
        project_id: {
          type: 'string',
          description: 'The ID of the project to delete.'
        }
      }
    }
  }
]; 