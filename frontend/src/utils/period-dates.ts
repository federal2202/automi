/**
 * Shared UTC-safe formatting helpers for period date boundaries.
 *
 * Boundaries are stored as `YYYY-MM-DDT00:00:00.000Z`, so we anchor display
 * and arithmetic to UTC. Avoids DST/zone drift between the form (which slices
 * `YYYY-MM-DD`) and the cards/detail page.
 *
 * Extracted from `PeriodCard` in Step 2 so the period detail page can reuse it.
 */

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

/**
 * Parse the `YYYY-MM-DD` prefix of an ISO string into a UTC-midnight Date.
 */
export function parseISODateUTC(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const ms = Date.UTC(year, month - 1, day)
  if (Number.isNaN(ms)) return null
  return new Date(ms)
}

export function formatPeriodRange(startISO: string, endISO: string): string {
  const start = parseISODateUTC(startISO)
  const end = parseISODateUTC(endISO)
  if (!start || !end) return 'Invalid range'
  return `${dateFormatter.format(start)} → ${dateFormatter.format(end)}`
}

/**
 * Inclusive day count between two ISO date-times. Returns `null` for invalid
 * inputs OR when `end < start`, so invalid ranges surface as missing data in
 * the UI instead of being silently clamped to 1.
 */
export function daysBetween(startISO: string, endISO: string): number | null {
  const start = parseISODateUTC(startISO)
  const end = parseISODateUTC(endISO)
  if (!start || !end) return null
  const ms = end.getTime() - start.getTime()
  if (ms < 0) return null
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1
}
