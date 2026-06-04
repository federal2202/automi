import moment from 'moment'
import { CalendarEvent } from '@/types/calendar/calendar.types'

/**
 * Per-day schedule entry shape used by `eventGenerationUtils`. Mirrors the
 * persisted `RecurringActivity.schedule` shape so callers can hand the same
 * array straight through.
 */
export interface ScheduleEntryInput {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export function parseHHMM(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(':')
  return { hour: Number(h) || 0, minute: Number(m) || 0 }
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
