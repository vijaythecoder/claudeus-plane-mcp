// Cycle Base Interface
export interface CycleBase {
  name: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  view_props?: Record<string, any>;
  sort_order?: number;
  project: string;
  workspace: string;
  owned_by?: string;
}

// Create Cycle Data
export interface CreateCycleData {
  name: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  view_props?: Record<string, any>;
  owned_by?: string;
}

// Update Cycle Data
export interface UpdateCycleData {
  name?: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  view_props?: Record<string, any>;
  owned_by?: string;
}

// Cycle Response Interface
export interface CycleResponse extends CycleBase {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// Cycle List Filters
export interface CycleListFilters {
  owned_by?: string;
  start_date?: string;
  end_date?: string;
}

// Cycle List Response
export interface CycleListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CycleResponse[];
}
