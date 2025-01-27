import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateProjectTool } from '../update.js';
import { PlaneApiClient } from '../../../api/client.js';
import { PlaneInstance } from '../../../config/plane-config.js';

// Mock the PlaneApiClient
vi.mock('../../../api/client.js', () => {
    return {
        PlaneApiClient: vi.fn().mockImplementation((instance, context) => ({
            instance,
            updateProject: vi.fn(),
            notify: vi.fn()
        }))
    };
});

describe('UpdateProjectTool', () => {
    let tool: UpdateProjectTool;
    let mockClient: PlaneApiClient;
    
    beforeEach(() => {
        // Create a mock instance
        const mockInstance: PlaneInstance = {
            name: 'test',
            baseUrl: 'https://test.plane.so',
            apiKey: 'test-key',
            defaultWorkspace: 'test-workspace'
        };

        // Create a mock context
        const mockContext = {
            progressToken: '123',
            workspace: 'test-workspace'
        };

        // Create a mock client
        mockClient = new PlaneApiClient(mockInstance, mockContext);
        
        // Create the tool instance
        tool = new UpdateProjectTool(mockClient);
    });

    it('should update a project with minimal fields', async () => {
        const mockProject = {
            id: 'test-id',
            name: 'Updated Project',
            identifier: 'TEST'
        };

        (mockClient.updateProject as any).mockResolvedValue(mockProject);

        const result = await tool.execute({
            project_id: 'test-id',
            name: 'Updated Project'
        });

        expect(mockClient.updateProject).toHaveBeenCalledWith('test-workspace', 'test-id', {
            name: 'Updated Project'
        });

        expect(result.content[0].text).toContain('Successfully updated project');
        expect(result.content[0].text).toContain(mockProject.id);
    });

    it('should update a project with all optional fields', async () => {
        const mockProject = {
            id: 'test-id',
            name: 'Updated Project',
            identifier: 'TEST',
            description: 'Updated Description',
            network: 2,
            emoji: '1f680',
            module_view: false,
            cycle_view: false,
            issue_views_view: false,
            page_view: false,
            inbox_view: true
        };

        (mockClient.updateProject as any).mockResolvedValue(mockProject);

        const result = await tool.execute({
            project_id: 'test-id',
            name: 'Updated Project',
            identifier: 'TEST',
            description: 'Updated Description',
            network: 2,
            emoji: '1f680',
            module_view: false,
            cycle_view: false,
            issue_views_view: false,
            page_view: false,
            inbox_view: true
        });

        expect(mockClient.updateProject).toHaveBeenCalledWith('test-workspace', 'test-id', {
            name: 'Updated Project',
            identifier: 'TEST',
            description: 'Updated Description',
            network: 2,
            emoji: '1f680',
            module_view: false,
            cycle_view: false,
            issue_views_view: false,
            page_view: false,
            inbox_view: true
        });

        expect(result.content[0].text).toContain('Successfully updated project');
        expect(result.content[0].text).toContain(mockProject.id);
    });

    it('should use provided workspace instead of default', async () => {
        const mockProject = {
            id: 'test-id',
            name: 'Updated Project'
        };

        (mockClient.updateProject as any).mockResolvedValue(mockProject);

        await tool.execute({
            workspace_slug: 'custom-workspace',
            project_id: 'test-id',
            name: 'Updated Project'
        });

        expect(mockClient.updateProject).toHaveBeenCalledWith('custom-workspace', 'test-id', {
            name: 'Updated Project'
        });
    });

    it('should handle API errors', async () => {
        const errorMessage = 'API Error: Project update failed';
        (mockClient.updateProject as any).mockRejectedValue(new Error(errorMessage));

        const result = await tool.execute({
            project_id: 'test-id',
            name: 'Updated Project'
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain(errorMessage);
        expect(mockClient.notify).toHaveBeenCalledWith(expect.objectContaining({
            type: 'error',
            message: expect.stringContaining('Failed to update project')
        }));
    });

    it('should validate required fields', async () => {
        await expect(tool.execute({
            name: 'Updated Project'
            // Missing project_id
        })).rejects.toThrow();
    });

    it('should validate field types', async () => {
        await expect(tool.execute({
            project_id: 'test-id',
            network: 3 // Invalid network value
        })).rejects.toThrow();

        await expect(tool.execute({
            project_id: 'test-id',
            archive_in: 13 // Invalid archive_in value
        })).rejects.toThrow();
    });
}); 