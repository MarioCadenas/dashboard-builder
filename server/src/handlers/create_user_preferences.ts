
import { db } from '../db';
import { userPreferencesTable } from '../db/schema';
import { type CreateUserPreferencesInput, type UserPreferences } from '../schema';

export const createUserPreferences = async (input: CreateUserPreferencesInput): Promise<UserPreferences> => {
  try {
    // Insert user preferences record
    const result = await db.insert(userPreferencesTable)
      .values({
        user_id: input.user_id,
        theme: input.theme
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('User preferences creation failed:', error);
    throw error;
  }
};
