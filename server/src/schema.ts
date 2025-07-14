
import { z } from 'zod';

// Theme enum for validation
export const themeSchema = z.enum(['light', 'dark']);

// User preferences schema
export const userPreferencesSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  theme: themeSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// Input schema for creating user preferences
export const createUserPreferencesInputSchema = z.object({
  user_id: z.string(),
  theme: themeSchema.default('light')
});

export type CreateUserPreferencesInput = z.infer<typeof createUserPreferencesInputSchema>;

// Input schema for updating user preferences
export const updateUserPreferencesInputSchema = z.object({
  user_id: z.string(),
  theme: themeSchema
});

export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesInputSchema>;

// Input schema for getting user preferences
export const getUserPreferencesInputSchema = z.object({
  user_id: z.string()
});

export type GetUserPreferencesInput = z.infer<typeof getUserPreferencesInputSchema>;

// Theme response schema
export const themeResponseSchema = z.object({
  theme: themeSchema,
  updated_at: z.coerce.date()
});

export type ThemeResponse = z.infer<typeof themeResponseSchema>;
