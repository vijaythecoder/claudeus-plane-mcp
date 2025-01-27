import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateProjectTool } from '../create.js';
import { PlaneApiClient } from '../../../api/client.js';
import { PlaneInstance } from '../../../config/plane-config.js';

// Mock the PlaneApiClient
vi.mock('../../../api/client.js', () => {
    return {
        PlaneApiClient: vi.fn().mockImplementation((instance, context) => ({
            instance,
            createProject: vi.fn(),
            notify: vi.fn()
        }))
    };
});

describe('CreateProjectTool', () => {
    let tool: CreateProjectTool;
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
        tool = new CreateProjectTool(mockClient);
    });

    it('should create a project with minimal required fields', async () => {
        const mockProject = {
            id: 'test-id',
            name: 'Test Project',
            identifier: 'TEST'
        };

        (mockClient.createProject as any).mockResolvedValue(mockProject);

        const result = await tool.execute({
            name: 'Test Project',
            identifier: 'TEST'
        });

        expect(mockClient.createProject).toHaveBeenCalledWith('test-workspace', {
            name: 'Test Project',
            identifier: 'TEST'
        });

        expect(result.content[0].text).toContain('Successfully created project');
        expect(result.content[0].text).toContain(mockProject.id);
    });

    it('should create a project with all optional fields', async () => {
        const mockProject = {
            id: 'test-id',
            name: 'Test Project',
            identifier: 'TEST',
            description: 'Test Description',
            network: 2,
            emoji: '1f680',
            module_view: true,
            cycle_view: true,
            issue_views_view: true,
            page_view: true,
            inbox_view: false
        };

        (mockClient.createProject as any).mockResolvedValue(mockProject);

        const result = await tool.execute({
            name: 'Test Project',
            identifier: 'TEST',
            description: 'Test Description',
            network: 2,
            emoji: '1f680',
            module_view: true,
            cycle_view: true,
            issue_views_view: true,
            page_view: true,
            inbox_view: false
        });

        expect(mockClient.createProject).toHaveBeenCalledWith('test-workspace', {
            name: 'Test Project',
            identifier: 'TEST',
            description: 'Test Description',
            network: 2,
            emoji: '1f680',
            module_view: true,
            cycle_view: true,
            issue_views_view: true,
            page_view: true,
            inbox_view: false
        });

        expect(result.content[0].text).toContain('Successfully created project');
        expect(result.content[0].text).toContain(mockProject.id);
    });

    it('should use provided workspace instead of default', async () => {
        const mockProject = {
            id: 'test-id',
            name: 'Test Project',
            identifier: 'TEST'
        };

        (mockClient.createProject as any).mockResolvedValue(mockProject);

        await tool.execute({
            workspace_slug: 'custom-workspace',
            name: 'Test Project',
            identifier: 'TEST'
        });

        expect(mockClient.createProject).toHaveBeenCalledWith('custom-workspace', {
            name: 'Test Project',
            identifier: 'TEST'
        });
    });

    it('should handle API errors', async () => {
        const errorMessage = 'API Error: Project creation failed';
        (mockClient.createProject as any).mockRejectedValue(new Error(errorMessage));

        const result = await tool.execute({
            name: 'Test Project',
            identifier: 'TEST'
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain(errorMessage);
        expect(mockClient.notify).toHaveBeenCalledWith(expect.objectContaining({
            type: 'error',
            message: expect.stringContaining('Failed to create project')
        }));
    });

    it('should validate required fields', async () => {
        await expect(tool.execute({
            name: 'Test Project'
            // Missing identifier
        })).rejects.toThrow();

        await expect(tool.execute({
            identifier: 'TEST'
            // Missing name
        })).rejects.toThrow();
    });

    it('should validate field types', async () => {
        await expect(tool.execute({
            name: 'Test Project',
            identifier: 'TEST',
            network: 3 // Invalid network value
        })).rejects.toThrow();

        await expect(tool.execute({
            name: 'Test Project',
            identifier: 'TEST',
            archive_in: 13 // Invalid archive_in value
        })).rejects.toThrow();
    });
}); 
