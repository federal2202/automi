import { memo, CSSProperties } from 'react'
import { cn } from '@/utils/cn'
import { CalendarEventProps } from '@/types/calendar/calendar.types'
import { hexToRgba, safeEventColor } from '@/utils/calendar/styles/hex-to-rgba'

/**
 * CalendarEvent Component
 * Duration-proportional events with responsive compact styling.
 * Card coloring is driven by the per-event Google color (`event.color`),
 * falling back to the brand green. Fill is a muted tint of that color with a
 * solid colored left border; text stays light for contrast on the dark grid.
 */
export const CalendarEvent = memo(({ event }: CalendarEventProps) => {
  const accent = safeEventColor(event.color)

  // Hover tint is exposed via a CSS var consumed by `.rbc-event:hover` rules.
  const style = {
    backgroundColor: hexToRgba(accent, 0.12),
    borderLeft: `3px solid ${accent}`,
    '--event-fill-hover': hexToRgba(accent, 0.18),
  } as CSSProperties

  return (
    <div
      style={style}
      className={cn(
        // Base styles - full width/height to preserve duration scaling
        'calendar-event-card w-full h-full rounded-sm flex flex-col',
        // Ultra responsive padding: ultra-compact on mobile, larger on desktop
        'p-px sm:p-0.5 md:p-1 lg:p-2',
        // Ultra responsive gaps: no gap on mobile, minimal on larger screens
        'gap-0 sm:gap-px md:gap-0.5'
      )}
    >
      <div
        className={cn(
          'font-semibold truncate text-[#e5e2e1]',
          // Responsive font sizes: very small on mobile, larger on desktop
          'text-[10px] sm:text-xs md:text-xs',
          // Responsive line heights: very tight on mobile
          'leading-none sm:leading-tight md:leading-tight'
        )}
      >
        {event.title}
      </div>
      {event.description && (
        <div
          className={cn(
            'font-normal truncate text-[rgba(229,226,225,0.65)]',
            // Even smaller description text, progressively larger
            'text-[8px] sm:text-[10px] md:text-xs',
            // Very tight line height for descriptions
            'leading-none'
          )}
        >
          {event.description}
        </div>
      )}
    </div>
  )
})

CalendarEvent.displayName = 'CalendarEvent'
