// Issue Comment Access Type
export type IssueCommentAccess = 'INTERNAL' | 'EXTERNAL';

// Issue Comment Base Interface
export interface IssueCommentBase {
  comment_html: string;
  comment_stripped?: string;
  comment_json?: Record<string, any>;
  access?: IssueCommentAccess;
  project: string;
  workspace: string;
  issue: string;
  actor?: string;
  attachments?: any[];
}

// Create Issue Comment Data
export interface CreateIssueCommentData {
  comment_html: string;
  access?: IssueCommentAccess;
}

// Update Issue Comment Data
export interface UpdateIssueCommentData {
  comment_html?: string;
  access?: IssueCommentAccess;
}

// Issue Comment Response Interface
export interface IssueCommentResponse extends IssueCommentBase {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// Issue Comments List Response
export interface IssueCommentsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IssueCommentResponse[];
}
