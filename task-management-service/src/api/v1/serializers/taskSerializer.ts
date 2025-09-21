import { Task } from '@/db/types';

export const serializeTask = (task: Task) => ({
  id: task.id,
  type: 'tasks',
  attributes: {
    title: task.title,
    description: task.description,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    dueDate: task.dueDate,
  },
});
