import { BaseApiClient } from '../base-client.js';
import { PlaneInstanceConfig } from '../types/config.js';
import { CycleListFilters, CycleListResponse, CreateCycleData, UpdateCycleData, CycleResponse } from './types.js';

export class CyclesClient extends BaseApiClient {
  constructor(instance: PlaneInstanceConfig) {
    super(instance);
  }

  /**
   * List cycles in a project
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param filters - Optional filters for the cycles list
   * @param per_page - Number of items per page
   * @param cursor - Cursor for pagination
   */
  async list(
    workspaceSlug: string,
    projectId: string,
    filters?: CycleListFilters,
    per_page: number = 100,
    cursor?: string
  ): Promise<CycleListResponse> {
    // Ensure per_page doesn't exceed the maximum allowed value
    const validatedPerPage = Math.min(per_page, 100);
    
    const queryParams = {
      per_page: validatedPerPage.toString(),
      ...(cursor && { cursor }),
      ...filters
    };

    try {
      return this.get(
        `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/`,
        queryParams
      );
    } catch (error) {
      console.error(`[ERROR] Failed to get cycles: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to list cycles for project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Create a new cycle in a project
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param data - The cycle data
   */
  async create(
    workspaceSlug: string,
    projectId: string,
    data: CreateCycleData
  ): Promise<CycleResponse> {
    try {
      return this.post(
        `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/`,
        {
          ...data,
          project: projectId,
          workspace: workspaceSlug
        }
      );
    } catch (error) {
      console.error(`[ERROR] Failed to create cycle: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to create cycle in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Get a single cycle by ID
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param cycleId - The cycle ID
   */
  async getCycle(
    workspaceSlug: string,
    projectId: string,
    cycleId: string
  ): Promise<CycleResponse> {
    try {
      return this.get(
        `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`
      );
    } catch (error) {
      console.error(`[ERROR] Failed to get cycle: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to get cycle ${cycleId} from project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Update an existing cycle
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param cycleId - The cycle ID
   * @param data - The update data
   */
  async update(
    workspaceSlug: string,
    projectId: string,
    cycleId: string,
    data: UpdateCycleData
  ): Promise<CycleResponse> {
    try {
      return this.patch(
        `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`,
        data
      );
    } catch (error) {
      console.error(`[ERROR] Failed to update cycle: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to update cycle ${cycleId} in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Delete an existing cycle
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param cycleId - The cycle ID
   */
  async deleteCycle(
    workspaceSlug: string,
    projectId: string,
    cycleId: string
  ): Promise<void> {
    try {
      await this.delete(
        `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`
      );
    } catch (error) {
      console.error(`[ERROR] Failed to delete cycle: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to delete cycle ${cycleId} in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }
}
