import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  integer,
  text,
  pgEnum,
  date,
  index,
} from 'drizzle-orm/pg-core';

export const taskStatusEnum = pgEnum('task_status', ['open', 'closed']);

export const usersTable = pgTable(
  'users',
  {
    id: uuid().primaryKey().defaultRandom(),
    email: varchar({ length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('idx_users_email').on(table.email),
  })
);

export const sessionsTable = pgTable(
  'sessions',
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: uuid('user_id')
      .references(() => usersTable.id)
      .notNull(),
    refreshTokenHash: varchar('refresh_token_hash', { length: 255 }).notNull(),
    ip: varchar({ length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    expiresAt: timestamp('expires_at').notNull(),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_sessions_user_id').on(table.userId),
    expiresAtIdx: index('idx_sessions_expires_at').on(table.expiresAt),
    revokedAtIdx: index('idx_sessions_revoked_at').on(table.revokedAt),
    userRevokedIdx: index('idx_sessions_user_revoked').on(
      table.userId,
      table.revokedAt
    ),
  })
);

export const tasksTable = pgTable(
  'tasks',
  {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    status: taskStatusEnum().notNull(),
    userId: uuid('user_id')
      .references(() => usersTable.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    dueDate: date('due_date').notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_tasks_user_id').on(table.userId),
    statusIdx: index('idx_tasks_status').on(table.status),
    dueDateIdx: index('idx_tasks_due_date').on(table.dueDate),
    deletedAtIdx: index('idx_tasks_deleted_at').on(table.deletedAt),
    createdAtIdx: index('idx_tasks_created_at').on(table.createdAt),
    userDeletedIdx: index('idx_tasks_user_deleted').on(
      table.userId,
      table.deletedAt
    ),
    userStatusDeletedIdx: index('idx_tasks_user_status_deleted').on(
      table.userId,
      table.status,
      table.deletedAt
    ),
    userDueDeletedIdx: index('idx_tasks_user_due_deleted').on(
      table.userId,
      table.dueDate,
      table.deletedAt
    ),
  })
);
