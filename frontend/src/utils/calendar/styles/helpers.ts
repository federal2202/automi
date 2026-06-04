import { EventType } from '@/types/calendar/calendar.types'
import { EVENT_STYLES } from './event-styles'

/**
 * Get event style classes for a specific event type
 */
export const getEventStyles = (type: EventType) => EVENT_STYLES[type]

/**
 * Get responsive class names based on screen size
 */
export const getResponsiveClasses = (
  baseClasses: string,
  mobileClasses?: string,
  tabletClasses?: string
) => {
  const classes = [baseClasses]
  if (tabletClasses) classes.push(`md:${tabletClasses}`)
  if (mobileClasses) classes.push(`sm:${mobileClasses}`)
  return classes.join(' ')
}

/**
 * Today highlighting utility
 */
export const getTodayStyles = (isToday: boolean) => ({
  dayHeader: isToday ? 'text-[#059669]' : 'text-white',
  dayNumber: isToday ? 'text-[#059669]' : 'text-white',
  monthName: isToday ? 'text-[#059669]' : 'text-white',
})

/**
 * Weekend styling utility
 */
export const getWeekendStyles = (isWeekend: boolean, isToday: boolean) => ({
  dayHeader: isToday ? 'text-[#059669]' : isWeekend ? 'text-[#8b7355]' : 'text-[#6b7280]',
  dayNumber: isToday ? 'text-[#059669]' : isWeekend ? 'text-[#c4b59a]' : 'text-[#e5e2e1]',
  monthName: isToday ? 'text-[#059669]' : isWeekend ? 'text-[#8b7355]' : 'text-[#6b7280]',
})
