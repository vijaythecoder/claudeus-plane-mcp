// Cycle Issue Base Interface
export interface CycleIssueBase {
  sub_issues_count: number;
  project: string;
  workspace: string;
  cycle: string;
  issue: string;
}

// Cycle Issue Response Interface
export interface CycleIssueResponse extends CycleIssueBase {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// Add Cycle Issue Request
export interface AddCycleIssueRequest {
  issues: string[];
}

// Cycle Issues List Response
export interface CycleIssuesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CycleIssueResponse[];
}
