import { type Request, type Response, type NextFunction } from 'express';
import { type ZodSchema, type ZodError } from 'zod';

import { ValidationError, JsonApiError } from '@/errors';

const createValidationErrors = (
  issues: ZodError['issues'],
  contextType: 'body' | 'query'
): ValidationError[] => {
  return issues.map((issue) => {
    const field =
      issue.path.length > 0
        ? issue.path.join('/')
        : contextType === 'body'
          ? 'attributes'
          : 'query';

    return new ValidationError(field, issue.message);
  });
};

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validationResult = schema.safeParse(req.body);

      if (!validationResult.success) {
        const validationErrors = createValidationErrors(
          validationResult.error.issues,
          'body'
        );

        const errorResponse = {
          errors: validationErrors.map((error) => error.asJSON()),
        };

        res.status(422).json(errorResponse);
        return;
      }

      // Attach validated data to request for use in route handlers
      req.body = validationResult.data;
      next();
    } catch {
      const internalError = new JsonApiError({
        status: '500',
        title: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
      });
      res.status(500).json(internalError.toJSON());
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validationResult = schema.safeParse(req.query);

      if (!validationResult.success) {
        const validationErrors = createValidationErrors(
          validationResult.error.issues,
          'query'
        );

        const errorResponse = {
          errors: validationErrors.map((error) => error.asJSON()),
        };

        res.status(422).json(errorResponse);
        return;
      }

      req.validatedQuery = validationResult.data;
      next();
    } catch {
      const internalError = new JsonApiError({
        status: '500',
        title: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
      });
      res.status(500).json(internalError.toJSON());
    }
  };
};
