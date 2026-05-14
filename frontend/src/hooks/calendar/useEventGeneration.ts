import moment from 'moment'
import { useMemo } from 'react'
import { CalendarEvent } from '@/types/calendar/calendar.types'

/**
 * Sample Event Generation Hook
 * Extracted from the original calendar component
 * Generates events for the current week (timezone-aware)
 */
export const useEventGeneration = () => {
  const sampleEvents = useMemo((): CalendarEvent[] => {
    const now = moment() // Uses local timezone automatically
    const currentWeekStart = now.clone().startOf('week')
    
    return [
      {
        id: '1',
        title: 'Core Infrastructure Review',
        start: moment(currentWeekStart).day(1).hour(9).minute(0).toDate(), // Monday 9:00
        end: moment(currentWeekStart).day(1).hour(11).minute(30).toDate(), // Monday 11:30
        type: 'primary',
        description: 'Evaluate node latency across main clusters.'
      },
      {
        id: '2',
        title: 'Stakeholder Sync',
        start: moment(currentWeekStart).day(1).hour(14).minute(0).toDate(), // Monday 14:00
        end: moment(currentWeekStart).day(1).hour(15).minute(30).toDate(), // Monday 15:30
        type: 'secondary',
        description: 'Visual presentation of v2.0 roadmap.'
      },
      {
        id: '3',
        title: 'Design Sprint',
        start: moment(currentWeekStart).day(2).hour(10).minute(0).toDate(), // Tuesday 10:00
        end: moment(currentWeekStart).day(2).hour(12).minute(0).toDate(), // Tuesday 12:00
        type: 'secondary',
        description: 'Prototyping advanced grid layouts.'
      },
      {
        id: '4',
        title: 'Documentation',
        start: moment(currentWeekStart).day(2).hour(16).minute(0).toDate(), // Tuesday 16:00
        end: moment(currentWeekStart).day(2).hour(17).minute(0).toDate(), // Tuesday 17:00
        type: 'inactive'
      },
      {
        id: '5',
        title: 'CRITICAL DEPLOYMENT',
        start: moment(currentWeekStart).day(3).hour(9).minute(0).toDate(), // Wednesday 9:00
        end: moment(currentWeekStart).day(3).hour(13).minute(0).toDate(), // Wednesday 13:00
        type: 'critical',
        description: 'Monitoring active telemetry.'
      },
      {
        id: '6',
        title: 'Security Audit',
        start: moment(currentWeekStart).day(3).hour(15).minute(30).toDate(), // Wednesday 15:30
        end: moment(currentWeekStart).day(3).hour(17).minute(0).toDate(), // Wednesday 17:00
        type: 'primary'
      },
      {
        id: '7',
        title: 'Mentorship Hour',
        start: moment(currentWeekStart).day(4).hour(8).minute(0).toDate(), // Thursday 8:00
        end: moment(currentWeekStart).day(4).hour(10).minute(0).toDate(), // Thursday 10:00
        type: 'primary'
      },
      {
        id: '8',
        title: 'Product Workshop',
        start: moment(currentWeekStart).day(4).hour(11).minute(0).toDate(), // Thursday 11:00
        end: moment(currentWeekStart).day(4).hour(14).minute(0).toDate(), // Thursday 14:00
        type: 'secondary',
        description: 'Deep dive into user behavioral data.'
      },
      {
        id: '9',
        title: 'UI QA',
        start: moment(currentWeekStart).day(4).hour(15).minute(0).toDate(), // Thursday 15:00
        end: moment(currentWeekStart).day(4).hour(16).minute(30).toDate(), // Thursday 16:30
        type: 'secondary'
      },
      {
        id: '10',
        title: 'Weekly Wrap-up',
        start: moment(currentWeekStart).day(5).hour(9).minute(0).toDate(), // Friday 9:00
        end: moment(currentWeekStart).day(5).hour(11).minute(0).toDate(), // Friday 11:00
        type: 'primary'
      },
      {
        id: '11',
        title: 'System Maintenance',
        start: moment(currentWeekStart).day(5).hour(14).minute(0).toDate(), // Friday 14:00
        end: moment(currentWeekStart).day(5).hour(17).minute(0).toDate(), // Friday 17:00
        type: 'inactive'
      },
      {
        id: '12',
        title: 'Weekend Learning',
        start: moment(currentWeekStart).day(6).hour(10).minute(0).toDate(), // Saturday 10:00
        end: moment(currentWeekStart).day(6).hour(12).minute(0).toDate(), // Saturday 12:00
        type: 'secondary',
        description: 'Personal development and skill enhancement.'
      },
      {
        id: '13',
        title: 'Family Time',
        start: moment(currentWeekStart).day(0).hour(14).minute(0).toDate(), // Sunday 14:00
        end: moment(currentWeekStart).day(0).hour(16).minute(0).toDate(), // Sunday 16:00
        type: 'primary',
        description: 'Quality time with family and friends.'
      },
      {
        id: '14',
        title: 'Project Planning',
        start: moment(currentWeekStart).day(0).hour(19).minute(0).toDate(), // Sunday 19:00
        end: moment(currentWeekStart).day(0).hour(20).minute(30).toDate(), // Sunday 20:30
        type: 'secondary',
        description: 'Plan upcoming week and set priorities.'
      }
    ]
  }, [])

  return sampleEvents
}

/**
 * Generate events for a specific date range
 * Future utility for dynamic event generation
 */
export const generateEventsForRange = (startDate: Date, endDate: Date): CalendarEvent[] => {
  // This function can be expanded to generate events for specific date ranges
  // Currently returns the sample events, but could be modified to generate
  // events relative to the provided date range
  
  const momentStart = moment(startDate)
  const currentWeekStart = momentStart.startOf('week')
  
  // For now, return events relative to the provided start date
  return [
    {
      id: `${startDate.getTime()}-1`,
      title: 'Generated Event',
      start: moment(currentWeekStart).day(1).hour(10).minute(0).toDate(),
      end: moment(currentWeekStart).day(1).hour(11).minute(0).toDate(),
      type: 'primary',
      description: 'Auto-generated event for demonstration'
    }
  ]
}

/**
 * Event generation utilities
 */
export const eventGenerationUtils = {
  /**
   * Generate one event per day in the provided weekday list. Mirrors the
   * persisted `daysOfWeek: number[]` shape so callers don't have to fan out
   * a single-day helper themselves.
   */
  createEvent: (
    title: string,
    daysOfWeek: number[],
    hour: number,
    minute: number,
    duration: number,
    type: CalendarEvent['type'] = 'primary',
    description?: string
  ): CalendarEvent[] => {
    const currentWeekStart = moment().startOf('week')
    return daysOfWeek.map((day, index) => {
      const startTime = moment(currentWeekStart).day(day).hour(hour).minute(minute)
      const endTime = startTime.clone().add(duration, 'hours')
      return {
        id: `${Date.now()}-${index}-${Math.random()}`,
        title,
        start: startTime.toDate(),
        end: endTime.toDate(),
        type,
        description,
      }
    })
  },

  /**
   * Generate recurring events across multiple weekdays. Delegates to
   * `createEvent`, which now itself fans out across the weekday list.
   */
  createRecurringEvent: (
    title: string,
    hour: number,
    minute: number,
    duration: number,
    daysOfWeek: number[],
    type: CalendarEvent['type'] = 'primary',
    description?: string
  ): CalendarEvent[] => {
    return eventGenerationUtils.createEvent(
      title,
      daysOfWeek,
      hour,
      minute,
      duration,
      type,
      description
    )
  }
}