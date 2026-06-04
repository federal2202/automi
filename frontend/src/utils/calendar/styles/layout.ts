/**
 * Layout patterns and BigCalendar integration styles.
 */

/**
 * Layout styles — common layout patterns.
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
 * BigCalendar integration styles.
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
