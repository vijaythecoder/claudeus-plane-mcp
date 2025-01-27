import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PlaneApiClient } from '../../api/client.js';
import { loadPlaneConfig } from '../../config/plane-config.js';
import { PlaneInstanceConfig } from '../../api/types/config.js';
import { PromptContext } from '../../types/prompt.js';
import { CreateProjectTool } from '../../tools/projects/create.js';
import { UpdateProjectTool } from '../../tools/projects/update.js';
import { DeleteProjectTool } from '../../tools/projects/delete.js';
import { ListProjectsTool } from '../../tools/projects/list.js';

const TEST_CONFIG = {
    instanceName: 'simhop_test',
    projectPrefix: 'TEST_PROJ_',
    timeouts: {
        create: 5000,
        query: 3000,
        update: 5000,
        delete: 5000
    }
};

describe('Project Management Integration', () => {
    let client: PlaneApiClient;
    let createTool: CreateProjectTool;
    let listTool: ListProjectsTool;
    let updateTool: UpdateProjectTool;
    let deleteTool: DeleteProjectTool;
    let testProjectId: string;

    // Test project data
    const projectIdentifier = `${TEST_CONFIG.projectPrefix}${Date.now()}`;
    const initialProjectData = {
        name: 'Integration Test Project',
        identifier: projectIdentifier,
        description: 'Project created by integration tests',
        network: 0, // Private
        emoji: '1f9ea', // Test tube emoji
        module_view: true,
        cycle_view: true,
        issue_views_view: true,
        page_view: true,
        inbox_view: true
    };

    beforeAll(async () => {
        // Set test config path for loading
        process.env.PLANE_INSTANCES_PATH = process.env.TEST_PLANE_INSTANCE_PATH || './plane-instances-test.json';
        
        // Load test configuration
        const instances = await loadPlaneConfig();
        const instance = instances[TEST_CONFIG.instanceName];
        if (!instance) {
            throw new Error(`Test instance "${TEST_CONFIG.instanceName}" not found in configuration`);
        }

        // Create test context
        const context: PromptContext = {
            progressToken: 'test',
            workspace: instance.defaultWorkspace
        };

        // Initialize client and tools
        client = new PlaneApiClient(instance, context);
        createTool = new CreateProjectTool(client);
        listTool = new ListProjectsTool(client);
        updateTool = new UpdateProjectTool(client);
        deleteTool = new DeleteProjectTool(client);
    });

    afterAll(async () => {
        // Cleanup: Delete test project if it exists
        if (testProjectId) {
            try {
                await deleteTool.execute({ project_id: testProjectId });
            } catch (error) {
                console.warn('Failed to cleanup test project:', error);
            }
        }
    });

    it('should create a new test project', async () => {
        const result = await createTool.execute(initialProjectData);
        expect(result.isError).toBe(false);
        
        const responseText = result.content[0].text;
        expect(responseText).toContain('Successfully created project');
        
        // Extract project ID from response text
        const match = responseText.match(/ID: ([^)]+)/);
        expect(match).toBeTruthy();
        testProjectId = match![1];
        expect(testProjectId).toBeTruthy();
    }, TEST_CONFIG.timeouts.create);

    it('should list projects and find the new project', async () => {
        const result = await listTool.execute({});
        expect(result.isError).toBe(false);
        
        const responseText = result.content[0].text;
        expect(responseText).toContain('Successfully retrieved');
        
        // Extract projects from response
        const match = responseText.match(/\[(.*)\]/);
        expect(match).toBeTruthy();
        const projects = JSON.parse(match![1]);
        
        const testProject = projects.find((p: any) => p.id === testProjectId);
        expect(testProject).toBeTruthy();
        expect(testProject.name).toBe(initialProjectData.name);
        expect(testProject.identifier).toBe(initialProjectData.identifier);
    }, TEST_CONFIG.timeouts.query);

    it('should update the test project', async () => {
        const updateData = {
            project_id: testProjectId,
            name: 'Updated Test Project',
            description: 'Updated test project description'
        };
        
        const result = await updateTool.execute(updateData);
        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain('Successfully updated project');
    }, TEST_CONFIG.timeouts.update);

    it('should delete the test project', async () => {
        const result = await deleteTool.execute({ project_id: testProjectId });
        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain('Successfully deleted project');
    }, TEST_CONFIG.timeouts.delete);
}); 
