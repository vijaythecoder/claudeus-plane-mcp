import { z } from 'zod';
import { PromptDefinition } from '../../types/prompt.js';
import {
  analyzeWorkspaceHealthHandler,
  suggestResourceAllocationHandler,
  recommendProjectStructureHandler
} from './handlers.js';

const workspaceSlugSchema = z.string().optional().describe('The workspace slug to analyze. If not provided, all workspaces will be analyzed.');
const includeArchivedSchema = z.boolean().optional().describe('Whether to include archived projects in the analysis.');
const focusAreaSchema = z.enum(['members', 'cycles', 'modules']).optional().describe('The area to focus resource allocation analysis on.');
const templateProjectSchema = z.string().optional().describe('The name of a project to use as a template for structure recommendations.');

export const analyzeWorkspaceHealth: PromptDefinition = {
  name: 'analyze_workspace_health',
  description: 'Analyzes the health of all projects in a workspace, examining member count, cycle/module usage, and activity metrics.',
  schema: z.object({
    workspace_slug: workspaceSlugSchema,
    include_archived: includeArchivedSchema
  }),
  examples: [
    {
      name: 'Analyze all projects',
      args: {}
    },
    {
      name: 'Analyze specific workspace',
      args: {
        workspace_slug: 'my-workspace'
      }
    },
    {
      name: 'Include archived projects',
      args: {
        include_archived: true
      }
    }
  ],
  handler: analyzeWorkspaceHealthHandler
};

export const suggestResourceAllocation: PromptDefinition = {
  name: 'suggest_resource_allocation',
  description: 'Suggests optimal resource allocation across projects based on member count, project size, and activity.',
  schema: z.object({
    workspace_slug: workspaceSlugSchema,
    focus_area: focusAreaSchema
  }),
  examples: [
    {
      name: 'Analyze member allocation',
      args: {
        focus_area: 'members'
      }
    },
    {
      name: 'Analyze cycle usage',
      args: {
        focus_area: 'cycles'
      }
    },
    {
      name: 'Analyze module usage in workspace',
      args: {
        workspace_slug: 'my-workspace',
        focus_area: 'modules'
      }
    }
  ],
  handler: suggestResourceAllocationHandler
};

export const recommendProjectStructure: PromptDefinition = {
  name: 'recommend_project_structure',
  description: 'Analyzes project structures and provides recommendations for standardization and best practices.',
  schema: z.object({
    workspace_slug: workspaceSlugSchema,
    template_project: templateProjectSchema
  }),
  examples: [
    {
      name: 'Use best practices',
      args: {}
    },
    {
      name: 'Use template project',
      args: {
        template_project: 'ideal-project'
      }
    },
    {
      name: 'Analyze specific workspace',
      args: {
        workspace_slug: 'my-workspace'
      }
    }
  ],
  handler: recommendProjectStructureHandler
}; 
