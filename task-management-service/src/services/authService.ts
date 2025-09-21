import bcrypt from 'bcrypt';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/db/index';
import { usersTable, sessionsTable } from '@/db/schema';
import { User } from '@/db/types';

export type AuthResult =
  | { success: true; user: User }
  | { success: false; user?: User };

const findUserByEmail = async (email: string): Promise<User | null> => {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  return users[0] || null;
};

const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const validateCredentials = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const user = await findUserByEmail(email);

  if (!user) {
    return {
      success: false,
    };
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    return {
      success: false,
    };
  }

  return {
    success: true,
    user,
  };
};

export const createSession = async ({
  userId,
  ip,
  userAgent,
  refreshToken,
  refreshTokenExpiresIn,
}: {
  userId: string;
  ip: string;
  userAgent: string;
  refreshToken: string;
  refreshTokenExpiresIn: number;
}): Promise<void> => {
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  // Use a transaction to ensure both operations succeed or fail together
  await db.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(usersTable.id, userId));

    await tx.insert(sessionsTable).values({
      userId,
      refreshTokenHash,
      ip,
      userAgent,
      expiresAt: new Date(Date.now() + refreshTokenExpiresIn * 1000),
    });
  });
};

export const findValidSession = async (
  userId: string,
  refreshToken: string
): Promise<{ id: number } | null> => {
  const sessions = await db
    .select()
    .from(sessionsTable)
    .where(
      and(eq(sessionsTable.userId, userId), isNull(sessionsTable.revokedAt))
    );

  for (const session of sessions) {
    if (new Date() > session.expiresAt) {
      continue;
    }

    const isValidToken = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash
    );

    if (isValidToken) {
      return { id: session.id };
    }
  }

  return null;
};

export const refreshSession = async ({
  id,
  ip,
  userAgent,
  refreshToken,
  refreshTokenExpiresIn,
}: {
  id: number;
  ip: string;
  userAgent: string;
  refreshToken: string;
  refreshTokenExpiresIn: number;
}): Promise<void> => {
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await db
    .update(sessionsTable)
    .set({
      refreshTokenHash,
      ip,
      userAgent,
      expiresAt: new Date(Date.now() + refreshTokenExpiresIn * 1000),
    })
    .where(eq(sessionsTable.id, id));
};

export const revokeSession = async (
  userId: string,
  refreshToken: string
): Promise<boolean> => {
  const validSession = await findValidSession(userId, refreshToken);

  if (!validSession) {
    return false;
  }

  await db
    .update(sessionsTable)
    .set({ revokedAt: new Date() })
    .where(eq(sessionsTable.id, validSession.id));

  return true;
};

const registerUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<User | undefined> => {
  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(usersTable)
    .values({
      email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newUser;
};

const AuthService = {
  validateCredentials,
  createSession,
  findValidSession,
  refreshSession,
  revokeSession,
  findUserByEmail,
  registerUser,
};

export default AuthService;
