import express, { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { createCalendarClient } from "../utils/googleAuth";

const router: Router = express.Router();


router.use(authenticateToken);

router.get('/calendars', async (req, res) => {
     try {
        const calendar = await createCalendarClient(req.user!);
        const calendars = await calendar.calendarList.list();
        res.json(calendars.data);
     } catch (error) {
        console.error('Error fetching calendars:', error);
        res.status(500).json({ error: 'Failed to fetch calendars' });
     }
})






router.get('/events', async (req, res) => {
  const { calendarId = 'primary', timeMin, timeMax } = req.query;
  
  try {
    const calendar = await createCalendarClient(req.user!);
    const events = await calendar.events.list({
      calendarId: calendarId as string,
      timeMin: timeMin as string,
      timeMax: timeMax as string,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    res.json(events.data);
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

export default router;