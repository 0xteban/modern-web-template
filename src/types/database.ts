/**
 * Type definitions for Supabase database tables
 */

/**
 * Represents a record in the test table
 */
export interface TestRecord {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

/**
 * Type for creating a new test record (omitting auto-generated fields)
 */
export type CreateTestRecord = Omit<TestRecord, 'id' | 'created_at'>;

/**
 * Type for updating an existing test record (all fields optional)
 */
export type UpdateTestRecord = Partial<Omit<TestRecord, 'id' | 'created_at'>>;
