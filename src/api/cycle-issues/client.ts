import { BaseApiClient } from '../base-client.js';
import { PlaneInstanceConfig } from '../types/config.js';
import { 
  CycleIssueResponse, 
  CycleIssuesListResponse, 
  AddCycleIssueRequest 
} from './types.js';

export class CycleIssuesClient extends BaseApiClient {
  constructor(instance: PlaneInstanceConfig) {
    super(instance);
  }

  /**
   * List all issues in a cycle
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param cycleId - The cycle ID
   */
  async list(
    workspaceSlug: string,
    projectId: string,
    cycleId: string
  ): Promise<CycleIssuesListResponse> {
    try {
      return this.get(
        `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/cycle-issues/`
      );
    } catch (error) {
      console.error(`[ERROR] Failed to get cycle issues: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to list issues for cycle ${cycleId} in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Add issues to a cycle
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param cycleId - The cycle ID
   * @param issueIds - Array of issue IDs to add to the cycle
   */
  async addIssues(
    workspaceSlug: string,
    projectId: string,
    cycleId: string,
    issueIds: string[]
  ): Promise<CycleIssueResponse[]> {
    try {
      const data: AddCycleIssueRequest = {
        issues: issueIds
      };
      
      return this.post(
        `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/cycle-issues/`,
        data
      );
    } catch (error) {
      console.error(`[ERROR] Failed to add issues to cycle: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to add issues to cycle ${cycleId} in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Remove an issue from a cycle
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param cycleId - The cycle ID
   * @param issueId - The issue ID to remove from the cycle
   */
  async removeIssue(
    workspaceSlug: string,
    projectId: string,
    cycleId: string,
    issueId: string
  ): Promise<void> {
    try {
      await this.delete(
        `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/cycle-issues/${issueId}`
      );
    } catch (error) {
      console.error(`[ERROR] Failed to remove issue from cycle: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to remove issue ${issueId} from cycle ${cycleId} in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }
}
