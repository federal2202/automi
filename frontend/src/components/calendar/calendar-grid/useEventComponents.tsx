"use client"

import { useMemo } from 'react'
import { CalendarEvent } from '@/types/calendar/calendar.types'
import { CalendarEvent as CalendarEventComponent } from '../CalendarEvent'
import { CalendarDayHeader } from '../CalendarDayHeader'
import { MonthDateHeader, MonthEvent } from './CalendarGridRenderers'

/**
 * Build the `components.event` / `components.month.event` renderers.
 *
 * When the "just finished onboarding" stagger map is present, the existing
 * renderers are wrapped in a div running the `event-enter` keyframe with a
 * per-event delay. Identities are memoized so react-big-calendar doesn't tear
 * them down on every parent render. Without a staggerMap the original
 * renderers are handed back untouched — zero overhead on the steady state.
 */
export function useEventComponents(staggerMap: Map<string, number> | null | undefined) {
  return useMemo(() => {
    if (!staggerMap) {
      return { event: CalendarEventComponent, monthEvent: MonthEvent }
    }

    const delayFor = (id: string) => `${(staggerMap.get(id) ?? 0) * 60}ms`

    const StaggeredEvent = ({ event }: { event: CalendarEvent }) => (
      <div
        className="event-enter w-full h-full"
        style={{ animationDelay: delayFor(event.id) }}
      >
        <CalendarEventComponent event={event} />
      </div>
    )

    const StaggeredMonthEvent = ({ event }: { event: CalendarEvent }) => (
      <span
        className="event-enter block truncate text-[11px] font-medium leading-tight"
        style={{ animationDelay: delayFor(event.id) }}
      >
        {event.title}
      </span>
    )

    return { event: StaggeredEvent, monthEvent: StaggeredMonthEvent }
  }, [staggerMap])
}

/**
 * Build the full react-big-calendar `components` map (toolbar disabled,
 * day/week headers, month date header + event renderer).
 */
export function buildCalendarComponents(
  eventComponents: ReturnType<typeof useEventComponents>
) {
  return {
    event: eventComponents.event,
    toolbar: () => null, // We use a custom toolbar
    week: { header: CalendarDayHeader },
    work_week: { header: CalendarDayHeader },
    month: { dateHeader: MonthDateHeader, event: eventComponents.monthEvent },
    day: { header: CalendarDayHeader },
  }
}
