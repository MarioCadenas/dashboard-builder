
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { userPreferencesTable } from '../db/schema';
import { type UpdateUserPreferencesInput, type CreateUserPreferencesInput } from '../schema';
import { updateDashboard } from '../handlers/update_dashboard';
import { eq } from 'drizzle-orm';

// Test input for updating preferences
const testUpdateInput: UpdateUserPreferencesInput = {
  user_id: 'user123',
  theme: 'dark'
};

// Test input for creating initial preferences
const testCreateInput: CreateUserPreferencesInput = {
  user_id: 'user123',
  theme: 'light'
};

describe('updateDashboard', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update existing user preferences', async () => {
    // Create initial preferences
    await db.insert(userPreferencesTable)
      .values({
        user_id: testCreateInput.user_id,
        theme: testCreateInput.theme
      })
      .execute();

    // Update preferences
    const result = await updateDashboard(testUpdateInput);

    // Verify update result
    expect(result).not.toBeNull();
    expect(result!.user_id).toEqual('user123');
    expect(result!.theme).toEqual('dark');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated preferences to database', async () => {
    // Create initial preferences
    await db.insert(userPreferencesTable)
      .values({
        user_id: testCreateInput.user_id,
        theme: testCreateInput.theme
      })
      .execute();

    // Update preferences
    const result = await updateDashboard(testUpdateInput);

    // Query database to verify update
    const preferences = await db.select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.user_id, 'user123'))
      .execute();

    expect(preferences).toHaveLength(1);
    expect(preferences[0].theme).toEqual('dark');
    expect(preferences[0].updated_at).toBeInstanceOf(Date);
    expect(preferences[0].updated_at.getTime()).toBeGreaterThan(preferences[0].created_at.getTime());
  });

  it('should return null when user preferences do not exist', async () => {
    // Try to update non-existent preferences
    const result = await updateDashboard(testUpdateInput);

    // Should return null
    expect(result).toBeNull();
  });

  it('should update theme from dark to light', async () => {
    // Create initial preferences with dark theme
    await db.insert(userPreferencesTable)
      .values({
        user_id: 'user456',
        theme: 'dark'
      })
      .execute();

    // Update to light theme
    const updateInput: UpdateUserPreferencesInput = {
      user_id: 'user456',
      theme: 'light'
    };

    const result = await updateDashboard(updateInput);

    // Verify theme was updated
    expect(result).not.toBeNull();
    expect(result!.theme).toEqual('light');
    expect(result!.user_id).toEqual('user456');
  });

  it('should update the updated_at timestamp', async () => {
    // Create initial preferences
    const createResult = await db.insert(userPreferencesTable)
      .values({
        user_id: testCreateInput.user_id,
        theme: testCreateInput.theme
      })
      .returning()
      .execute();

    const originalUpdatedAt = createResult[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update preferences
    const result = await updateDashboard(testUpdateInput);

    // Verify updated_at was changed
    expect(result).not.toBeNull();
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});
