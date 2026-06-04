/**
 * Brand green fallback used when an event has no color or an invalid hex.
 * Matches the dashboard accent (--green-nice family).
 */
export const FALLBACK_EVENT_COLOR = '#059669'

const HEX_PATTERN = /^#?([\da-f]{3}|[\da-f]{6})$/i

/**
 * Expand a 3-digit hex (#abc) into its 6-digit form (#aabbcc).
 */
const expandHex = (hex: string): string =>
  hex.length === 3
    ? hex
        .split('')
        .map((ch) => ch + ch)
        .join('')
    : hex

/**
 * Convert a hex color string into an `rgba()` CSS value with the given alpha.
 * Pure + safe: any missing/invalid hex falls back to the brand green so the
 * caller never has to guard against bad data.
 *
 * @param hex   Hex color (e.g. '#33b679', '33b679', '#abc'); may be undefined.
 * @param alpha Opacity 0..1 (default 1).
 */
export const hexToRgba = (hex: string | undefined, alpha = 1): string => {
  const source = hex && HEX_PATTERN.test(hex) ? hex : FALLBACK_EVENT_COLOR
  const normalized = expandHex(source.replace('#', ''))

  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Return a safe solid hex for use as an accent (border/dot), falling back to
 * the brand green when the input is missing or invalid.
 */
export const safeEventColor = (hex: string | undefined): string =>
  hex && HEX_PATTERN.test(hex) ? hex : FALLBACK_EVENT_COLOR
