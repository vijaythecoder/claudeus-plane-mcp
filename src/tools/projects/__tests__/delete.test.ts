import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteProjectTool } from '../delete.js';
import { PlaneApiClient } from '../../../api/client.js';
import { PlaneInstance } from '../../../config/plane-config.js';

// Mock the PlaneApiClient
vi.mock('../../../api/client.js', () => {
    const mockNotify = vi.fn();
    return {
        PlaneApiClient: vi.fn().mockImplementation((instance, context) => ({
            instance,
            deleteProject: vi.fn(),
            notify: mockNotify
        }))
    };
});

describe('DeleteProjectTool', () => {
    let tool: DeleteProjectTool;
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
        tool = new DeleteProjectTool(mockClient);

        // Reset mock call history
        vi.clearAllMocks();
    });

    it('should delete a project successfully', async () => {
        (mockClient.deleteProject as any).mockResolvedValue(undefined);

        const result = await tool.execute({
            project_id: 'test-id'
        });

        expect(mockClient.deleteProject).toHaveBeenCalledWith('test-workspace', 'test-id');
        expect(JSON.parse(result.content[0].text)).toEqual({
            success: true,
            message: 'Project deleted successfully',
            project_id: 'test-id',
            workspace: 'test-workspace'
        });
    });

    it('should use provided workspace instead of default', async () => {
        (mockClient.deleteProject as any).mockResolvedValue(undefined);

        await tool.execute({
            workspace_slug: 'custom-workspace',
            project_id: 'test-id'
        });

        expect(mockClient.deleteProject).toHaveBeenCalledWith('custom-workspace', 'test-id');
    });

    it('should handle API errors', async () => {
        const errorMessage = 'API Error: Project deletion failed';
        (mockClient.deleteProject as any).mockRejectedValue(new Error(errorMessage));

        const result = await tool.execute({
            project_id: 'test-id'
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toBe(`Error: ${errorMessage}`);
        expect(mockClient.notify).toHaveBeenCalledWith({
            type: 'error',
            message: `Failed to delete project: ${errorMessage}`,
            source: 'claudeus_plane_projects__delete',
            data: { 
                error: errorMessage,
                workspace: 'test-workspace',
                project_id: 'test-id'
            }
        });
    });

    it('should validate required fields', async () => {
        await expect(tool.execute({
            // Missing project_id
        })).rejects.toThrow();
    });

    it('should handle missing workspace configuration', async () => {
        const mockInstanceNoWorkspace: PlaneInstance = {
            name: 'test',
            baseUrl: 'https://test.plane.so',
            apiKey: 'test-key'
            // No defaultWorkspace
        };

        const mockContextNoWorkspace = {
            progressToken: '123',
            workspace: 'test-workspace'
        };

        const clientNoWorkspace = new PlaneApiClient(mockInstanceNoWorkspace, mockContextNoWorkspace);
        (clientNoWorkspace.deleteProject as any).mockResolvedValue(undefined);

        const toolNoWorkspace = new DeleteProjectTool(clientNoWorkspace);

        const result = await toolNoWorkspace.execute({
            project_id: 'test-id'
            // No workspace_slug provided
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toBe('Error: No workspace provided or configured');
    });
}); 