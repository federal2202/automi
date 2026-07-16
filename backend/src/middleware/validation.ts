import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const calendarEventsSchema = z.object({
  query: z.object({
    calendarId: z.string().optional(),
    timeMin: z.string().optional(),
    timeMax: z.string().optional()
  })
});

// A Google Calendar event dateTime/date field: must specify at least one of
// `dateTime` (timed event) or `date` (all-day event). `.passthrough()` so we
// don't have to keep this in lockstep with every Google field we don't
// otherwise care about.
const googleDateTime = z
  .object({
    dateTime: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
    timeZone: z.string().min(1).optional(),
  })
  .passthrough()
  .refine((v) => Boolean(v.dateTime || v.date), {
    message: 'must include either dateTime or date',
  });

/**
 * Validates the fields this API actually reads/relies on before forwarding
 * the rest straight to Google (createEvent/updateEvent used to send the raw
 * client body with zero schema). `.passthrough()` on the outer object lets
 * any other legitimate Google event field (location, attendees, recurrence,
 * reminders, ...) through unexamined — we're not trying to reimplement
 * Google's event schema, just catch obviously malformed input before it
 * burns an API call.
 */
export const createEventBodySchema = z.object({
  body: z
    .object({
      calendarId: z.string().optional(),
      isTask: z.boolean().optional(),
      summary: z.string().trim().min(1, 'summary is required').max(1024),
      description: z.string().max(8192).optional(),
      start: googleDateTime,
      end: googleDateTime,
      colorId: z.string().optional(),
      status: z.string().optional(),
    })
    .passthrough(),
});

// Same fields, all optional — PUT /calendar/events/:eventId sends a partial
// patch (e.g. just a title rename), not a full event.
export const updateEventBodySchema = z.object({
  body: z
    .object({
      calendarId: z.string().optional(),
      summary: z.string().trim().min(1, 'summary must not be empty').max(1024).optional(),
      description: z.string().max(8192).optional(),
      start: googleDateTime.optional(),
      end: googleDateTime.optional(),
      colorId: z.string().optional(),
      status: z.string().optional(),
    })
    .passthrough(),
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