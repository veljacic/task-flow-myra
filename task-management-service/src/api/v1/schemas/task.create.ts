import { z } from 'zod';

export const taskCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),
  description: z.string().trim().optional(),
  due_date: z.iso.date().refine((date) => {
    return new Date(date) > new Date();
  }, 'Due date cannot be in the past'),
  status: z.enum(['open', 'closed']).optional().default('open'),
});

export const taskUpdateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(255, 'Title must be 255 characters or less')
      .optional(),
    description: z.string().trim().optional(),
    due_date: z.iso
      .datetime()
      .refine((date) => {
        return new Date(date) > new Date();
      }, 'Due date cannot be in the past')
      .optional(),
    status: z.enum(['open', 'closed']).optional(),
  })
  .partial();

export type TaskCreateData = z.infer<typeof taskCreateSchema>;
export type TaskUpdateData = z.infer<typeof taskUpdateSchema>;
