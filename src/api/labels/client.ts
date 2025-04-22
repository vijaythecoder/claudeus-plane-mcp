import { BaseApiClient } from '../base-client.js';
import { PlaneInstanceConfig } from '../types/config.js';
import { CreateLabelData, LabelResponse, LabelsListResponse, UpdateLabelData } from './types.js';

/**
 * Client for interacting with the labels API
 */
export class LabelsClient extends BaseApiClient {
  constructor(instance: PlaneInstanceConfig) {
    super(instance);
  }

  /**
   * List all labels for a project
   * @param workspaceSlug Workspace slug
   * @param projectId Project ID
   * @returns List of labels
   */
  async list(workspaceSlug: string, projectId: string): Promise<LabelsListResponse> {
    try {
      return this.get(
        `/workspaces/${workspaceSlug}/projects/${projectId}/labels/`
      );
    } catch (error) {
      console.error(`[ERROR] Failed to get labels: ${error instanceof Error ? error.message : String(error)}`);
      const enhancedError = new Error(`Failed to list labels for project ${projectId} in workspace ${workspaceSlug}: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error) {
        enhancedError.stack = error.stack;
      }
      throw enhancedError;
    }
  }

  /**
   * Get a specific label by ID
   * @param workspaceSlug Workspace slug
   * @param projectId Project ID
   * @param labelId Label ID
   * @returns Label details
   */
  async getLabel(workspaceSlug: string, projectId: string, labelId: string): Promise<LabelResponse> {
    try {
      return this.get(
        `/workspaces/${workspaceSlug}/projects/${projectId}/labels/${labelId}`
      );
    } catch (error) {
      console.error(`[ERROR] Failed to get label: ${error instanceof Error ? error.message : String(error)}`);
      const enhancedError = new Error(`Failed to get label ${labelId} for project ${projectId} in workspace ${workspaceSlug}: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error) {
        enhancedError.stack = error.stack;
      }
      throw enhancedError;
    }
  }

  /**
   * Create a new label
   * @param workspaceSlug Workspace slug
   * @param projectId Project ID
   * @param data Label data
   * @returns Created label
   */
  async create(workspaceSlug: string, projectId: string, data: CreateLabelData): Promise<LabelResponse> {
    try {
      return this.post(
        `/workspaces/${workspaceSlug}/projects/${projectId}/labels/`,
        data as unknown as Record<string, unknown>
      );
    } catch (error) {
      console.error(`[ERROR] Failed to create label: ${error instanceof Error ? error.message : String(error)}`);
      const enhancedError = new Error(`Failed to create label for project ${projectId} in workspace ${workspaceSlug}: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error) {
        enhancedError.stack = error.stack;
      }
      throw enhancedError;
    }
  }

  /**
   * Update an existing label
   * @param workspaceSlug Workspace slug
   * @param projectId Project ID
   * @param labelId Label ID
   * @param data Updated label data
   * @returns Updated label
   */
  async update(workspaceSlug: string, projectId: string, labelId: string, data: UpdateLabelData): Promise<LabelResponse> {
    try {
      return this.patch(
        `/workspaces/${workspaceSlug}/projects/${projectId}/labels/${labelId}`,
        data as unknown as Record<string, unknown>
      );
    } catch (error) {
      console.error(`[ERROR] Failed to update label: ${error instanceof Error ? error.message : String(error)}`);
      const enhancedError = new Error(`Failed to update label ${labelId} for project ${projectId} in workspace ${workspaceSlug}: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error) {
        enhancedError.stack = error.stack;
      }
      throw enhancedError;
    }
  }

  /**
   * Delete a label
   * @param workspaceSlug Workspace slug
   * @param projectId Project ID
   * @param labelId Label ID
   */
  async deleteLabel(workspaceSlug: string, projectId: string, labelId: string): Promise<void> {
    try {
      await this.delete(
        `/workspaces/${workspaceSlug}/projects/${projectId}/labels/${labelId}`
      );
    } catch (error) {
      console.error(`[ERROR] Failed to delete label: ${error instanceof Error ? error.message : String(error)}`);
      const enhancedError = new Error(`Failed to delete label ${labelId} for project ${projectId} in workspace ${workspaceSlug}: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error) {
        enhancedError.stack = error.stack;
      }
      throw enhancedError;
    }
  }
}
