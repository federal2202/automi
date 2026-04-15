import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
});

export const calendarEventsSchema = z.object({
  query: z.object({
    calendarId: z.string().optional(),
    timeMin: z.string().optional(),
    timeMax: z.string().optional()
  })
});

export function validateSchema(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}