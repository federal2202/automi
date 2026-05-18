import express, { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { authLogger } from "../middleware/logger";
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
router.get('/events', getEvents);
router.post('/events', createEvent);
router.put('/events/:eventId', updateEvent);
router.delete('/events/:eventId', deleteEvent);

export default router;

