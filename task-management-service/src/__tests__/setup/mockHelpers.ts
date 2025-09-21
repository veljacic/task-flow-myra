import { jest } from '@jest/globals';

// Helper function to create a properly typed mock
export const createMockFn = <T extends (...args: any[]) => any>(): jest.MockedFunction<T> => {
  return jest.fn() as jest.MockedFunction<T>;
};

// Helper function to create a mock that returns a value
export const createMockResolvedValue = <T>(value: T): jest.MockedFunction<() => Promise<T>> => {
  const mockFn = jest.fn() as jest.MockedFunction<() => Promise<T>>;
  mockFn.mockResolvedValue(value);
  return mockFn;
};

// Helper function to create a mock that returns a value synchronously
export const createMockReturnValue = <T>(value: T): jest.MockedFunction<() => T> => {
  const mockFn = jest.fn() as jest.MockedFunction<() => T>;
  mockFn.mockReturnValue(value);
  return mockFn;
};