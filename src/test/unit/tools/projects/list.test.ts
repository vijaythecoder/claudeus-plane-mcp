import { describe, it, expect, beforeEach } from 'vitest';
import { MCPTestHarness, MCPMessage, MCPContentItem } from '@/test/mcp-test-harness.js';
import type { ProjectsResponse } from '@/dummy-data/projects.js';
import dummyProjects from '@/dummy-data/projects.json' assert { type: 'json' };

interface MCPToolResponse extends MCPMessage {
  result?: {
    content?: MCPContentItem[];
  };
}

describe('claudeus_plane_projects__list', () => {
  let harness: MCPTestHarness;

  beforeEach(() => {
    harness = new MCPTestHarness();
  });

  it('should list all projects in the workspace', async () => {
    // Connect to the MCP server
    const initResponse = await harness.connect();
    expect(initResponse).toBeValidJsonRpc();

    // Mock tool response before calling the tool
    const response = await harness.callTool('claudeus_plane_projects__list', {
      workspace: (dummyProjects as ProjectsResponse).results[0].workspace
    }) as MCPToolResponse;

    // Verify JSON-RPC format
    expect(response).toBeValidJsonRpc();

    // Verify response content
    expect(response.result).toBeDefined();
    expect(response.error).toBeUndefined();
    expect(response.result?.content).toBeInstanceOf(Array);
    expect(response.result?.content?.[0]?.type).toBe('text');

    // Parse and verify project data
    const responseData = JSON.parse(response.result?.content?.[0]?.text || '{}') as ProjectsResponse;
    expect(responseData.results).toBeInstanceOf(Array);
    expect(responseData.results).toHaveLength((dummyProjects as ProjectsResponse).results.length);

    // Verify project structure
    const project = responseData.results[0];
    expect(project).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      identifier: expect.any(String),
      workspace: expect.any(String)
    });
  });

  it('should handle invalid workspace ID', async () => {
    // Connect to the MCP server
    await harness.connect();

    const response = await harness.callTool('claudeus_plane_projects__list', {
      workspace: 'invalid-workspace-id'
    }) as MCPToolResponse;

    expect(response).toBeValidJsonRpc();
    expect(response.result?.content?.[0]?.type).toBe('text');
    expect(response.result?.content?.[0]?.text).toContain('Error');
  });

  it('should handle missing workspace parameter', async () => {
    // Connect to the MCP server
    await harness.connect();

    const response = await harness.callTool('claudeus_plane_projects__list', {}) as MCPToolResponse;

    expect(response).toBeValidJsonRpc();
    expect(response.result?.content?.[0]?.type).toBe('text');
    expect(response.result?.content?.[0]?.text).toContain('Error');
  });
}); 