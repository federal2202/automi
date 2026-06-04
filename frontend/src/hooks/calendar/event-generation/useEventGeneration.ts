import { useMemo } from 'react'
import { CalendarEvent } from '@/types/calendar/calendar.types'
import { buildSampleEvents } from './sample-events'

/**
 * Sample Event Generation Hook
 * Extracted from the original calendar component
 * Generates events for the current week (timezone-aware)
 */
export const useEventGeneration = () => {
  const sampleEvents = useMemo((): CalendarEvent[] => buildSampleEvents(), [])

  return sampleEvents
}
