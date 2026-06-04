/**
 * Responsive breakpoints and per-breakpoint style values.
 */

/**
 * Responsive breakpoints — exact values from calendar.css
 */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
} as const

/**
 * Responsive styles — exact values from the current implementation.
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
