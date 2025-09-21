import jwt from 'jsonwebtoken';
import { User } from '@/db/types';

export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: null,
};

export const generateTestToken = (userId: string = mockUser.id): string => {
  return jwt.sign(
    { userId, email: mockUser.email },
    process.env['JWT_SECRET'] || 'test-secret',
    { expiresIn: '1h' }
  );
};

export const createAuthHeaders = (token?: string) => {
  const authToken = token || generateTestToken();
  return {
    Authorization: `Bearer ${authToken}`,
  };
};