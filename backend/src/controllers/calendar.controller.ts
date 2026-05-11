import type { Response } from "express";
import { AuthRequest } from "../types/auth";
import { createCalendarClient } from "../utils/googleAuth";
import { generateTaskFromTitle } from "../services/gemini.service";
import { prisma } from "../lib/prisma";
import { Logger } from "../middleware/logger";
import { Prisma } from "../../generated/prisma/client";

const isInsufficientScopesError = (error: unknown): boolean => {
  const err = error as Record<string, unknown> | null;
  if (!err) return false;
  if (err.code === 403 && /insufficient/i.test(String(err.message ?? ''))) return true;
  const cause = err.cause as Record<string, unknown> | undefined;
  if (cause?.status === 'PERMISSION_DENIED') return true;
  return false;
};

export const getCalendars = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    Logger.info('Fetching user calendars', { userId: req.user!.id });

    const calendar = await createCalendarClient(req.user!);
    Logger.apiCall('Google Calendar', 'calendarList.list');

    const calendars = await calendar.calendarList.list();

    Logger.info('Calendars fetched successfully', {
      userId: req.user!.id,
      calendarCount: calendars.data.items?.length || 0
    });

    res.json(calendars.data);
  } catch (error) {
    Logger.error('Error fetching calendars', { userId: req.user!.id, error });
    if (isInsufficientScopesError(error)) {
      res.status(401).json({ error: 'reauth_required', reason: 'insufficient_scopes' });
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
    const calendar = await createCalendarClient(req.user!);

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
    if (isInsufficientScopesError(error)) {
      res.status(401).json({ error: 'reauth_required', reason: 'insufficient_scopes' });
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
    const calendar = await createCalendarClient(req.user!);

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

    let task = null;
    let taskError: string | null = null;

    try {
      const generated = await generateTaskFromTitle(eventTitle || "Untitled Event");

      task = await prisma.task.create({
        data: {
          eventId: event.data.id!,
          userId: req.user!.id,
          title: generated.title,
          description: generated.description,
          estimatedTimeMinutes: generated.estimatedTimeMinutes,
          difficulty: generated.difficulty,
          steps: generated.steps as unknown as Prisma.InputJsonValue,
          resources: (generated.resources ?? []) as unknown as Prisma.InputJsonValue,
          successCriteria: generated.successCriteria,
        },
      });

      Logger.info("Task created from calendar event", {
        userId: req.user!.id,
        eventId: event.data.id,
        taskId: task.id,
      });
    } catch (error) {
      Logger.error("Task generation or save failed — falling back", { error });

      try {
        task = await prisma.task.create({
          data: {
            eventId: event.data.id!,
            userId: req.user!.id,
            title: eventTitle || "Untitled Event",
            description: "Task instructions could not be generated.",
            estimatedTimeMinutes: 0,
            difficulty: "medium",
            steps: [] as unknown as Prisma.InputJsonValue,
            resources: [] as unknown as Prisma.InputJsonValue,
            successCriteria: "",
          },
        });
      } catch (saveError) {
        Logger.error("Fallback task save also failed", { saveError });
        taskError = "Task could not be created";
      }
    }

    res.status(201).json({ ...event.data, task, taskError });
  } catch (error) {
    Logger.error("Event creation error", { userId: req.user!.id, calendarId, error });
    if (isInsufficientScopesError(error)) {
      res.status(401).json({ error: 'reauth_required', reason: 'insufficient_scopes' });
      return;
    }
    res.status(500).json({ error: "Failed to create event" });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { eventId } = req.params;
  const { calendarId = 'primary', ...eventData } = req.body;

  Logger.info('Updating calendar event', { userId: req.user!.id, calendarId, eventId });

  try {
    const calendar = await createCalendarClient(req.user!);

    Logger.apiCall('Google Calendar', 'events.update', { calendarId, eventId, eventData });

    const event = await calendar.events.update({
      calendarId: calendarId as string,
      eventId: eventId,
      requestBody: eventData
    } as any);

    Logger.info('Calendar event updated successfully', { userId: req.user!.id, calendarId, eventId });

    res.json(event.data);
  } catch (error) {
    Logger.error('Event update error', { userId: req.user!.id, calendarId, eventId, error });
    if (isInsufficientScopesError(error)) {
      res.status(401).json({ error: 'reauth_required', reason: 'insufficient_scopes' });
      return;
    }
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { eventId } = req.params;
  const { calendarId = 'primary' } = req.query;

  Logger.info('Deleting calendar event', { userId: req.user!.id, calendarId, eventId });

  try {
    const calendar = await createCalendarClient(req.user!);

    Logger.apiCall('Google Calendar', 'events.delete', { calendarId, eventId });

    await calendar.events.delete({
      calendarId: calendarId as string,
      eventId: eventId
    } as any);

    Logger.info('Calendar event deleted successfully', { userId: req.user!.id, calendarId, eventId });

    res.status(204).send();
  } catch (error) {
    Logger.error('Event deletion error', { userId: req.user!.id, calendarId, eventId, error });
    if (isInsufficientScopesError(error)) {
      res.status(401).json({ error: 'reauth_required', reason: 'insufficient_scopes' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete event' });
  }
};
