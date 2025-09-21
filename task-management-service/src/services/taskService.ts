import { db } from '@/db';
import {
  eq,
  and,
  isNull,
  ilike,
  or,
  gte,
  lt,
  count,
  sum,
  sql,
} from 'drizzle-orm';
import { tasksTable } from '@/db/schema';
import { Task } from '@/db/types';
import { type Response } from 'express';
import { TaskCreateData, TaskUpdateData } from '@/api/v1/schemas/task.create';

interface TaskProps {
  title: string;
  description: string | undefined;
  status: 'open' | 'closed';
  dueDate: string;
}

interface QueryProps {
  userId: string;
  status?: 'open' | 'closed';
  due_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StatsProps {
  open: number;
  closed: number;
  overdue: number;
  total: number;
}

interface QueryResponse {
  tasks: Task[];
  pagination: PaginationProps;
  stats: StatsProps;
}

const queryTasks = async ({
  userId,
  status,
  due_date,
  search,
  page = 1,
  limit = 10,
}: QueryProps): Promise<QueryResponse> => {
  const baseConditions = [
    eq(tasksTable.userId, userId),
    isNull(tasksTable.deletedAt),
  ];

  // Add status filter
  if (status) {
    baseConditions.push(eq(tasksTable.status, status));
  }

  // Add due date filters
  if (due_date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Convert dates to ISO date strings (YYYY-MM-DD format)
    const todayStr = today.toISOString().split('T')[0]!;
    const tomorrowStr = tomorrow.toISOString().split('T')[0]!;
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0]!;
    const endOfWeekStr = endOfWeek.toISOString().split('T')[0]!;
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0]!;
    const endOfMonthStr = endOfMonth.toISOString().split('T')[0]!;
    const nowStr = now.toISOString().split('T')[0]!;

    switch (due_date) {
      case 'today':
        baseConditions.push(
          gte(tasksTable.dueDate, todayStr),
          lt(tasksTable.dueDate, tomorrowStr)
        );
        break;
      case 'week':
        baseConditions.push(
          gte(tasksTable.dueDate, startOfWeekStr),
          lt(tasksTable.dueDate, endOfWeekStr)
        );
        break;
      case 'overdue':
        baseConditions.push(
          lt(tasksTable.dueDate, nowStr),
          eq(tasksTable.status, 'open')
        );
        break;
      case 'month':
        baseConditions.push(
          gte(tasksTable.dueDate, startOfMonthStr),
          lt(tasksTable.dueDate, endOfMonthStr)
        );
        break;
    }
  }

  // Add search filter
  if (search) {
    baseConditions.push(
      or(
        ilike(tasksTable.title, `%${search}%`),
        ilike(tasksTable.description, `%${search}%`)
      )!
    );
  }

  // Get total count for pagination
  const countResult = await db
    .select({ total: count() })
    .from(tasksTable)
    .where(and(...baseConditions));

  const total = countResult[0]?.total || 0;

  // Get paginated results
  const offset = (page - 1) * limit;
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(and(...baseConditions))
    .orderBy(tasksTable.createdAt)
    .limit(limit)
    .offset(offset);

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);

  const pagination = {
    page,
    limit,
    total,
    totalPages,
  };

  // Calculate stats in a single query using conditional aggregation
  const statsBaseConditions = [
    eq(tasksTable.userId, userId),
    isNull(tasksTable.deletedAt),
  ];

  const now = new Date();
  const nowStr = now.toISOString().split('T')[0]!;

  const statsResult = await db
    .select({
      total: count(),
      open: sum(sql`CASE WHEN ${tasksTable.status} = 'open' THEN 1 ELSE 0 END`),
      closed: sum(
        sql`CASE WHEN ${tasksTable.status} = 'closed' THEN 1 ELSE 0 END`
      ),
      overdue: sum(
        sql`CASE WHEN ${tasksTable.status} = 'open' AND ${tasksTable.dueDate} < ${nowStr} THEN 1 ELSE 0 END`
      ),
    })
    .from(tasksTable)
    .where(and(...statsBaseConditions));

  const stats = {
    total: Number(statsResult[0]?.total || 0),
    open: Number(statsResult[0]?.open || 0),
    closed: Number(statsResult[0]?.closed || 0),
    overdue: Number(statsResult[0]?.overdue || 0),
  };

  return { tasks, pagination, stats };
};

const findTask = async ({
  id,
  userId,
}: {
  id: string | undefined;
  userId: string;
}): Promise<Task | undefined> => {
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.id, String(id)),
        eq(tasksTable.userId, userId),
        isNull(tasksTable.deletedAt)
      )
    )
    .limit(1);

  return task;
};

const createTask = async ({
  userId,
  data,
}: {
  userId: string;
  data: TaskProps;
}): Promise<Task | undefined> => {
  const [newTask] = await db
    .insert(tasksTable)
    .values({ ...data, userId })
    .returning();

  return newTask;
};

const updateTask = async ({
  id,
  userId,
  data,
}: {
  id: string | undefined;
  userId: string;
  data: TaskCreateData;
}): Promise<Task | undefined> => {
  const [updatedTask] = await db
    .update(tasksTable)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(tasksTable.id, String(id)),
        eq(tasksTable.userId, userId),
        isNull(tasksTable.deletedAt)
      )
    )
    .returning();

  return updatedTask;
};

const deleteTask = async ({
  id,
  userId,
}: {
  id: string | undefined;
  userId: string;
}): Promise<Task | undefined> => {
  const [softDeletedTask] = await db
    .update(tasksTable)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(tasksTable.id, String(id)),
        eq(tasksTable.userId, userId),
        isNull(tasksTable.deletedAt)
      )
    )
    .returning();

  return softDeletedTask;
};

const patchTask = async ({
  id,
  userId,
  data,
}: {
  id: string | undefined;
  userId: string;
  data: TaskUpdateData;
}): Promise<Task | undefined> => {
  const [updatedTask] = await db
    .update(tasksTable)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(tasksTable.id, String(id)),
        eq(tasksTable.userId, userId),
        isNull(tasksTable.deletedAt)
      )
    )
    .returning();

  return updatedTask;
};

const returnNotFound = (res: Response): void => {
  res.status(404).json({
    errors: [
      {
        status: '404',
        title: 'Not Found',
        detail: 'Task not found',
      },
    ],
  });
};

const returnServerError = (res: Response): void => {
  res.status(500).json({
    errors: [
      {
        status: '500',
        title: 'Internal Server Error',
        detail: 'An error occurred while updating the task',
      },
    ],
  });
};

export default {
  findTask,
  updateTask,
  patchTask,
  deleteTask,
  queryTasks,
  createTask,
  returnNotFound,
  returnServerError,
};
