
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { userPreferencesTable } from '../db/schema';
import { createDashboardComponent } from '../handlers/create_dashboard_component';

// Define basic types since they're missing from schema
interface CreateDashboardComponentInput {
  dashboard_id: number;
  component_type: string;
  title: string;
  config?: any;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
}

describe('createDashboardComponent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  const testInput: CreateDashboardComponentInput = {
    dashboard_id: 1,
    component_type: 'chart',
    title: 'Test Component',
    config: { chartType: 'line', dataSource: 'sales' },
    position_x: 0,
    position_y: 0,
    width: 6,
    height: 4
  };

  it('should create a dashboard component', async () => {
    const result = await createDashboardComponent(testInput);

    expect(result.dashboard_id).toEqual(1);
    expect(result.component_type).toEqual('chart');
    expect(result.title).toEqual('Test Component');
    expect(result.config).toEqual({ chartType: 'line', dataSource: 'sales' });
    expect(result.position_x).toEqual(0);
    expect(result.position_y).toEqual(0);
    expect(result.width).toEqual(6);
    expect(result.height).toEqual(4);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null config', async () => {
    const input = { 
      ...testInput, 
      config: null
    };
    
    const result = await createDashboardComponent(input);

    expect(result.config).toBeNull();
  });

  it('should create component with different positions and sizes', async () => {
    const input = {
      ...testInput,
      position_x: 6,
      position_y: 4,
      width: 3,
      height: 2
    };
    
    const result = await createDashboardComponent(input);

    expect(result.position_x).toEqual(6);
    expect(result.position_y).toEqual(4);
    expect(result.width).toEqual(3);
    expect(result.height).toEqual(2);
  });

  it('should create component with different types', async () => {
    const input = {
      ...testInput,
      component_type: 'table',
      title: 'Data Table',
      config: { columns: ['name', 'value'], pageSize: 10 }
    };
    
    const result = await createDashboardComponent(input);

    expect(result.component_type).toEqual('table');
    expect(result.title).toEqual('Data Table');
    expect(result.config).toEqual({ columns: ['name', 'value'], pageSize: 10 });
  });

  it('should create component with widget type', async () => {
    const input = {
      ...testInput,
      component_type: 'widget',
      title: 'Status Widget',
      config: { type: 'status', refreshRate: 30 }
    };
    
    const result = await createDashboardComponent(input);

    expect(result.component_type).toEqual('widget');
    expect(result.title).toEqual('Status Widget');
    expect(result.config).toEqual({ type: 'status', refreshRate: 30 });
  });

  it('should generate unique ids for different components', async () => {
    const result1 = await createDashboardComponent(testInput);
    const result2 = await createDashboardComponent({
      ...testInput,
      title: 'Different Component'
    });

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.id).toBeDefined();
    expect(result2.id).toBeDefined();
  });
});
