import { NextFunction, type Request, type Response, Router } from 'express';
import { validateBody, validateQuery } from '@/middleware/validation';
import {
  taskCreateSchema,
  taskUpdateSchema,
} from '@/api/v1/schemas/task.create';
import { taskQuerySchema } from '@/api/v1/schemas/task.query';
import { serializeTask } from '@/api/v1/serializers/taskSerializer';
import { getTaskData, getPatchTaskData } from '@/utils/taskData';
import TaskService from '@/services/taskService';
import { NotFoundError } from '@/errors';

const router = Router();

router.post(
  '/',
  validateBody(taskCreateSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, due_date, status } = req.body;
      const userId = req.user!.userId;
      const data = { title, description, dueDate: due_date, status };

      const newTask = await TaskService.createTask({ userId, data });

      if (!newTask) {
        throw new Error('Failed to create task');
      }

      res.status(201).json({
        data: serializeTask(newTask),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/',
  validateQuery(taskQuerySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, due_date, search, page, limit } = req.validatedQuery;
      const userId = req.user!.userId;

      const { tasks, pagination, stats } = await TaskService.queryTasks({
        userId,
        due_date,
        status,
        search,
        page,
        limit,
      });

      res.status(200).json({
        data: tasks.map((task) => serializeTask(task)),
        meta: {
          pagination,
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const task = await TaskService.findTask({ id, userId });

      if (!task) {
        throw new NotFoundError('Task');
      }

      res.status(200).json({
        data: serializeTask(task),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  validateBody(taskCreateSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, data, userId } = getTaskData(req);

      const updatedTask = await TaskService.updateTask({
        id,
        userId,
        data,
      });

      if (!updatedTask) {
        throw new NotFoundError('Task');
      }

      res.status(200).json({
        data: serializeTask(updatedTask),
      });
    } catch (error) {
      console.error('Task update error:', error);
      next(error);
    }
  }
);

router.patch(
  '/:id',
  validateBody(taskUpdateSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, data, userId } = getPatchTaskData(req);

      const updatedTask = await TaskService.patchTask({ id, userId, data });

      if (!updatedTask) {
        throw new NotFoundError('Task');
      }

      res.status(200).json({
        data: serializeTask(updatedTask),
      });
    } catch (error) {
      console.error('Task partial update error:', error);
      next(error);
    }
  }
);

router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const deletedTask = await TaskService.deleteTask({
        id,
        userId,
      });

      if (!deletedTask) {
        throw new NotFoundError('Task');
      }

      res.status(204).send();
    } catch (error) {
      console.error('Task deletion error:', error);
      next(error);
    }
  }
);

export default router;
