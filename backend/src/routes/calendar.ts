import express, { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { authLogger } from "../middleware/logger";
import { validateSchema, calendarEventsSchema, createEventBodySchema, updateEventBodySchema } from "../middleware/validation";
import {
  getCalendars,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/calendar.controller";

const router: Router = express.Router();

router.use(authenticateToken);
router.use(authLogger);

router.get('/calendars', getCalendars);
router.get('/events', validateSchema(calendarEventsSchema), getEvents);
router.post('/events', validateSchema(createEventBodySchema), createEvent);
router.put('/events/:eventId', validateSchema(updateEventBodySchema), updateEvent);
router.delete('/events/:eventId', deleteEvent);

export default router;

