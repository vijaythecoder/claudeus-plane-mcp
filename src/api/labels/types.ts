/**
 * Types for label-related API requests and responses
 */

/**
 * Base interface for a label
 */
export interface Label {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  color: string;
  sort_order: number;
  created_by: string;
  updated_by: string;
  project: string;
  workspace: string;
  parent: string | null;
}

/**
 * Data for creating a new label
 */
export interface CreateLabelData {
  name: string;
  description?: string;
  color?: string;
  parent?: string;
}

/**
 * Data for updating an existing label
 */
export interface UpdateLabelData {
  name?: string;
  description?: string;
  color?: string;
  parent?: string | null;
}

/**
 * Response for a single label
 */
export interface LabelResponse extends Label {}

/**
 * Response for listing labels
 */
export interface LabelsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Label[];
}
