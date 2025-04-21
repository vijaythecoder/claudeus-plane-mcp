// Issue Priority Types
export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

// Base Issue Interface
export interface IssueBase {
  name: string;
  description_html?: string;
  description_stripped?: string;
  priority: IssuePriority;
  start_date?: string;
  target_date?: string;
  estimate_point?: number | null;
  sequence_id?: number;
  sort_order?: number;
  completed_at?: string | null;
  archived_at?: string | null;
  is_draft?: boolean;
  project: string;
  workspace: string;
  parent?: string | null;
  state: string; // State ID in Plane
  assignees?: string[];
  labels?: string[];
}

// Create Issue Data
export interface CreateIssueData {
  name: string;
  description_html?: string;
  priority?: IssuePriority;
  start_date?: string;
  target_date?: string;
  estimate_point?: number;
  state?: string;
  assignees?: string[];
  labels?: string[];
  parent?: string;
  is_draft?: boolean;
}

// Update Issue Data
export interface UpdateIssueData {
  name?: string;
  description_html?: string;
  priority?: IssuePriority;
  start_date?: string;
  target_date?: string;
  estimate_point?: number | null;
  state?: string;
  assignees?: string[];
  labels?: string[];
  parent?: string | null;
  is_draft?: boolean;
  archived_at?: string | null;
  completed_at?: string | null;
}

// Issue Response Interface
export interface IssueResponse extends IssueBase {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// Issue List Filters
export interface IssueListFilters {
  state?: string;
  priority?: IssuePriority;
  assignee?: string;
  label?: string;
  created_by?: string;
  start_date?: string;
  target_date?: string;
  subscriber?: string;
  is_draft?: boolean;
  archived?: boolean;
}

// Issue List Response
export interface IssueListResponse {
  grouped_by: string | null;
  sub_grouped_by: string | null;
  total_count: number;
  next_cursor: string;
  prev_cursor: string;
  next_page_results: boolean;
  prev_page_results: boolean;
  count: number;
  total_pages: number;
  total_results: number;
  extra_stats: Record<string, any> | null;
  results: IssueResponse[];
} 