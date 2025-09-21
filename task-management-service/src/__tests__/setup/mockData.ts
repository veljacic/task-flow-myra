import { Task, User } from '@/db/types';

export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  passwordHash: '$2b$10$hashedpassword',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  lastLoginAt: new Date('2023-01-01'),
};

export const mockTask: Task = {
  id: 'test-task-id',
  userId: mockUser.id,
  title: 'Test Task',
  description: 'This is a test task',
  status: 'open',
  dueDate: '2024-12-31',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  deletedAt: null,
};

export const mockTasks: Task[] = [
  mockTask,
  {
    id: 'test-task-id-2',
    userId: mockUser.id,
    title: 'Another Test Task',
    description: 'This is another test task',
    status: 'closed',
    dueDate: '2024-01-01',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    deletedAt: null,
  },
  {
    id: 'test-task-id-3',
    userId: mockUser.id,
    title: 'Overdue Task',
    description: 'This task is overdue',
    status: 'open',
    dueDate: '2023-12-01',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
    deletedAt: null,
  },
];

export const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  ...mockTask,
  ...overrides,
  id: overrides.id || `test-task-${Math.random().toString(36).substr(2, 9)}`,
});

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  ...mockUser,
  ...overrides,
  id: overrides.id || `test-user-${Math.random().toString(36).substr(2, 9)}`,
});