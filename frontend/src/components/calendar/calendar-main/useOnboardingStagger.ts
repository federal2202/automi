"use client"

import { useMemo, useState } from 'react'
import { CalendarEvent } from '@/types/calendar/calendar.types'

/**
 * Read & clear the one-shot "just onboarded" flag. Runs in a `useState`
 * initializer (client-only component) so it fires exactly once on first
 * render and a refresh doesn't replay the celebration.
 */
function readJustOnboardedFlag(): boolean {
  try {
    if (sessionStorage.getItem('justOnboarded') === '1') {
      sessionStorage.removeItem('justOnboarded')
      return true
    }
  } catch {
    // sessionStorage can throw in private modes — silently skip the anim.
  }
  return false
}

/**
 * One-shot "just finished onboarding" stagger animation.
 *
 * Returns a stable eventId -> stagger-index map sorted by start ascending
 * (capped at 12 so a packed week settles in <1.1s), or null when no
 * animation should run.
 */
export function useOnboardingStagger(events: CalendarEvent[]) {
  const [justOnboarded] = useState(readJustOnboardedFlag)

  return useMemo(() => {
    if (!justOnboarded) return null
    const map = new Map<string, number>()
    const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime())
    sorted.forEach((e, i) => map.set(e.id, Math.min(i, 12)))
    return map
  }, [justOnboarded, events])
}
