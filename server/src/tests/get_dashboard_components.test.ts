
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { getDashboardComponents } from '../handlers/get_dashboard_components';

describe('getDashboardComponents', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no components exist', async () => {
    const result = await getDashboardComponents(1);
    expect(result).toEqual([]);
  });

  it('should return empty array for non-existent dashboard', async () => {
    const result = await getDashboardComponents(999);
    expect(result).toEqual([]);
  });

  // Note: Additional tests would be added once the dashboard components schema is defined
  // These would include:
  // - Creating test dashboard components and verifying they're returned
  // - Testing the ordering by position_y then position_x
  // - Testing that only components for the specified dashboard are returned
});
