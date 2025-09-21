import { type Request, type Response, type NextFunction } from 'express';
import { verifyAccessToken, type TokenPayload } from '@/services/tokenService';
import { JsonApiError } from '@/errors';

interface AuthenticatedUser {
  userId: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validatedQuery?: any;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const errorResponse = new JsonApiError({
      status: '401',
      code: 'unauthorized',
      title: 'Unauthorized',
      detail: 'Authorization header is required',
    });
    res.status(401).json(errorResponse.toJSON());
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!authHeader.startsWith('Bearer ') || !token) {
    const errorResponse = new JsonApiError({
      status: '401',
      code: 'unauthorized',
      title: 'Unauthorized',
      detail: 'Authorization header must be in format: Bearer <token>',
    });

    res.status(401).json(errorResponse.toJSON());
    return;
  }

  try {
    const payload: TokenPayload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };
    next();
  } catch {
    const errorResponse = new JsonApiError({
      status: '401',
      code: 'invalid_token',
      title: 'Unauthorized',
      detail: 'Invalid or expired access token',
    });
    res.status(401).json(errorResponse.toJSON());
  }
};
