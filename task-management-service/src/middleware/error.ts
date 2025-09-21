import { JsonApiError } from '@/errors/index';
import { NextFunction, type Response, type Request } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle JSON:API errors
  if (err instanceof JsonApiError) {
    res.status(Number(err.status)).json(err.toJSON());
    return;
  }

  // Handle generic errors
  res.status(500).json({
    errors: [
      {
        status: '500',
        title: 'Internal Server Error',
        detail: 'An unexpected error occurred.',
      },
    ],
  });
};
