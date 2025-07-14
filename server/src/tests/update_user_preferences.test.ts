
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { userPreferencesTable } from '../db/schema';
import { type UpdateUserPreferencesInput } from '../schema';
import { updateUserPreferences } from '../handlers/update_user_preferences';
import { eq } from 'drizzle-orm';

// Test input for updating preferences
const testInput: UpdateUserPreferencesInput = {
  user_id: 'test-user-123',
  theme: 'dark'
};

describe('updateUserPreferences', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update existing user preferences', async () => {
    // Create initial preferences
    await db.insert(userPreferencesTable)
      .values({
        user_id: 'test-user-123',
        theme: 'light'
      })
      .execute();

    const result = await updateUserPreferences(testInput);

    // Verify updated fields
    expect(result.user_id).toEqual('test-user-123');
    expect(result.theme).toEqual('dark');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated preferences to database', async () => {
    // Create initial preferences
    await db.insert(userPreferencesTable)
      .values({
        user_id: 'test-user-123',
        theme: 'light'
      })
      .execute();

    const result = await updateUserPreferences(testInput);

    // Query database to verify persistence
    const preferences = await db.select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.user_id, 'test-user-123'))
      .execute();

    expect(preferences).toHaveLength(1);
    expect(preferences[0].theme).toEqual('dark');
    expect(preferences[0].updated_at).toBeInstanceOf(Date);
    expect(preferences[0].id).toEqual(result.id);
  });

  it('should update the updated_at timestamp', async () => {
    // Create initial preferences
    const initialTime = new Date('2023-01-01T00:00:00Z');
    await db.insert(userPreferencesTable)
      .values({
        user_id: 'test-user-123',
        theme: 'light',
        created_at: initialTime,
        updated_at: initialTime
      })
      .execute();

    const result = await updateUserPreferences(testInput);

    // Verify updated_at is more recent than initial time
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(initialTime.getTime());
  });

  it('should throw error when user preferences do not exist', async () => {
    // Attempt to update non-existent preferences
    await expect(updateUserPreferences({
      user_id: 'non-existent-user',
      theme: 'dark'
    })).rejects.toThrow(/User preferences not found/);
  });

  it('should update theme from dark to light', async () => {
    // Create initial preferences with dark theme
    await db.insert(userPreferencesTable)
      .values({
        user_id: 'test-user-123',
        theme: 'dark'
      })
      .execute();

    const result = await updateUserPreferences({
      user_id: 'test-user-123',
      theme: 'light'
    });

    expect(result.theme).toEqual('light');
    expect(result.user_id).toEqual('test-user-123');
  });
});
