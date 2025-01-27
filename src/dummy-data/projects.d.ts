export interface Project {
  id: string;
  total_members: number;
  total_cycles: number;
  total_modules: number;
  is_member: boolean;
  sort_order: number;
  member_role: number;
  is_deployed: boolean;
  cover_image_url: string;
  inbox_view: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  description: string;
  description_text: string | null;
  description_html: string | null;
  network: number;
  identifier: string;
  emoji: string | null;
  icon_prop: unknown;
  module_view: boolean;
  cycle_view: boolean;
  issue_views_view: boolean;
  page_view: boolean;
  intake_view: boolean;
  is_time_tracking_enabled: boolean;
  is_issue_type_enabled: boolean;
  guest_view_all_features: boolean;
  cover_image: string;
  archive_in: number;
  close_in: number;
  logo_props: {
    icon: {
      name: string;
      color: string;
    };
    in_use: string;
  };
  archived_at: string | null;
  timezone: string;
  created_by: string;
  updated_by: string;
  workspace: string;
  default_assignee: string;
  project_lead: string;
  cover_image_asset: unknown;
  estimate: string;
  default_state: unknown;
}

export interface ProjectsResponse {
  grouped_by: unknown;
  sub_grouped_by: unknown;
  total_count: number;
  next_cursor: string;
  prev_cursor: string;
  next_page_results: boolean;
  prev_page_results: boolean;
  count: number;
  total_pages: number;
  total_results: number;
  extra_stats: unknown;
  results: Project[];
}

declare const projects: ProjectsResponse;
export default projects; 