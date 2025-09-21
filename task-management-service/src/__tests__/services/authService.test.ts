import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import AuthService, {
  validateCredentials,
  createSession,
  findValidSession,
  refreshSession,
  revokeSession,
} from '@/services/authService';
import { usersTable, sessionsTable } from '@/db/schema';
import { mockUser, createMockUser } from '../setup/mockData';

// Mock the entire modules first
jest.mock('@/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    transaction: jest.fn(),
  },
}));

jest.mock('bcrypt');

// @ts-ignore - Import after mocking
const { db } = require('@/db');

const mockDb = db;
const mockBcrypt = require('bcrypt');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCredentials', () => {
    it('should return success true for valid credentials', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      mockBcrypt.compare.mockResolvedValue(true);

      const result = await validateCredentials(mockUser.email, 'correct-password');

      expect(result).toEqual({
        success: true,
        user: mockUser,
      });

      expect(mockBcrypt.compare).toHaveBeenCalledWith('correct-password', mockUser.passwordHash);
    });

    it('should return success false for non-existent user', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await validateCredentials('nonexistent@example.com', 'password');

      expect(result).toEqual({
        success: false,
      });

      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return success false for invalid password', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      mockBcrypt.compare.mockResolvedValue(false);

      const result = await validateCredentials(mockUser.email, 'wrong-password');

      expect(result).toEqual({
        success: false,
      });

      expect(mockBcrypt.compare).toHaveBeenCalledWith('wrong-password', mockUser.passwordHash);
    });
  });

  describe('createSession', () => {
    it('should create a new session successfully', async () => {
      const sessionData = {
        userId: mockUser.id,
        ip: '127.0.0.1',
        userAgent: 'Test User Agent',
        refreshToken: 'refresh-token',
        refreshTokenExpiresIn: 3600,
      };

      mockBcrypt.hash.mockResolvedValue('hashed-refresh-token');

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(undefined),
            }),
          }),
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockResolvedValue(undefined),
          }),
        };
        await callback(tx);
      });

      mockDb.transaction = mockTransaction;

      await createSession(sessionData);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('refresh-token', 10);
      expect(mockTransaction).toHaveBeenCalled();
    });
  });

  describe('findValidSession', () => {
    it('should find and return valid session', async () => {
      const mockSession = {
        id: 1,
        userId: mockUser.id,
        refreshTokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        revokedAt: null,
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSession]),
        }),
      });

      mockBcrypt.compare.mockResolvedValue(true);

      const result = await findValidSession(mockUser.id, 'refresh-token');

      expect(result).toEqual({ id: mockSession.id });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('refresh-token', mockSession.refreshTokenHash);
    });

    it('should return null for expired session', async () => {
      const expiredSession = {
        id: 1,
        userId: mockUser.id,
        refreshTokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        revokedAt: null,
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([expiredSession]),
        }),
      });

      const result = await findValidSession(mockUser.id, 'refresh-token');

      expect(result).toBeNull();
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null for invalid refresh token', async () => {
      const mockSession = {
        id: 1,
        userId: mockUser.id,
        refreshTokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + 3600000),
        revokedAt: null,
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSession]),
        }),
      });

      mockBcrypt.compare.mockResolvedValue(false);

      const result = await findValidSession(mockUser.id, 'invalid-token');

      expect(result).toBeNull();
      expect(mockBcrypt.compare).toHaveBeenCalledWith('invalid-token', mockSession.refreshTokenHash);
    });

    it('should return null when no sessions found', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await findValidSession(mockUser.id, 'refresh-token');

      expect(result).toBeNull();
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const refreshData = {
        id: 1,
        ip: '127.0.0.1',
        userAgent: 'Updated User Agent',
        refreshToken: 'new-refresh-token',
        refreshTokenExpiresIn: 3600,
      };

      mockBcrypt.hash.mockResolvedValue('new-hashed-refresh-token');

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      await refreshSession(refreshData);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('new-refresh-token', 10);
      expect(mockDb.update).toHaveBeenCalledWith(sessionsTable);
    });
  });

  describe('revokeSession', () => {
    it('should revoke session successfully', async () => {
      const mockSession = {
        id: 1,
        userId: mockUser.id,
        refreshTokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + 3600000),
        revokedAt: null,
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSession]),
        }),
      });

      mockBcrypt.compare.mockResolvedValue(true);

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await revokeSession(mockUser.id, 'refresh-token');

      expect(result).toBe(true);
      expect(mockDb.update).toHaveBeenCalledWith(sessionsTable);
    });

    it('should return false when session not found', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await revokeSession(mockUser.id, 'refresh-token');

      expect(result).toBe(false);
    });
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      const newUser = createMockUser({
        email: userData.email,
        passwordHash: 'hashed-password',
      });

      mockBcrypt.hash.mockResolvedValue('hashed-password');

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newUser]),
        }),
      });

      const result = await AuthService.registerUser(userData);

      expect(result).toEqual(newUser);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockDb.insert).toHaveBeenCalledWith(usersTable);
    });

    it('should handle registration failure', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      mockBcrypt.hash.mockResolvedValue('hashed-password');

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await AuthService.registerUser(userData);

      expect(result).toBeUndefined();
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const result = await AuthService.findUserByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await AuthService.findUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});