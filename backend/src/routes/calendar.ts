import express, { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { createCalendarClient } from "../utils/googleAuth";
import { AuthRequest } from "../types/auth";
import { Logger, authLogger } from "../middleware/logger";

const router: Router = express.Router();


router.use(authenticateToken);
router.use(authLogger);

router.get('/calendars', async (req: AuthRequest, res) => {
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
        Logger.error('Error fetching calendars', { 
            userId: req.user!.id,
            error 
        });
        res.status(500).json({ error: 'Failed to fetch calendars' });
     }
})






router.get('/events', async (req: AuthRequest, res) => {
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
    Logger.error('Events fetch error', { 
      userId: req.user!.id,
      calendarId,
      error 
    });
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create a new calendar event
router.post('/events', async (req: AuthRequest, res) => {
  const { calendarId = 'primary', ...eventData } = req.body;
  
  Logger.info('Creating calendar event', { 
    userId: req.user!.id,
    calendarId 
  });
  
  try {
    const calendar = await createCalendarClient(req.user!);
    
    Logger.apiCall('Google Calendar', 'events.insert', { calendarId, eventData });
    
    const event = await calendar.events.insert({
      calendarId: calendarId as string,
      requestBody: eventData
    });
    
    Logger.info('Calendar event created successfully', {
      userId: req.user!.id,
      calendarId,
      eventId: event.data.id
    });
    
    res.status(201).json(event.data);
  } catch (error) {
    Logger.error('Event creation error', { 
      userId: req.user!.id,
      calendarId,
      error 
    });
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update an existing calendar event
router.put('/events/:eventId', async (req: AuthRequest, res) => {
  const { eventId } = req.params;
  const { calendarId = 'primary', ...eventData } = req.body;
  
  Logger.info('Updating calendar event', { 
    userId: req.user!.id,
    calendarId,
    eventId 
  });
  
  try {
    const calendar = await createCalendarClient(req.user!);
    
    Logger.apiCall('Google Calendar', 'events.update', { calendarId, eventId, eventData });
    
    const event = await calendar.events.update({
      calendarId: calendarId as string,
      eventId: eventId,
      requestBody: eventData
    } as any);
    
    Logger.info('Calendar event updated successfully', {
      userId: req.user!.id,
      calendarId,
      eventId
    });
    
    res.json(event.data);
  } catch (error) {
    Logger.error('Event update error', { 
      userId: req.user!.id,
      calendarId,
      eventId,
      error 
    });
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete a calendar event
router.delete('/events/:eventId', async (req: AuthRequest, res) => {
  const { eventId } = req.params;
  const { calendarId = 'primary' } = req.query;
  
  Logger.info('Deleting calendar event', { 
    userId: req.user!.id,
    calendarId,
    eventId 
  });
  
  try {
    const calendar = await createCalendarClient(req.user!);
    
    Logger.apiCall('Google Calendar', 'events.delete', { calendarId, eventId });
    
    await calendar.events.delete({
      calendarId: calendarId as string,
      eventId: eventId
    } as any);
    
    Logger.info('Calendar event deleted successfully', {
      userId: req.user!.id,
      calendarId,
      eventId
    });
    
    res.status(204).send();
  } catch (error) {
    Logger.error('Event deletion error', { 
      userId: req.user!.id,
      calendarId,
      eventId,
      error 
    });
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;