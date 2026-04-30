import type { Response } from "express";
import { AuthRequest } from "../types/auth";
import { createCalendarClient } from "../utils/googleAuth";
import { generateTaskFromTitle } from "../services/gemini.service";
import { prisma } from "../lib/prisma";
import { Logger } from "../middleware/logger";
import { Prisma } from "../../generated/prisma/client";

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
    Logger.error("Event creation error", {
      userId: req.user!.id,
      calendarId,
      error,
    });
    res.status(500).json({ error: "Failed to create event" });
  }
};
