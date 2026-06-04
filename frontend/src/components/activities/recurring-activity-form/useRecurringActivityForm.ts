import { useId, useMemo, useState } from 'react'
import {
  CreateActivityInput,
  RecurringActivity,
  ScheduleEntry,
} from '@/types/activity'
import { DEFAULT_END, DEFAULT_START } from './RecurringActivityForm.constants'
import {
  allEntriesShareTimes,
  setAllEntryTimes,
  setEntryTime,
  sortEntriesByDisplayOrder,
  toggleScheduleDay,
  validateActivityForm,
} from './RecurringActivityForm.utils'

interface UseRecurringActivityFormArgs {
  initialActivity: RecurringActivity | null
  onSubmit: (input: CreateActivityInput) => Promise<void> | void
  errorMessage: string | null
}

export function useRecurringActivityForm({
  initialActivity,
  onSubmit,
  errorMessage,
}: UseRecurringActivityFormArgs) {
  const isEdit = initialActivity !== null
  const errorRegionId = useId()

  const [title, setTitle] = useState(() => initialActivity?.title ?? '')

  // Initialize schedule: create defaults to Monday 09:00–10:00; edit reuses
  // the existing per-day entries verbatim.
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(() => {
    if (initialActivity?.schedule && initialActivity.schedule.length > 0) {
      return initialActivity.schedule.map((e) => ({ ...e }))
    }
    return [{ dayOfWeek: 1, startTime: DEFAULT_START, endTime: DEFAULT_END }]
  })

  // "Same time for all" defaults to true for create. On edit it auto-detects:
  // only true when every existing entry shares identical start+end.
  const [sameTimeForAll, setSameTimeForAll] = useState<boolean>(() => {
    if (!initialActivity || initialActivity.schedule.length === 0) return true
    return allEntriesShareTimes(initialActivity.schedule)
  })

  const [validationError, setValidationError] = useState<string | null>(null)

  // Sorted entries for rendering per-day rows (Mon → Sun). Kept memoized so
  // identity is stable per schedule reference.
  const sortedEntries = useMemo(
    () => sortEntriesByDisplayOrder(schedule),
    [schedule]
  )

  const sharedStart = schedule[0]?.startTime ?? DEFAULT_START
  const sharedEnd = schedule[0]?.endTime ?? DEFAULT_END

  const toggleDay = (dow: number) =>
    setSchedule((prev) => toggleScheduleDay(prev, dow))

  const updateSharedStart = (value: string) =>
    setSchedule((prev) => prev.map((e) => ({ ...e, startTime: value })))
  const updateSharedEnd = (value: string) =>
    setSchedule((prev) => prev.map((e) => ({ ...e, endTime: value })))
  const updateEntryStart = (dow: number, value: string) =>
    setSchedule((prev) => setEntryTime(prev, dow, { startTime: value }))
  const updateEntryEnd = (dow: number, value: string) =>
    setSchedule((prev) => setEntryTime(prev, dow, { endTime: value }))

  const handleSameTimeToggle = (next: boolean) => {
    if (next && !sameTimeForAll) {
      // Going ON: collapse to the first entry's times.
      setSchedule((prev) =>
        prev.length === 0
          ? prev
          : setAllEntryTimes(prev, prev[0].startTime, prev[0].endTime)
      )
    }
    // Going OFF: keep current times as-is (they're all equal at this point).
    setSameTimeForAll(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const trimmed = title.trim()
    const error = validateActivityForm(trimmed, schedule)
    if (error) {
      setValidationError(error)
      return
    }

    await onSubmit({ title: trimmed, schedule })
  }

  const errorText = validationError ?? errorMessage ?? null
  const hasError = Boolean(errorText)

  return {
    isEdit,
    errorRegionId,
    title,
    setTitle,
    schedule,
    sortedEntries,
    sameTimeForAll,
    sharedStart,
    sharedEnd,
    toggleDay,
    updateSharedStart,
    updateSharedEnd,
    updateEntryStart,
    updateEntryEnd,
    handleSameTimeToggle,
    handleSubmit,
    errorText,
    hasError,
  }
}
