import { z } from 'zod';

export const taskQuerySchema = z.object({
  status: z.enum(['open', 'closed']).optional(),
  due_date: z.enum(['today', 'this_week', 'overdue']).optional(),
  search: z.string().trim().min(1).optional(),
  page: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Page must be a positive number'
    )
    .default('1'),
  limit: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100,
      'Limit must be between 1 and 100'
    )
    .default('10'),
});

export type TaskQueryParams = z.infer<typeof taskQuerySchema>;
