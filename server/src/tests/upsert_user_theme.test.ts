
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { userPreferencesTable } from '../db/schema';
import { type UpdateUserPreferencesInput } from '../schema';
import { upsertUserTheme } from '../handlers/upsert_user_theme';
import { eq } from 'drizzle-orm';

const testInput: UpdateUserPreferencesInput = {
  user_id: 'test-user-123',
  theme: 'dark'
};

describe('upsertUserTheme', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create new user preferences when none exist', async () => {
    const result = await upsertUserTheme(testInput);

    expect(result.theme).toEqual('dark');
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify record was created in database
    const preferences = await db.select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.user_id, 'test-user-123'))
      .execute();

    expect(preferences).toHaveLength(1);
    expect(preferences[0].theme).toEqual('dark');
    expect(preferences[0].user_id).toEqual('test-user-123');
    expect(preferences[0].created_at).toBeInstanceOf(Date);
    expect(preferences[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update existing user preferences', async () => {
    // Create initial preference
    await db.insert(userPreferencesTable)
      .values({
        user_id: 'test-user-123',
        theme: 'light'
      })
      .execute();

    // Update to dark theme
    const result = await upsertUserTheme(testInput);

    expect(result.theme).toEqual('dark');
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify only one record exists with updated theme
    const preferences = await db.select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.user_id, 'test-user-123'))
      .execute();

    expect(preferences).toHaveLength(1);
    expect(preferences[0].theme).toEqual('dark');
    expect(preferences[0].user_id).toEqual('test-user-123');
  });

  it('should handle light theme upsert', async () => {
    const lightInput: UpdateUserPreferencesInput = {
      user_id: 'test-user-456',
      theme: 'light'
    };

    const result = await upsertUserTheme(lightInput);

    expect(result.theme).toEqual('light');
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify record was created with light theme
    const preferences = await db.select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.user_id, 'test-user-456'))
      .execute();

    expect(preferences).toHaveLength(1);
    expect(preferences[0].theme).toEqual('light');
  });

  it('should update timestamp when theme changes', async () => {
    // Create initial preference
    const initialTime = new Date('2023-01-01T00:00:00Z');
    await db.insert(userPreferencesTable)
      .values({
        user_id: 'test-user-789',
        theme: 'light',
        created_at: initialTime,
        updated_at: initialTime
      })
      .execute();

    // Update theme
    const result = await upsertUserTheme({
      user_id: 'test-user-789',
      theme: 'dark'
    });

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(initialTime.getTime());

    // Verify updated_at was changed in database
    const preferences = await db.select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.user_id, 'test-user-789'))
      .execute();

    expect(preferences[0].updated_at.getTime()).toBeGreaterThan(initialTime.getTime());
    expect(preferences[0].created_at.getTime()).toEqual(initialTime.getTime());
  });
});
