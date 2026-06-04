"use client"

import { useMemo, useState } from 'react'
import { ScheduleEntry } from '@/types/activity'
import { DEFAULT_START, DEFAULT_END } from './activity-step.constants'
import { sortByDisplayOrder } from './activity-step.utils'

/**
 * Owns the weekday `schedule[]` and the "same time for all" toggle for the
 * activity step. Pure local-state editing — no network/validation — so the
 * submission hook can stay focused on the mutation and error orchestration.
 */
export function useScheduleEditor() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([
    { dayOfWeek: 1, startTime: DEFAULT_START, endTime: DEFAULT_END },
  ])
  const [sameTimeForAll, setSameTimeForAll] = useState(true)

  const sortedEntries = useMemo(() => sortByDisplayOrder(schedule), [schedule])
  const sharedStart = schedule[0]?.startTime ?? DEFAULT_START
  const sharedEnd = schedule[0]?.endTime ?? DEFAULT_END

  const toggleDay = (dow: number) => {
    setSchedule((prev) => {
      const exists = prev.some((e) => e.dayOfWeek === dow)
      if (exists) {
        return prev.filter((e) => e.dayOfWeek !== dow)
      }
      const start = prev[0]?.startTime ?? DEFAULT_START
      const end = prev[0]?.endTime ?? DEFAULT_END
      return [...prev, { dayOfWeek: dow, startTime: start, endTime: end }]
    })
  }

  const updateSharedStart = (value: string) => {
    setSchedule((prev) => prev.map((e) => ({ ...e, startTime: value })))
  }
  const updateSharedEnd = (value: string) => {
    setSchedule((prev) => prev.map((e) => ({ ...e, endTime: value })))
  }
  const updateEntryStart = (dow: number, value: string) => {
    setSchedule((prev) =>
      prev.map((e) => (e.dayOfWeek === dow ? { ...e, startTime: value } : e))
    )
  }
  const updateEntryEnd = (dow: number, value: string) => {
    setSchedule((prev) =>
      prev.map((e) => (e.dayOfWeek === dow ? { ...e, endTime: value } : e))
    )
  }

  const handleSameTimeToggle = (next: boolean) => {
    if (next && !sameTimeForAll) {
      setSchedule((prev) => {
        if (prev.length === 0) return prev
        const s = prev[0].startTime
        const e = prev[0].endTime
        return prev.map((entry) => ({ ...entry, startTime: s, endTime: e }))
      })
    }
    setSameTimeForAll(next)
  }

  return {
    schedule,
    sameTimeForAll,
    sortedEntries,
    sharedStart,
    sharedEnd,
    toggleDay,
    updateSharedStart,
    updateSharedEnd,
    updateEntryStart,
    updateEntryEnd,
    handleSameTimeToggle,
  }
}
