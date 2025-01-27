export type IssueState = 'backlog' | 'unstarted' | 'started' | 'completed' | 'cancelled';
export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export interface Issue {
  id: string;
  name: string;
  description: string | null;
  description_html: string | null;
  project: string;
  workspace: {
    id: string;
    slug: string;
    name: string;
  };
  state: IssueState;
  priority: IssuePriority;
  assignees: string[];
  labels: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  sequence_id: number;
  sort_order: number;
  sub_issues_count: number;
  archived_at: string | null;
  is_draft: boolean;
  cycle: string | null;
  module: string | null;
  target_date: string | null;
  parent: string | null;
  estimate_point: number | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

export interface CreateIssuePayload {
  name: string;
  description?: string;
  description_html?: string;
  state?: IssueState;
  priority?: IssuePriority;
  assignees?: string[];
  labels?: string[];
  cycle?: string;
  module?: string;
  target_date?: string;
  parent?: string;
  estimate_point?: number;
}

export interface UpdateIssuePayload extends Partial<CreateIssuePayload> {
  sort_order?: number;
  is_draft?: boolean;
}

export interface IssueFilter {
  state?: IssueState;
  priority?: IssuePriority;
  assignees?: string[];
  labels?: string[];
  created_by?: string[];
  subscriber?: string[];
  target_date?: string;
  created_at?: string;
  updated_at?: string;
  order_by?: string;
  type?: string;
} 