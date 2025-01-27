import { BaseApiClient, QueryParams } from './base-client.js';
import { 
    Project, 
    CreateProjectPayload, 
    UpdateProjectPayload 
} from './types/project.js';

export class ProjectsAPI extends BaseApiClient {
    async listProjects(workspace: string, params?: QueryParams): Promise<Project[]> {
        const endpoint = `/api/v1/workspaces/${workspace}/projects`;
        return this.get<Project[]>(endpoint, params);
    }

    async createProject(workspace: string, data: CreateProjectPayload): Promise<Project> {
        const endpoint = `/api/v1/workspaces/${workspace}/projects`;
        return this.post<Project, CreateProjectPayload>(endpoint, data);
    }

    async updateProject(workspace: string, projectId: string, data: UpdateProjectPayload): Promise<Project> {
        const endpoint = `/api/v1/workspaces/${workspace}/projects/${projectId}`;
        return this.patch<Project, UpdateProjectPayload>(endpoint, data);
    }

    async deleteProject(workspace: string, projectId: string): Promise<void> {
        const endpoint = `/api/v1/workspaces/${workspace}/projects/${projectId}`;
        return this.delete<void>(endpoint);
    }

    async getProject(workspace: string, projectId: string): Promise<Project> {
        const endpoint = `/api/v1/workspaces/${workspace}/projects/${projectId}`;
        return this.get<Project>(endpoint);
    }
} 