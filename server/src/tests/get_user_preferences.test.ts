
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { userPreferencesTable } from '../db/schema';
import { type GetUserPreferencesInput } from '../schema';
import { getUserPreferences } from '../handlers/get_user_preferences';
import { eq } from 'drizzle-orm';

// Test input
const testInput: GetUserPreferencesInput = {
  user_id: 'test-user-123'
};

describe('getUserPreferences', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no preferences exist for user', async () => {
    const result = await getUserPreferences(testInput);

    expect(result).toBeNull();
  });

  it('should return user preferences when they exist', async () => {
    // Create test preferences first
    await db.insert(userPreferencesTable)
      .values({
        user_id: 'test-user-123',
        theme: 'dark'
      })
      .execute();

    const result = await getUserPreferences(testInput);

    expect(result).not.toBeNull();
    expect(result!.user_id).toEqual('test-user-123');
    expect(result!.theme).toEqual('dark');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return preferences with default theme when created without explicit theme', async () => {
    // Create preferences without specifying theme (should use default 'light')
    await db.insert(userPreferencesTable)
      .values({
        user_id: 'test-user-123'
        // theme will default to 'light' per schema
      })
      .execute();

    const result = await getUserPreferences(testInput);

    expect(result).not.toBeNull();
    expect(result!.user_id).toEqual('test-user-123');
    expect(result!.theme).toEqual('light');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return correct preferences for specific user among multiple users', async () => {
    // Create preferences for multiple users
    await db.insert(userPreferencesTable)
      .values([
        { user_id: 'user-1', theme: 'light' },
        { user_id: 'user-2', theme: 'dark' },
        { user_id: 'test-user-123', theme: 'dark' }
      ])
      .execute();

    const result = await getUserPreferences(testInput);

    expect(result).not.toBeNull();
    expect(result!.user_id).toEqual('test-user-123');
    expect(result!.theme).toEqual('dark');
  });

  it('should handle different user IDs correctly', async () => {
    // Create preferences for one user
    await db.insert(userPreferencesTable)
      .values({
        user_id: 'different-user',
        theme: 'dark'
      })
      .execute();

    // Query for a different user
    const result = await getUserPreferences({ user_id: 'test-user-123' });

    expect(result).toBeNull();
  });
});
