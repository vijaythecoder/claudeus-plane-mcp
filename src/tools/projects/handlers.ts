import { ToolResponse } from '../../types/mcp.js';
import { ProjectsAPI } from '../../api/projects.js';
import { z } from 'zod';
import { CreateProjectSchema, UpdateProjectSchema } from '../../api/types/project.js';

const listProjectsSchema = z.object({
    workspace_slug: z.string().optional(),
    include_archived: z.boolean().optional()
});

export async function listProjects(
    api: ProjectsAPI, 
    args: Record<string, unknown>
): Promise<ToolResponse> {
    const { workspace_slug, include_archived } = listProjectsSchema.parse(args);
    
    try {
        const workspace = workspace_slug || api.instance.defaultWorkspace;
        if (!workspace) {
            throw new Error('No workspace provided or configured');
        }

        const projects = await api.listProjects(workspace, { include_archived });
        
        return {
            content: [{
                type: 'text',
                text: JSON.stringify(projects, null, 2)
            }]
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to list projects: ${error.message}`);
        }
        throw error;
    }
}

const createProjectSchema = z.object({
    workspace_slug: z.string().optional(),
    name: z.string(),
    identifier: z.string(),
    description: z.string().optional(),
    project_lead: z.string().uuid().optional(),
    default_assignee: z.string().uuid().optional()
});

export async function createProject(
    api: ProjectsAPI,
    args: Record<string, unknown>
): Promise<ToolResponse> {
    const data = createProjectSchema.parse(args);
    const workspace = data.workspace_slug || api.instance.defaultWorkspace;
    
    if (!workspace) {
        throw new Error('No workspace provided or configured');
    }

    try {
        const project = await api.createProject(workspace, data);
        return {
            content: [{
                type: 'text',
                text: JSON.stringify(project, null, 2)
            }]
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to create project: ${error.message}`);
        }
        throw error;
    }
}

const updateProjectSchema = z.object({
    workspace_slug: z.string().optional(),
    project_id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    project_lead: z.string().uuid().optional(),
    default_assignee: z.string().uuid().optional()
});

export async function updateProject(
    api: ProjectsAPI,
    args: Record<string, unknown>
): Promise<ToolResponse> {
    const { workspace_slug, project_id, ...updateData } = updateProjectSchema.parse(args);
    const workspace = workspace_slug || api.instance.defaultWorkspace;
    
    if (!workspace) {
        throw new Error('No workspace provided or configured');
    }

    try {
        const project = await api.updateProject(workspace, project_id, updateData);
        return {
            content: [{
                type: 'text',
                text: JSON.stringify(project, null, 2)
            }]
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to update project: ${error.message}`);
        }
        throw error;
    }
}

const deleteProjectSchema = z.object({
    workspace_slug: z.string().optional(),
    project_id: z.string()
});

export async function deleteProject(
    api: ProjectsAPI,
    args: Record<string, unknown>
): Promise<ToolResponse> {
    const { workspace_slug, project_id } = deleteProjectSchema.parse(args);
    const workspace = workspace_slug || api.instance.defaultWorkspace;
    
    if (!workspace) {
        throw new Error('No workspace provided or configured');
    }

    try {
        await api.deleteProject(workspace, project_id);
        return {
            content: [{
                type: 'text',
                text: JSON.stringify({ success: true, message: 'Project deleted successfully' })
            }]
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to delete project: ${error.message}`);
        }
        throw error;
    }
}

export async function handleProjectTools(
    api: ProjectsAPI,
    name: string, 
    args: Record<string, unknown>
): Promise<ToolResponse> {
    switch (name) {
        case 'claudeus_plane_projects__list':
            return listProjects(api, args);
        case 'claudeus_plane_projects__create':
            return createProject(api, args);
        case 'claudeus_plane_projects__update':
            return updateProject(api, args);
        case 'claudeus_plane_projects__delete':
            return deleteProject(api, args);
        default:
            throw new Error(`Unknown project tool: ${name}`);
    }
} 