import { config } from 'dotenv';

config({ path: '.env.test' });

// Global Jest setup for better TypeScript support
global.console = {
  ...console,
  // Suppress console.warn/error/log during tests
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

beforeAll(async () => {
  console.log('Jest setup complete');
});

afterAll(async () => {
  console.log('Jest teardown complete');
});