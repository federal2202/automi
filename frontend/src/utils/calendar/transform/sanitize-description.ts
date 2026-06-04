/**
 * Pure, SSR-safe sanitization for Google Calendar event descriptions.
 *
 * Google often stores descriptions as HTML and appends auto-generated notes
 * (e.g. "This event was created by ..."). This module strips tags, decodes the
 * common HTML entities, removes those auto notes, and normalizes whitespace —
 * all with plain string ops so it works in Next.js SSR (no DOMParser/document).
 */

/** Minimal entity table covering the entities seen in Google descriptions. */
const HTML_ENTITIES: Readonly<Record<string, string>> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
}

/** Leading auto-generated phrases Google injects that carry no user value. */
const AUTO_TEXT_PREFIXES: readonly string[] = [
  'this event was created by',
  'this is a recurring',
  'you have been invited',
  'invitation:',
]

const stripHtmlTags = (value: string): string => value.replace(/<[^>]*>/g, '')

const decodeEntities = (value: string): string =>
  value.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (match) => HTML_ENTITIES[match] ?? match)

const collapseWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim()

/** Drops the description entirely when it is just a Google auto-generated note. */
const dropAutoText = (value: string): string => {
  const lower = value.toLowerCase()
  return AUTO_TEXT_PREFIXES.some((prefix) => lower.startsWith(prefix)) ? '' : value
}

/**
 * Cleans a raw Google Calendar event description.
 *
 * @param raw - Raw description (may contain HTML / auto-generated notes).
 * @returns A trimmed, plain-text description, or `undefined` when nothing
 *          meaningful remains.
 */
export const sanitizeDescription = (raw?: string): string | undefined => {
  if (!raw) return undefined

  const cleaned = dropAutoText(collapseWhitespace(decodeEntities(stripHtmlTags(raw))))

  return cleaned.length > 0 ? cleaned : undefined
}
