import moment from 'moment'
import { CalendarEvent } from '@/types/calendar/calendar.types'
import { ScheduleEntryInput, parseHHMM } from './generate-range'

/**
 * Event generation utilities
 */
export const eventGenerationUtils = {
  /**
   * Generate one event per schedule entry. Each entry carries its own
   * `dayOfWeek` plus `HH:mm` start/end, mirroring the persisted
   * `RecurringActivity.schedule` shape so callers don't have to fan out.
   */
  createEvent: (
    title: string,
    schedule: ScheduleEntryInput[],
    type: CalendarEvent['type'] = 'primary',
    description?: string
  ): CalendarEvent[] => {
    const currentWeekStart = moment().startOf('week')
    return schedule.map((entry, index) => {
      const start = parseHHMM(entry.startTime)
      const end = parseHHMM(entry.endTime)
      const startTime = moment(currentWeekStart)
        .day(entry.dayOfWeek)
        .hour(start.hour)
        .minute(start.minute)
      const endTime = moment(currentWeekStart)
        .day(entry.dayOfWeek)
        .hour(end.hour)
        .minute(end.minute)
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
   * Generate recurring events across multiple per-day schedule entries.
   * Delegates to `createEvent`.
   */
  createRecurringEvent: (
    title: string,
    schedule: ScheduleEntryInput[],
    type: CalendarEvent['type'] = 'primary',
    description?: string
  ): CalendarEvent[] => {
    return eventGenerationUtils.createEvent(title, schedule, type, description)
  }
}
