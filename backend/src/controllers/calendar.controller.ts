import type { Response } from "express";
import { AuthRequest } from "../types/auth";
import { buildCalendarClient } from "../lib/google-calendar";
import { publishTaskCreated } from "../services/kafka.service";
import { prisma } from "../lib/prisma";
import { Logger } from "../middleware/logger";
import { Prisma } from "../../generated/prisma/client";
import { requireParam } from "../utils/request-validation";

/**
 * True when Google is telling us the stored credentials can't be used and the
 * user needs to go through OAuth again — as opposed to a transient failure.
 * Two distinct causes collapse into the same reauth_required response:
 *  - insufficient scopes granted at consent time (user under-authorized)
 *  - a revoked/expired refresh token (user revoked app access in their
 *    Google account, changed password, etc.) — this previously fell through
 *    to a generic 500 "Failed to fetch calendars" because only the scopes
 *    case was checked. A calendar app WILL see this in practice.
 */
const reauthReason = (error: unknown): "insufficient_scopes" | "invalid_grant" | null => {
  const err = error as Record<string, unknown> | null;
  if (!err) return null;

  if (err.code === 403 && /insufficient/i.test(String(err.message ?? ''))) {
    return "insufficient_scopes";
  }
  const cause = err.cause as Record<string, unknown> | undefined;
  if (cause?.status === 'PERMISSION_DENIED') return "insufficient_scopes";

  // googleapis surfaces a failed token refresh as a GaxiosError with the
  // OAuth error code nested in response.data.
  const response = err.response as Record<string, unknown> | undefined;
  const data = response?.data as Record<string, unknown> | undefined;
  if (data?.error === 'invalid_grant' || data?.error === 'invalid_token') {
    return "invalid_grant";
  }

  return null;
};

export const getCalendars = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    Logger.info('Fetching user calendars', { userId: req.user!.id });

    const calendar = buildCalendarClient(req.user!);
    Logger.apiCall('Google Calendar', 'calendarList.list');

    const calendars = await calendar.calendarList.list();

    Logger.info('Calendars fetched successfully', {
      userId: req.user!.id,
      calendarCount: calendars.data.items?.length || 0
    });

    res.json(calendars.data);
  } catch (error) {
    Logger.error('Error fetching calendars', { userId: req.user!.id, error });
    const reason = reauthReason(error);
    if (reason) {
      res.status(401).json({ error: 'reauth_required', reason });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch calendars' });
  }
};

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  const { calendarId = 'primary', timeMin, timeMax } = req.query;

  Logger.info('Fetching calendar events', {
    userId: req.user!.id,
    calendarId,
    timeMin: timeMin as string,
    timeMax: timeMax as string
  });

  try {
    const calendar = buildCalendarClient(req.user!);

    const eventParams = {
      calendarId: calendarId as string,
      timeMin: timeMin as string,
      timeMax: timeMax as string,
      singleEvents: true,
      orderBy: 'startTime'
    };

    Logger.apiCall('Google Calendar', 'events.list', eventParams);

    const events = await calendar.events.list(eventParams);

    Logger.info('Calendar events fetched successfully', {
      userId: req.user!.id,
      calendarId,
      eventCount: events.data.items?.length || 0
    });

    res.json(events.data);
  } catch (error) {
    Logger.error('Events fetch error', { userId: req.user!.id, calendarId, error });
    const reason = reauthReason(error);
    if (reason) {
      res.status(401).json({ error: 'reauth_required', reason });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { calendarId = "primary", isTask, ...eventData } = req.body;

  Logger.info("Creating calendar event", {
    userId: req.user!.id,
    calendarId,
    isTask: Boolean(isTask),
  });

  try {
    const calendar = buildCalendarClient(req.user!);

    Logger.apiCall("Google Calendar", "events.insert", { calendarId, eventData });

    const event = await calendar.events.insert({
      calendarId: calendarId as string,
      requestBody: eventData,
    });

    Logger.info("Calendar event created successfully", {
      userId: req.user!.id,
      calendarId,
      eventId: event.data.id,
    });

    if (!isTask) {
      res.status(201).json(event.data);
      return;
    }

    const eventTitle = (event.data as Record<string, unknown>).summary as string | undefined;

    let task;
    try {
      task = await prisma.task.create({
        data: {
          eventId: event.data.id!,
          userId: req.user!.id,
          title: eventTitle || "Untitled Event",
          description: "",
          estimatedTimeMinutes: 0,
          difficulty: "medium",
          steps: [] as unknown as Prisma.InputJsonValue,
          resources: [] as unknown as Prisma.InputJsonValue,
          successCriteria: "",
          aiStatus: "pending",
        },
      });
    } catch (error) {
      Logger.error("Task creation failed", { error });
      res.status(201).json({ ...event.data, task: null, taskError: "Task could not be created" });
      return;
    }

    let taskError: string | null = null;
    try {
      await publishTaskCreated({
        taskId: task.id,
        eventId: event.data.id!,
        userId: req.user!.id,
        title: eventTitle || "Untitled Event",
      });

      Logger.info("Task created and published to Kafka", {
        userId: req.user!.id,
        eventId: event.data.id,
        taskId: task.id,
      });
    } catch (error) {
      // The task row exists but no worker will ever pick it up, so mark it
      // 'failed' — otherwise the UI spins forever on a task that never enriches
      // (BUG-9).
      Logger.error("Kafka publish failed; marking task failed", { error });
      taskError = "Task could not be queued for AI processing";
      try {
        task = await prisma.task.update({
          where: { id: task.id },
          data: { aiStatus: "failed" },
        });
      } catch (updateError) {
        Logger.error("Failed to mark task as failed", { updateError });
      }
    }

    res.status(201).json({ ...event.data, task, taskError });
  } catch (error) {
    Logger.error("Event creation error", { userId: req.user!.id, calendarId, error });
    const reason = reauthReason(error);
    if (reason) {
      res.status(401).json({ error: 'reauth_required', reason });
      return;
    }
    res.status(500).json({ error: "Failed to create event" });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const eventId = requireParam(req.params.eventId, "eventId");
  const { calendarId = 'primary', ...eventData } = req.body;

  Logger.info('Updating calendar event', { userId: req.user!.id, calendarId, eventId });

  try {
    const calendar = buildCalendarClient(req.user!);

    Logger.apiCall('Google Calendar', 'events.update', { calendarId, eventId, eventData });

    const event = await calendar.events.update({
      calendarId: calendarId as string,
      eventId,
      requestBody: eventData,
    });

    Logger.info('Calendar event updated successfully', { userId: req.user!.id, calendarId, eventId });

    res.json(event.data);
  } catch (error) {
    Logger.error('Event update error', { userId: req.user!.id, calendarId, eventId, error });
    const reason = reauthReason(error);
    if (reason) {
      res.status(401).json({ error: 'reauth_required', reason });
      return;
    }
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const eventId = requireParam(req.params.eventId, "eventId");
  const { calendarId = 'primary' } = req.query;

  Logger.info('Deleting calendar event', { userId: req.user!.id, calendarId, eventId });

  try {
    const calendar = buildCalendarClient(req.user!);

    Logger.apiCall('Google Calendar', 'events.delete', { calendarId, eventId });

    await calendar.events.delete({
      calendarId: calendarId as string,
      eventId,
    });

    Logger.info('Calendar event deleted successfully', { userId: req.user!.id, calendarId, eventId });

    res.status(204).send();
  } catch (error) {
    Logger.error('Event deletion error', { userId: req.user!.id, calendarId, eventId, error });
    const reason = reauthReason(error);
    if (reason) {
      res.status(401).json({ error: 'reauth_required', reason });
      return;
    }
    res.status(500).json({ error: 'Failed to delete event' });
  }
};
