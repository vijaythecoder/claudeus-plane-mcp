import { ProjectsAPI } from '@/api/projects.js';
import { 
    listProjects, 
    createProject, 
    updateProject, 
    deleteProject 
} from '@/tools/projects/handlers.js';
import { PlaneInstance } from '@/config/plane-config.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock ProjectsAPI
vi.mock('@/api/projects.js', () => ({
    ProjectsAPI: vi.fn().mockImplementation((instance) => ({
        instance,
        listProjects: vi.fn(),
        createProject: vi.fn(),
        updateProject: vi.fn(),
        deleteProject: vi.fn()
    }))
}));

describe('Project Tool Handlers', () => {
    let api: ReturnType<typeof vi.mocked<ProjectsAPI>>;
    const mockInstance: PlaneInstance = {
        name: 'test',
        baseUrl: 'https://test.plane.so',
        defaultWorkspace: 'default-workspace',
        apiKey: 'test-key'
    };

    beforeEach(() => {
        api = new ProjectsAPI(mockInstance) as ReturnType<typeof vi.mocked<ProjectsAPI>>;
    });

    describe('listProjects', () => {
        it('should list projects from default workspace', async () => {
            const mockProjects = [{
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Test Project',
                identifier: 'TEST',
                description: null,
                network: 1,
                workspace: '123e4567-e89b-12d3-a456-426614174001',
                project_lead: null,
                default_assignee: null,
                is_member: true,
                member_role: 1,
                total_members: 1,
                total_cycles: 0,
                total_modules: 0,
                module_view: true,
                cycle_view: true,
                issue_views_view: true,
                page_view: true,
                inbox_view: true,
                created_at: '2024-01-25T00:00:00Z',
                updated_at: '2024-01-25T00:00:00Z',
                created_by: '123e4567-e89b-12d3-a456-426614174002',
                updated_by: '123e4567-e89b-12d3-a456-426614174002'
            }];
            vi.mocked(api.listProjects).mockResolvedValue(mockProjects);

            const result = await listProjects(api, {});
            
            expect(api.listProjects).toHaveBeenCalledWith('default-workspace', { include_archived: undefined });
            expect(result.content[0].text).toBe(JSON.stringify(mockProjects, null, 2));
        });

        it('should list projects from specified workspace', async () => {
            const mockProjects = [{
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Test Project',
                identifier: 'TEST',
                description: null,
                network: 1,
                workspace: '123e4567-e89b-12d3-a456-426614174001',
                project_lead: null,
                default_assignee: null,
                is_member: true,
                member_role: 1,
                total_members: 1,
                total_cycles: 0,
                total_modules: 0,
                module_view: true,
                cycle_view: true,
                issue_views_view: true,
                page_view: true,
                inbox_view: true,
                created_at: '2024-01-25T00:00:00Z',
                updated_at: '2024-01-25T00:00:00Z',
                created_by: '123e4567-e89b-12d3-a456-426614174002',
                updated_by: '123e4567-e89b-12d3-a456-426614174002'
            }];
            vi.mocked(api.listProjects).mockResolvedValue(mockProjects);

            const result = await listProjects(api, { workspace_slug: 'custom-workspace' });
            
            expect(api.listProjects).toHaveBeenCalledWith('custom-workspace', { include_archived: undefined });
            expect(result.content[0].text).toBe(JSON.stringify(mockProjects, null, 2));
        });

        it('should handle errors gracefully', async () => {
            vi.mocked(api.listProjects).mockRejectedValue(new Error('API Error'));
            
            await expect(listProjects(api, {}))
                .rejects
                .toThrow('Failed to list projects: API Error');
        });
    });

    describe('createProject', () => {
        it('should create a project in default workspace', async () => {
            const mockProject = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'New Project',
                identifier: 'NEW',
                description: null,
                network: 1,
                workspace: '123e4567-e89b-12d3-a456-426614174001',
                project_lead: null,
                default_assignee: null,
                is_member: true,
                member_role: 1,
                total_members: 1,
                total_cycles: 0,
                total_modules: 0,
                module_view: true,
                cycle_view: true,
                issue_views_view: true,
                page_view: true,
                inbox_view: true,
                created_at: '2024-01-25T00:00:00Z',
                updated_at: '2024-01-25T00:00:00Z',
                created_by: '123e4567-e89b-12d3-a456-426614174002',
                updated_by: '123e4567-e89b-12d3-a456-426614174002'
            };
            vi.mocked(api.createProject).mockResolvedValue(mockProject);

            const result = await createProject(api, {
                name: 'New Project',
                identifier: 'NEW'
            });
            
            expect(api.createProject).toHaveBeenCalledWith('default-workspace', {
                name: 'New Project',
                identifier: 'NEW'
            });
            expect(result.content[0].text).toBe(JSON.stringify(mockProject, null, 2));
        });

        it('should handle validation errors', async () => {
            await expect(createProject(api, {}))
                .rejects
                .toThrow();
        });
    });

    describe('updateProject', () => {
        it('should update a project', async () => {
            const mockProject = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Updated Project',
                identifier: 'UPD',
                description: null,
                network: 1,
                workspace: '123e4567-e89b-12d3-a456-426614174001',
                project_lead: null,
                default_assignee: null,
                is_member: true,
                member_role: 1,
                total_members: 1,
                total_cycles: 0,
                total_modules: 0,
                module_view: true,
                cycle_view: true,
                issue_views_view: true,
                page_view: true,
                inbox_view: true,
                created_at: '2024-01-25T00:00:00Z',
                updated_at: '2024-01-25T00:00:00Z',
                created_by: '123e4567-e89b-12d3-a456-426614174002',
                updated_by: '123e4567-e89b-12d3-a456-426614174002'
            };
            vi.mocked(api.updateProject).mockResolvedValue(mockProject);

            const result = await updateProject(api, {
                project_id: '1',
                name: 'Updated Project'
            });
            
            expect(api.updateProject).toHaveBeenCalledWith('default-workspace', '1', {
                name: 'Updated Project'
            });
            expect(result.content[0].text).toBe(JSON.stringify(mockProject, null, 2));
        });

        it('should handle missing project_id', async () => {
            await expect(updateProject(api, { name: 'Test' }))
                .rejects
                .toThrow();
        });
    });

    describe('deleteProject', () => {
        it('should delete a project', async () => {
            vi.mocked(api.deleteProject).mockResolvedValue(undefined);

            const result = await deleteProject(api, {
                project_id: '1'
            });
            
            expect(api.deleteProject).toHaveBeenCalledWith('default-workspace', '1');
            expect(JSON.parse(result.content[0].text)).toEqual({
                success: true,
                message: 'Project deleted successfully'
            });
        });

        it('should handle deletion errors', async () => {
            vi.mocked(api.deleteProject).mockRejectedValue(new Error('Not found'));
            
            await expect(deleteProject(api, { project_id: '1' }))
                .rejects
                .toThrow('Failed to delete project: Not found');
        });
    });
}); 