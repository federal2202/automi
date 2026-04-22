import { EventType } from '@/types/calendar/calendar.types'

/**
 * Calendar Style Constants
 * CRITICAL: These values must match the current implementation exactly
 * DO NOT MODIFY without visual verification
 */

/**
 * Color System - Exact values from current implementation
 */
export const CALENDAR_COLORS = {
  // Primary green variations
  primaryGreen: '#059669',
  primaryGreenDark: '#065f46',
  primaryGreenLight: '#10b981',
  primaryGreenBg: 'rgba(6,78,59,0.1)',
  
  // Secondary colors
  secondaryPurple: '#ddb7ff',
  secondaryPurpleBg: 'rgba(111,0,190,0.1)',
  
  // Critical colors
  criticalGreen: '#a7f3d0',
  criticalGreenBg: 'rgba(6,78,59,0.6)',
  criticalBorder: 'rgba(6,95,70,0.3)',
  
  // Inactive colors
  inactiveGray: '#6b7280',
  inactiveBg: '#1c1b1b',
  inactiveBorder: 'rgba(59,75,53,0.15)',
  
  // Background colors
  darkBackground: '#0e0e0e',
  lightText: '#e5e2e1',
  mutedText: '#6b7280',
  
  // Today highlighting
  todayBg: 'rgba(2,44,34,0.08)',
  todayBorder: 'rgba(6,78,59,0.2)',
  todayBorderStrong: 'rgba(6,78,59,0.4)',
  
  // Weekend colors
  weekendText: '#8b7355',
  weekendTextLight: '#c4b59a',
  
  // Grid lines
  gridBorder: 'rgba(59,75,53,0.15)',
  gridBorderLight: 'rgba(59,75,53,0.08)',
} as const

/**
 * Event Type Styling - Exact Tailwind classes from current implementation
 */
export const EVENT_STYLES: Record<EventType, {
  container: string
  title: string
  time: string
  description: string
}> = {
  primary: {
    container: 'bg-[rgba(6,78,59,0.1)] border-l-4 border-[#065f46] text-[#059669]',
    title: 'text-sm font-bold text-[#e5e2e1] font-[\'Plus_Jakarta_Sans\']',
    time: 'text-[10px] font-bold tracking-wide uppercase text-[#059669]',
    description: 'text-xs font-normal text-[#6b7280] font-[\'Plus_Jakarta_Sans\'] leading-relaxed'
  },
  secondary: {
    container: 'bg-[rgba(111,0,190,0.1)] border-l-4 border-[#ddb7ff] text-[#ddb7ff]',
    title: 'text-sm font-bold text-[#e5e2e1] font-[\'Plus_Jakarta_Sans\']',
    time: 'text-[10px] font-bold tracking-wide uppercase text-[#059669]',
    description: 'text-xs font-normal text-[#6b7280] font-[\'Plus_Jakarta_Sans\'] leading-relaxed'
  },
  critical: {
    container: 'bg-[rgba(6,78,59,0.6)] border border-[rgba(6,95,70,0.3)] text-[#a7f3d0]',
    title: 'text-sm font-bold text-[#e5e2e1] font-[\'Plus_Jakarta_Sans\'] uppercase text-[#ecfdf5] font-extrabold',
    time: 'text-[10px] font-bold tracking-wide uppercase text-[#059669]',
    description: 'text-xs font-normal text-[#6b7280] font-[\'Plus_Jakarta_Sans\'] leading-relaxed text-[#ecfdf5] font-medium italic opacity-80'
  },
  inactive: {
    container: 'bg-[#1c1b1b] border border-[rgba(59,75,53,0.15)] text-[#6b7280] opacity-60',
    title: 'text-sm font-bold text-[#e5e2e1] font-[\'Plus_Jakarta_Sans\'] text-[rgba(229,226,225,0.6)]',
    time: 'text-[10px] font-bold tracking-wide uppercase text-[#059669]',
    description: 'text-xs font-normal text-[#6b7280] font-[\'Plus_Jakarta_Sans\'] leading-relaxed'
  }
} as const

/**
 * Typography Hierarchy - Exact values from current implementation
 */
export const TYPOGRAPHY = {
  manifestTitle: 'text-2xl md:text-3xl lg:text-[48px] font-bold text-[#e5e2e1] tracking-[-2.4px] uppercase leading-tight font-[\'Space_Grotesk\']',
  subtitle: 'text-[10px] md:text-[11px] text-[#6b7280] tracking-[1.1px] uppercase font-[\'Plus_Jakarta_Sans\']',
  dateDisplay: 'text-[11px] text-[#10b981] font-[\'Plus_Jakarta_Sans\'] whitespace-nowrap',
  dayName: 'text-[10px] font-bold tracking-wide uppercase font-[\'Plus_Jakarta_Sans\'] mb-1',
  dayNumber: 'text-[20px] leading-5 font-[\'Space_Grotesk\'] font-bold',
  monthName: 'text-[9px] font-medium tracking-wider uppercase font-[\'Plus_Jakarta_Sans\']',
} as const

/**
 * Responsive Breakpoints - Exact values from calendar.css
 */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
} as const

/**
 * Responsive Styles - Exact values from current implementation
 */
export const RESPONSIVE_STYLES = {
  timeGutter: {
    desktop: '80px',
    tablet: '60px',
    mobile: '50px',
  },
  fontSize: {
    desktop: '14px',
    tablet: '12px',
    mobile: '11px',
  },
  eventPadding: {
    desktop: '4px',
    tablet: '8px',
    mobile: '6px',
  },
  eventMargin: {
    desktop: '4px',
    tablet: '2px',
    mobile: '1px',
  },
  monthCellHeight: {
    desktop: '100px',
    tablet: '60px',
    mobile: '50px',
  },
} as const

/**
 * Layout Styles - Common layout patterns
 */
export const LAYOUT_STYLES = {
  glassmorphism: {
    navigation: 'bg-[#0e0e0e] border border-[rgba(59,75,53,0.15)] rounded-full',
    eventCard: 'w-full h-full rounded-2xl p-4 flex flex-col gap-1',
    todayColumn: 'bg-[rgba(2,44,34,0.08)] border border-[rgba(6,78,59,0.2)] rounded-2xl',
  },
  buttons: {
    navigation: 'p-1 hover:bg-[rgba(59,75,53,0.2)] rounded-full transition-colors',
    viewSwitcher: 'px-3 py-1 text-[10px] font-bold tracking-wide uppercase transition-all duration-200 rounded-full',
    viewSwitcherActive: 'bg-[#059669] text-white',
    viewSwitcherInactive: 'text-[#6b7280] hover:text-white hover:bg-[rgba(59,75,53,0.2)]',
  },
  toolbar: {
    container: 'flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4',
    controls: 'flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4',
  },
} as const

/**
 * BigCalendar Integration Styles
 */
export const BIG_CALENDAR_STYLES = {
  calendar: 'automi-calendar text-xs sm:text-sm md:text-base',
  container: 'bg-[#0e0e0e] text-white h-full w-full flex flex-col p-4 md:p-6 lg:p-8',
  contentWrapper: 'w-full flex-1 flex flex-col min-h-0 min-w-0',
  style: {
    height: '100%',
    minHeight: '400px',
  },
  timeConfig: {
    min: new Date(0, 0, 0, 0, 0, 0),
    max: new Date(0, 0, 0, 23, 59, 59),
    step: 30,
    timeslots: 2,
  },
} as const

/**
 * Get event style classes for a specific event type
 */
export const getEventStyles = (type: EventType) => EVENT_STYLES[type]

/**
 * Get responsive class names based on screen size
 */
export const getResponsiveClasses = (baseClasses: string, mobileClasses?: string, tabletClasses?: string) => {
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