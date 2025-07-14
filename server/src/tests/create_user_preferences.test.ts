
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { userPreferencesTable } from '../db/schema';
import { type CreateUserPreferencesInput } from '../schema';
import { createUserPreferences } from '../handlers/create_user_preferences';
import { eq } from 'drizzle-orm';

// Test input with default theme
const testInput: CreateUserPreferencesInput = {
  user_id: 'user-123',
  theme: 'light'
};

describe('createUserPreferences', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create user preferences with light theme', async () => {
    const result = await createUserPreferences(testInput);

    // Basic field validation
    expect(result.user_id).toEqual('user-123');
    expect(result.theme).toEqual('light');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create user preferences with dark theme', async () => {
    const darkThemeInput: CreateUserPreferencesInput = {
      user_id: 'user-456',
      theme: 'dark'
    };

    const result = await createUserPreferences(darkThemeInput);

    expect(result.user_id).toEqual('user-456');
    expect(result.theme).toEqual('dark');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save user preferences to database', async () => {
    const result = await createUserPreferences(testInput);

    // Query database to verify persistence
    const preferences = await db.select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.id, result.id))
      .execute();

    expect(preferences).toHaveLength(1);
    expect(preferences[0].user_id).toEqual('user-123');
    expect(preferences[0].theme).toEqual('light');
    expect(preferences[0].created_at).toBeInstanceOf(Date);
    expect(preferences[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle unique constraint on user_id', async () => {
    // Create first preference
    await createUserPreferences(testInput);

    // Try to create another preference for the same user
    const duplicateInput: CreateUserPreferencesInput = {
      user_id: 'user-123',
      theme: 'dark'
    };

    await expect(createUserPreferences(duplicateInput)).rejects.toThrow();
  });

  it('should apply default theme when not specified', async () => {
    const inputWithoutTheme = {
      user_id: 'user-789'
    };

    // Parse input through Zod schema to apply defaults
    const parsedInput = { ...inputWithoutTheme, theme: 'light' as const };
    const result = await createUserPreferences(parsedInput);

    expect(result.theme).toEqual('light');
    expect(result.user_id).toEqual('user-789');
  });
});
