import { BaseApiClient } from '../base-client.js';
import { PlaneInstanceConfig } from '../types/config.js';
import { 
  IssueCommentResponse, 
  IssueCommentsListResponse, 
  CreateIssueCommentData,
  UpdateIssueCommentData
} from './types.js';

export class IssueCommentsClient extends BaseApiClient {
  constructor(instance: PlaneInstanceConfig) {
    super(instance);
  }

  /**
   * List all comments for an issue
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param issueId - The issue ID
   */
  async list(
    workspaceSlug: string,
    projectId: string,
    issueId: string
  ): Promise<IssueCommentsListResponse> {
    try {
      return this.get(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/`
      );
    } catch (error) {
      console.error(`[ERROR] Failed to get issue comments: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to list comments for issue ${issueId} in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Get a specific comment by ID
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param issueId - The issue ID
   * @param commentId - The comment ID
   */
  async getComment(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    commentId: string
  ): Promise<IssueCommentResponse> {
    try {
      return this.get(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentId}`
      );
    } catch (error) {
      console.error(`[ERROR] Failed to get issue comment: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to get comment ${commentId} for issue ${issueId} in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Create a new comment for an issue
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param issueId - The issue ID
   * @param data - The comment data
   */
  async createComment(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: CreateIssueCommentData
  ): Promise<IssueCommentResponse> {
    try {
      return this.post(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/`,
        data
      );
    } catch (error) {
      console.error(`[ERROR] Failed to create issue comment: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to create comment for issue ${issueId} in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Update an existing comment
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param issueId - The issue ID
   * @param commentId - The comment ID
   * @param data - The update data
   */
  async updateComment(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    commentId: string,
    data: UpdateIssueCommentData
  ): Promise<IssueCommentResponse> {
    try {
      return this.patch(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
        data
      );
    } catch (error) {
      console.error(`[ERROR] Failed to update issue comment: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to update comment ${commentId} for issue ${issueId} in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Delete a comment
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param issueId - The issue ID
   * @param commentId - The comment ID
   */
  async deleteComment(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    commentId: string
  ): Promise<void> {
    try {
      await this.delete(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentId}`
      );
    } catch (error) {
      console.error(`[ERROR] Failed to delete issue comment: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to delete comment ${commentId} for issue ${issueId} in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }
}
