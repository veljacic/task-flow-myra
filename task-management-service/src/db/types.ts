import { usersTable } from './schema';
import { tasksTable } from './schema';

export type User = typeof usersTable.$inferSelect;
export type Task = typeof tasksTable.$inferSelect;
