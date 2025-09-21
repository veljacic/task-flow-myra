import { type Request } from 'express';
import {
  taskCreateSchema,
  taskUpdateSchema,
} from '@/api/v1/schemas/task.create';

interface TaskData {
  id?: string | undefined;
  userId: string;
  data: {
    title: string;
    description?: string | undefined;
    due_date: string;
    status: 'open' | 'closed';
  };
}

interface PatchTaskData {
  id?: string | undefined;
  userId: string;
  data: {
    title?: string | undefined;
    description?: string | undefined;
    due_date?: string | undefined;
    status?: 'open' | 'closed' | undefined;
  };
}

export const getPatchTaskData = (req: Request): PatchTaskData => {
  const { id } = req.params;

  const data = taskUpdateSchema.parse(req.body);
  const userId = req.user!.userId;

  return {
    id,
    userId,
    data,
  };
};

export const getTaskData = (req: Request): TaskData => {
  const { id } = req.params;
  const data = taskCreateSchema.parse(req.body);
  const userId = req.user!.userId;

  return {
    id,
    userId,
    data,
  };
};
