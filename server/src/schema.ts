
import { z } from 'zod';

// Dashboard schema
export const dashboardSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Dashboard = z.infer<typeof dashboardSchema>;

// Input schema for creating dashboards
export const createDashboardInputSchema = z.object({
  name: z.string().min(1, "Dashboard name is required"),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true)
});

export type CreateDashboardInput = z.infer<typeof createDashboardInputSchema>;

// Input schema for updating dashboards
export const updateDashboardInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateDashboardInput = z.infer<typeof updateDashboardInputSchema>;

// Dashboard component schema for future extensibility
export const dashboardComponentSchema = z.object({
  id: z.number(),
  dashboard_id: z.number(),
  component_type: z.enum(['chart', 'table', 'metric', 'text']),
  title: z.string(),
  config: z.record(z.any()).nullable(), // JSON configuration for component
  position_x: z.number().int(),
  position_y: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type DashboardComponent = z.infer<typeof dashboardComponentSchema>;

// Input schema for creating dashboard components
export const createDashboardComponentInputSchema = z.object({
  dashboard_id: z.number(),
  component_type: z.enum(['chart', 'table', 'metric', 'text']),
  title: z.string().min(1, "Component title is required"),
  config: z.record(z.any()).nullable().optional(),
  position_x: z.number().int().nonnegative(),
  position_y: z.number().int().nonnegative(),
  width: z.number().int().positive(),
  height: z.number().int().positive()
});

export type CreateDashboardComponentInput = z.infer<typeof createDashboardComponentInputSchema>;

// Input schema for updating dashboard components
export const updateDashboardComponentInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  config: z.record(z.any()).nullable().optional(),
  position_x: z.number().int().nonnegative().optional(),
  position_y: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional()
});

export type UpdateDashboardComponentInput = z.infer<typeof updateDashboardComponentInputSchema>;
