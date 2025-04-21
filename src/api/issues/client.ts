import { BaseApiClient } from '../base-client.js';
import { PlaneInstanceConfig } from '../types/config.js';
import { IssueListFilters, IssueListResponse, CreateIssueData, UpdateIssueData, IssueResponse } from './types.js';

export class IssuesClient extends BaseApiClient {
  constructor(instance: PlaneInstanceConfig) {
    super(instance);
  }

  /**
   * List issues in a project
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param filters - Optional filters for the issues list
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   */
  async list(
    workspaceSlug: string,
    projectId: string,
    filters?: IssueListFilters,
    page: number = 1,
    per_page: number = 100
  ): Promise<IssueListResponse> {
    const queryParams = {
      offset: ((page - 1) * per_page).toString(), // Plane uses offset-based pagination
      per_page: per_page.toString(),
      ...filters
    };

    // Log the request URL for debugging
    console.error(`[DEBUG] Requesting issues from: ${this.baseUrl}/workspaces/${workspaceSlug}/projects/${projectId}/issues`);
    console.error(`[DEBUG] With params: ${JSON.stringify(queryParams)}`);
    console.error(`[DEBUG] Using API key: ${this._instance?.apiKey ? (this._instance.apiKey.substring(0, 10) + '...') : 'undefined'}`);
    console.error(`[DEBUG] Workspace: ${workspaceSlug}, Project ID: ${projectId}`);

    try {
      return this.get(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/`,
        queryParams
      );
    } catch (error) {
      console.error(`[ERROR] Failed to get issues: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to list issues for project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Create a new issue in a project
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param data - The issue data
   */
  async create(
    workspaceSlug: string,
    projectId: string,
    data: CreateIssueData
  ): Promise<IssueResponse> {
    try {
      console.error(`[DEBUG] Creating issue in project ${projectId} in workspace ${workspaceSlug}`);
      return this.post(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/`,
        {
          ...data,
          project: projectId,
          workspace: workspaceSlug
        }
      );
    } catch (error) {
      console.error(`[ERROR] Failed to create issue: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to create issue in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Get a single issue by ID
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param issueId - The issue ID
   */
  async getIssue(
    workspaceSlug: string,
    projectId: string,
    issueId: string
  ): Promise<IssueResponse> {
    try {
      console.error(`[DEBUG] Getting issue ${issueId} from project ${projectId} in workspace ${workspaceSlug}`);
      return this.get(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`
      );
    } catch (error) {
      console.error(`[ERROR] Failed to get issue: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to get issue ${issueId} from project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Update an existing issue
   * @param workspaceSlug - The workspace slug
   * @param projectId - The project ID
   * @param issueId - The issue ID
   * @param data - The update data
   */
  async update(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: UpdateIssueData
  ): Promise<IssueResponse> {
    try {
      console.error(`[DEBUG] Updating issue ${issueId} in project ${projectId} in workspace ${workspaceSlug}`);
      return this.patch(
        `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`,
        data
      );
    } catch (error) {
      console.error(`[ERROR] Failed to update issue: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add more context to the error message
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to update issue ${issueId} in project ${projectId} in workspace ${workspaceSlug}: ${error.message}`);
        enhancedError.stack = error.stack;
        throw enhancedError;
      }
      
      throw error;
    }
  }
} 
