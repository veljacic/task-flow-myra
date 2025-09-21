import { jest } from '@jest/globals';

// Database mock types
export interface MockDbQuery {
  from: jest.MockedFunction<any>;
  where: jest.MockedFunction<any>;
  limit: jest.MockedFunction<any>;
  offset: jest.MockedFunction<any>;
  orderBy: jest.MockedFunction<any>;
  set: jest.MockedFunction<any>;
  values: jest.MockedFunction<any>;
  returning: jest.MockedFunction<any>;
}

export interface MockDb {
  select: jest.MockedFunction<() => Partial<MockDbQuery>>;
  insert: jest.MockedFunction<() => Partial<MockDbQuery>>;
  update: jest.MockedFunction<() => Partial<MockDbQuery>>;
  transaction: jest.MockedFunction<any>;
}

// Helper function to create a mock database
export const createMockDb = (): MockDb => ({
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  transaction: jest.fn(),
});