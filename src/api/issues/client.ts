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
    pageSize: number = 100
  ): Promise<IssueListResponse> {
    const queryParams = {
      offset: ((page - 1) * pageSize).toString(), // Plane uses offset-based pagination
      limit: pageSize.toString(),
      ...filters
    };

    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues`,
      queryParams
    );
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
    return this.post(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues`,
      {
        ...data,
        project: projectId,
        workspace: workspaceSlug
      }
    );
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
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`
    );
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
    return this.patch(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`,
      data
    );
  }
} 
