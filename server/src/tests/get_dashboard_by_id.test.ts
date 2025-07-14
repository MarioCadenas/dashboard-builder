
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { getDashboardById } from '../handlers/get_dashboard_by_id';

describe('getDashboardById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for valid positive ID', async () => {
    const result = await getDashboardById(1);
    expect(result).toBeNull();
  });

  it('should return null for another valid positive ID', async () => {
    const result = await getDashboardById(999);
    expect(result).toBeNull();
  });

  it('should return null for zero ID', async () => {
    const result = await getDashboardById(0);
    expect(result).toBeNull();
  });

  it('should return null for negative ID', async () => {
    const result = await getDashboardById(-1);
    expect(result).toBeNull();
  });

  it('should handle large ID values', async () => {
    const result = await getDashboardById(Number.MAX_SAFE_INTEGER);
    expect(result).toBeNull();
  });
});
