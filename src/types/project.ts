export interface Project {
  id: string;
  name: string;
  identifier: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  workspace: {
    id: string;
    slug: string;
    name: string;
  };
  project_lead: string | null;
  default_assignee: string | null;
  project_members: ProjectMember[];
  total_members: number;
  total_cycles: number;
  total_modules: number;
  is_favorite: boolean;
  sort_order: number;
  network: number;
  emoji: string | null;
  icon_prop: {
    name: string;
    color: string;
  } | null;
}

export interface ProjectMember {
  id: string;
  member: {
    id: string;
    display_name: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
  };
  role: 'admin' | 'member' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface CreateProjectPayload {
  name: string;
  identifier: string;
  description?: string;
  project_lead?: string;
  default_assignee?: string;
  emoji?: string;
  icon_prop?: {
    name: string;
    color: string;
  };
}

export interface UpdateProjectPayload extends Partial<CreateProjectPayload> {
  sort_order?: number;
  network?: number;
} 