import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
}

const getJwtSecret = (): string => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

const getJwtRefreshSecret = (): string => {
  const secret = process.env['JWT_REFRESH_SECRET'];
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  }
  return secret;
};

export const generateAccessToken = (
  payload: TokenPayload
): { accessToken: string; expiresIn: number } => {
  return {
    accessToken: jwt.sign(payload, getJwtSecret(), {
      expiresIn: '15m',
    }),
    expiresIn: 900, // 15 minutes in seconds
  };
};

export const generateRefreshToken = (
  payload: TokenPayload
): { refreshToken: string; refreshTokenExpiresIn: number } => {
  return {
    refreshToken: jwt.sign(payload, getJwtRefreshSecret(), {
      expiresIn: '7d',
    }),
    refreshTokenExpiresIn: 604800, // 7 days in seconds
  };
};

export const generateTokens = (user: {
  id: string;
  email: string;
}): TokenPair => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };

  return {
    ...generateAccessToken(payload),
    ...generateRefreshToken(payload),
  };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, getJwtRefreshSecret()) as TokenPayload;
  } catch {
    throw new Error('Invalid refresh token');
  }
};

const TokenService = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
};

export default TokenService;
