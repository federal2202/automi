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

export default router;