import { NextFunction, type Request, type Response, Router } from 'express';
import { z } from 'zod';
import { validateBody } from '@/middleware/validation';
import AuthService from '@/services/authService';
import TokenService from '@/services/tokenService';
import { extractClientInfo } from '@/utils/clientInfo';
import { JsonApiError } from '@/errors';

const router = Router();

const loginSchema = z.object({
  email: z.email({ message: 'Invalid email format' }).trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

router.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = await AuthService.findUserByEmail(email);
      if (existingUser) {
        throw new JsonApiError({
          status: '400',
          title: 'User already exists',
          code: 'user_already_exists',
        });
      }

      // Create new user
      const newUser = await AuthService.registerUser({ email, password });

      if (!newUser) {
        throw new Error('User registration failed');
      }

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          email: newUser.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate credentials
      const { success, user } = await AuthService.validateCredentials(
        email,
        password
      );

      if (!success) {
        throw new JsonApiError({
          status: '401',
          title: 'Invalid credentials',
          code: 'invalid_credentials',
        });
      }

      // Generate tokens
      const { accessToken, expiresIn, refreshToken, refreshTokenExpiresIn } =
        TokenService.generateTokens(user);

      // Extract client information
      const { ip: clientIp, userAgent: clientUserAgent } =
        extractClientInfo(req);

      // Update last login timestamp and create session
      await AuthService.createSession({
        userId: user.id,
        ip: clientIp,
        userAgent: clientUserAgent,
        refreshToken,
        refreshTokenExpiresIn,
      });

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'lax',
        maxAge: refreshTokenExpiresIn * 1000,
      });

      // Return success response with access token
      res.json({
        access_token: accessToken,
        expires_in: expiresIn,
        token_type: 'Bearer',
        user: {
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      next(error);
    }
  }
);

router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract refresh token from cookies
      const refreshToken = req.cookies['refreshToken'];

      if (!refreshToken) {
        throw new JsonApiError({
          status: '401',
          title: 'Missing refresh token',
          code: 'missing_refresh_token',
        });
      }

      // Validate refresh token
      let decodedToken;
      try {
        decodedToken = TokenService.verifyRefreshToken(refreshToken);
      } catch {
        throw new JsonApiError({
          status: '401',
          title: 'Invalid refresh token',
          code: 'invalid_refresh_token',
        });
      }

      // Find and validate session
      const validSession = await AuthService.findValidSession(
        decodedToken.userId,
        refreshToken
      );

      if (!validSession) {
        throw new JsonApiError({
          status: '401',
          title: 'Invalid session',
          code: 'invalid_session',
        });
      }

      // Extract client information
      const { ip: clientIp, userAgent: clientUserAgent } =
        extractClientInfo(req);

      // Generate new tokens
      const {
        accessToken,
        expiresIn,
        refreshToken: newRefreshToken,
        refreshTokenExpiresIn,
      } = TokenService.generateTokens({
        id: decodedToken.userId,
        email: decodedToken.email,
      });

      // Refresh session
      await AuthService.refreshSession({
        id: validSession.id,
        ip: clientIp,
        userAgent: clientUserAgent,
        refreshToken: newRefreshToken,
        refreshTokenExpiresIn,
      });

      // Set new refresh token as httpOnly cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'lax',
        maxAge: refreshTokenExpiresIn * 1000,
      });

      // Return success response with new access token
      res.json({
        access_token: accessToken,
        expires_in: expiresIn,
        token_type: 'Bearer',
        user: {
          email: decodedToken.email,
        },
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      next(error);
    }
  }
);

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract refresh token from cookies
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      // Clear cookie anyway and return 204
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'lax',
      });
      res.status(204).send();
      return;
    }

    // Verify refresh token to get user ID
    let decodedToken;
    try {
      decodedToken = TokenService.verifyRefreshToken(refreshToken);
    } catch {
      // Clear cookie anyway and return 204
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'lax',
      });
      res.status(204).send();
      return;
    }

    // Revoke the session in database
    await AuthService.revokeSession(decodedToken.userId, refreshToken);

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
    });

    // Return 204 No Content
    res.status(204).send();
  } catch (error) {
    console.error('Logout error:', error);
    // Even on error, clear the cookie and return 204
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
    });
    res.status(204).send();
  }
});

export default router;
