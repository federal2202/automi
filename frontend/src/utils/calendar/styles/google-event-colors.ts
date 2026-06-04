/**
 * Official Google Calendar event color palette.
 *
 * Google exposes event colors as a `colorId` string in the range '1'..'11'.
 * This module maps those ids to their canonical hex values so events can be
 * rendered with the same accent color the user picked in Google Calendar.
 */

/** Maps a Google Calendar event `colorId` ('1'..'11') to its hex value. */
const GOOGLE_EVENT_COLOR_HEX: Readonly<Record<string, string>> = {
  '1': '#7986cb', // Lavender
  '2': '#33b679', // Sage
  '3': '#8e24aa', // Grape
  '4': '#e67c73', // Flamingo
  '5': '#f6bf26', // Banana
  '6': '#f4511e', // Tangerine
  '7': '#039be5', // Peacock
  '8': '#616161', // Graphite
  '9': '#3f51b5', // Blueberry
  '10': '#0b8043', // Basil
  '11': '#d50000', // Tomato
}

/**
 * Resolves a Google Calendar event `colorId` to a hex color string.
 *
 * @param colorId - Google Calendar event color id ('1'..'11'), optional.
 * @returns Hex color (e.g. '#33b679'), or `undefined` when the id is missing
 *          or outside the known range.
 */
export const googleColorIdToHex = (colorId?: string): string | undefined => {
  if (!colorId) return undefined
  return GOOGLE_EVENT_COLOR_HEX[colorId]
}
