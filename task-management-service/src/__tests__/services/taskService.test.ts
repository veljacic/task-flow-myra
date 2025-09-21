import { jest } from '@jest/globals';
import TaskService from '@/services/taskService';
import { tasksTable } from '@/db/schema';
import {
  mockTask,
  mockTasks,
  mockUser,
  createMockTask,
} from '../setup/mockData';

// Mock the entire modules first
jest.mock('@/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

// @ts-ignore - Import after mocking
const { db } = require('@/db');
const mockDb = db;

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('queryTasks', () => {
    it('should return paginated tasks with stats', async () => {
      const mockCountResult = [{ total: 3 }];
      const mockStatsResult = [{ total: 3, open: 2, closed: 1, overdue: 1 }];

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockCountResult),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue(mockTasks),
              }),
            }),
          }),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockStatsResult),
        }),
      });

      const result = await TaskService.queryTasks({
        userId: mockUser.id,
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        tasks: mockTasks,
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
        },
        stats: {
          total: 3,
          open: 2,
          closed: 1,
          overdue: 1,
        },
      });
    });

    it('should handle status filter', async () => {
      const mockCountResult = [{ total: 1 }];
      const mockStatsResult = [{ total: 1, open: 1, closed: 0, overdue: 0 }];
      const openTasks = [mockTasks[0]];

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockCountResult),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue(openTasks),
              }),
            }),
          }),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockStatsResult),
        }),
      });

      const result = await TaskService.queryTasks({
        userId: mockUser.id,
        status: 'open',
        page: 1,
        limit: 10,
      });

      expect(result.tasks).toEqual(openTasks);
      expect(result.stats.open).toBe(1);
    });

    it('should handle search filter', async () => {
      const mockCountResult = [{ total: 1 }];
      const mockStatsResult = [{ total: 1, open: 1, closed: 0, overdue: 0 }];
      const searchResults = [mockTasks[0]];

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockCountResult),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue(searchResults),
              }),
            }),
          }),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockStatsResult),
        }),
      });

      const result = await TaskService.queryTasks({
        userId: mockUser.id,
        search: 'test',
        page: 1,
        limit: 10,
      });

      expect(result.tasks).toEqual(searchResults);
    });
  });

  describe('findTask', () => {
    it('should return a task when found', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockTask]),
          }),
        }),
      });

      const result = await TaskService.findTask({
        id: mockTask.id,
        userId: mockUser.id,
      });

      expect(result).toEqual(mockTask);
    });

    it('should return undefined when task not found', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await TaskService.findTask({
        id: 'non-existent-id',
        userId: mockUser.id,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        status: 'open' as const,
        dueDate: '2024-12-31',
      };

      const newTask = createMockTask(taskData);

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newTask]),
        }),
      });

      const result = await TaskService.createTask({
        userId: mockUser.id,
        data: taskData,
      });

      expect(result).toEqual(newTask);
      expect(mockDb.insert).toHaveBeenCalledWith(tasksTable);
    });

    it('should handle creation failure', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        status: 'open' as const,
        dueDate: '2024-12-31',
      };

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await TaskService.createTask({
        userId: mockUser.id,
        data: taskData,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'closed' as const,
        due_date: '2025-01-01',
      };

      const updatedTask = { ...mockTask, ...updateData };

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedTask]),
          }),
        }),
      });

      const result = await TaskService.updateTask({
        id: mockTask.id,
        userId: mockUser.id,
        data: updateData,
      });

      expect(result).toEqual(updatedTask);
      expect(mockDb.update).toHaveBeenCalledWith(tasksTable);
    });

    it('should return undefined when task not found for update', async () => {
      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'closed' as const,
        due_date: '2025-01-01',
      };

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await TaskService.updateTask({
        id: 'non-existent-id',
        userId: mockUser.id,
        data: updateData,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('patchTask', () => {
    it('should partially update an existing task', async () => {
      const patchData = {
        status: 'closed' as const,
      };

      const patchedTask = { ...mockTask, status: 'closed' as const };

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([patchedTask]),
          }),
        }),
      });

      const result = await TaskService.patchTask({
        id: mockTask.id,
        userId: mockUser.id,
        data: patchData,
      });

      expect(result).toEqual(patchedTask);
      expect(mockDb.update).toHaveBeenCalledWith(tasksTable);
    });

    it('should return undefined when task not found for patch', async () => {
      const patchData = {
        status: 'closed' as const,
      };

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await TaskService.patchTask({
        id: 'non-existent-id',
        userId: mockUser.id,
        data: patchData,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('deleteTask', () => {
    it('should soft delete a task', async () => {
      const deletedTask = { ...mockTask, deletedAt: new Date() };

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([deletedTask]),
          }),
        }),
      });

      const result = await TaskService.deleteTask({
        id: mockTask.id,
        userId: mockUser.id,
      });

      expect(result).toEqual(deletedTask);
      expect(mockDb.update).toHaveBeenCalledWith(tasksTable);
    });

    it('should return undefined when task not found for deletion', async () => {
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await TaskService.deleteTask({
        id: 'non-existent-id',
        userId: mockUser.id,
      });

      expect(result).toBeUndefined();
    });
  });
});
