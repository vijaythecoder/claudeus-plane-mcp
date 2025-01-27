import { z } from 'zod';

// Project Schema for validation
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  identifier: z.string(),
  description: z.string().nullable(),
  network: z.number(),
  workspace: z.string().uuid(),
  project_lead: z.string().uuid().nullable(),
  default_assignee: z.string().uuid().nullable(),
  is_member: z.boolean(),
  member_role: z.number(),
  total_members: z.number(),
  total_cycles: z.number(),
  total_modules: z.number(),
  module_view: z.boolean(),
  cycle_view: z.boolean(),
  issue_views_view: z.boolean(),
  page_view: z.boolean(),
  inbox_view: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid(),
});

// Project type derived from schema
export type Project = z.infer<typeof ProjectSchema>;

// Project creation payload schema
export const CreateProjectSchema = z.object({
  name: z.string(),
  identifier: z.string(),
  description: z.string().optional(),
  project_lead: z.string().uuid().optional(),
  default_assignee: z.string().uuid().optional(),
});

export type CreateProjectPayload = z.infer<typeof CreateProjectSchema>;

// Project update payload schema
export const UpdateProjectSchema = CreateProjectSchema.partial();

export type UpdateProjectPayload = z.infer<typeof UpdateProjectSchema>; 