"use client"

import { useId, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import {
  CreateActivityInput,
  DAYS_OF_WEEK,
  DAYS_OF_WEEK_LONG,
  RecurringActivity,
  ScheduleEntry,
  WEEK_DISPLAY_ORDER,
} from '@/types/activity'

interface RecurringActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialActivity?: RecurringActivity | null
  onSubmit: (input: CreateActivityInput) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage?: string | null
}

export function RecurringActivityFormDialog({
  open,
  onOpenChange,
  initialActivity,
  onSubmit,
  isSubmitting,
  errorMessage,
}: RecurringActivityFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-surface border border-white/10 text-white">
        {open && (
          <RecurringActivityFormBody
            key={initialActivity?.id ?? 'create'}
            initialActivity={initialActivity ?? null}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage ?? null}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface RecurringActivityFormBodyProps {
  initialActivity: RecurringActivity | null
  onCancel: () => void
  onSubmit: (input: CreateActivityInput) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage: string | null
}

const DEFAULT_START = '09:00'
const DEFAULT_END = '10:00'

function allEntriesShareTimes(entries: ScheduleEntry[]): boolean {
  if (entries.length === 0) return true
  const first = entries[0]
  return entries.every(
    (e) => e.startTime === first.startTime && e.endTime === first.endTime
  )
}

function RecurringActivityFormBody({
  initialActivity,
  onCancel,
  onSubmit,
  isSubmitting,
  errorMessage,
}: RecurringActivityFormBodyProps) {
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
  const sortedEntries = useMemo(() => {
    const orderIndex = new Map<number, number>()
    WEEK_DISPLAY_ORDER.forEach((dow, idx) => orderIndex.set(dow, idx))
    return [...schedule].sort(
      (a, b) =>
        (orderIndex.get(a.dayOfWeek) ?? 0) - (orderIndex.get(b.dayOfWeek) ?? 0)
    )
  }, [schedule])

  const sharedStart = schedule[0]?.startTime ?? DEFAULT_START
  const sharedEnd = schedule[0]?.endTime ?? DEFAULT_END

  const toggleDay = (dow: number) => {
    setSchedule((prev) => {
      const exists = prev.some((e) => e.dayOfWeek === dow)
      if (exists) {
        return prev.filter((e) => e.dayOfWeek !== dow)
      }
      // Adding a new day: copy shared times when "same time for all" is on,
      // otherwise fall back to the first entry's times (or defaults).
      const start = sameTimeForAll
        ? prev[0]?.startTime ?? DEFAULT_START
        : prev[0]?.startTime ?? DEFAULT_START
      const end = sameTimeForAll
        ? prev[0]?.endTime ?? DEFAULT_END
        : prev[0]?.endTime ?? DEFAULT_END
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
      // Going ON: collapse to the first entry's times.
      setSchedule((prev) => {
        if (prev.length === 0) return prev
        const s = prev[0].startTime
        const e = prev[0].endTime
        return prev.map((entry) => ({ ...entry, startTime: s, endTime: e }))
      })
    }
    // Going OFF: keep current times as-is (they're all equal at this point).
    setSameTimeForAll(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const trimmed = title.trim()
    if (!trimmed) {
      setValidationError('Title is required.')
      return
    }
    if (schedule.length === 0) {
      setValidationError('Select at least one day.')
      return
    }
    for (const entry of schedule) {
      if (!entry.startTime || !entry.endTime) {
        setValidationError('Both start and end times are required.')
        return
      }
      // Both values are `HH:mm` so lexicographic compare matches chronological.
      if (entry.endTime <= entry.startTime) {
        setValidationError(
          `End time must be after start time on ${DAYS_OF_WEEK_LONG[entry.dayOfWeek]}.`
        )
        return
      }
    }

    await onSubmit({
      title: trimmed,
      schedule,
    })
  }

  const errorText = validationError ?? errorMessage ?? null
  const hasError = Boolean(errorText)

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-space-grotesk text-2xl tracking-[-1px] uppercase">
          {isEdit ? 'Edit Activity' : 'Add Activity'}
        </DialogTitle>
        <DialogDescription className="text-text-muted text-[11px] uppercase tracking-[1.1px] font-jakarta">
          Recurring rule // day + time window inside this period
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="activity-title"
            className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
          >
            Title
          </Label>
          <Input
            id="activity-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Morning gym"
            autoFocus
            disabled={isSubmitting}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorRegionId : undefined}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span
            id="activity-days-label"
            className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
          >
            Days of Week
          </span>
          <div
            role="group"
            aria-labelledby="activity-days-label"
            aria-describedby={hasError ? errorRegionId : undefined}
            className="flex flex-wrap gap-2"
          >
            {WEEK_DISPLAY_ORDER.map((dow) => {
              const isActive = schedule.some((e) => e.dayOfWeek === dow)
              return (
                <button
                  key={dow}
                  type="button"
                  onClick={() => toggleDay(dow)}
                  disabled={isSubmitting}
                  aria-pressed={isActive}
                  className={cn(
                    'min-w-[44px] rounded-full border px-3 py-1.5 text-xs font-bold',
                    'font-space-grotesk uppercase tracking-wide transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-nice/60',
                    isActive
                      ? 'bg-green-nice border-green-nice text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white',
                    isSubmitting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {DAYS_OF_WEEK[dow]}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label
            className={cn(
              'flex items-center gap-2 text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta select-none',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="checkbox"
              checked={sameTimeForAll}
              onChange={(e) => handleSameTimeToggle(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-green-nice"
            />
            Same time for all selected days
          </label>

          {sameTimeForAll ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="activity-start"
                  className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
                >
                  Start Time
                </Label>
                <Input
                  id="activity-start"
                  type="time"
                  value={sharedStart}
                  max={sharedEnd || undefined}
                  onChange={(e) => updateSharedStart(e.target.value)}
                  disabled={isSubmitting || schedule.length === 0}
                  aria-invalid={hasError || undefined}
                  aria-describedby={hasError ? errorRegionId : undefined}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="activity-end"
                  className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
                >
                  End Time
                </Label>
                <Input
                  id="activity-end"
                  type="time"
                  value={sharedEnd}
                  min={sharedStart || undefined}
                  onChange={(e) => updateSharedEnd(e.target.value)}
                  disabled={isSubmitting || schedule.length === 0}
                  aria-invalid={hasError || undefined}
                  aria-describedby={hasError ? errorRegionId : undefined}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedEntries.length === 0 && (
                <p className="text-white/50 text-xs font-jakarta">
                  Select at least one day above to configure times.
                </p>
              )}
              {sortedEntries.map((entry) => {
                const startId = `activity-start-${entry.dayOfWeek}`
                const endId = `activity-end-${entry.dayOfWeek}`
                return (
                  <div
                    key={entry.dayOfWeek}
                    className="grid grid-cols-[80px_1fr_1fr] items-center gap-3"
                  >
                    <span className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta">
                      {DAYS_OF_WEEK_LONG[entry.dayOfWeek]}
                    </span>
                    <div className="flex flex-col gap-1">
                      <Label
                        htmlFor={startId}
                        className="sr-only"
                      >
                        Start time for {DAYS_OF_WEEK_LONG[entry.dayOfWeek]}
                      </Label>
                      <Input
                        id={startId}
                        type="time"
                        value={entry.startTime}
                        max={entry.endTime || undefined}
                        onChange={(e) =>
                          updateEntryStart(entry.dayOfWeek, e.target.value)
                        }
                        disabled={isSubmitting}
                        aria-invalid={hasError || undefined}
                        aria-describedby={hasError ? errorRegionId : undefined}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={endId} className="sr-only">
                        End time for {DAYS_OF_WEEK_LONG[entry.dayOfWeek]}
                      </Label>
                      <Input
                        id={endId}
                        type="time"
                        value={entry.endTime}
                        min={entry.startTime || undefined}
                        onChange={(e) =>
                          updateEntryEnd(entry.dayOfWeek, e.target.value)
                        }
                        disabled={isSubmitting}
                        aria-invalid={hasError || undefined}
                        aria-describedby={hasError ? errorRegionId : undefined}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <p
          id={errorRegionId}
          role="alert"
          aria-live="polite"
          className={cn(
            'text-sm text-red-400 min-h-[1.25rem]',
            !hasError && 'sr-only'
          )}
        >
          {errorText ?? ''}
        </p>

        <DialogFooter className="mt-2 gap-2 sm:gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={cn(
              'rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80',
              'hover:bg-white/10 transition-colors',
              'font-space-grotesk uppercase tracking-wide',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'rounded-lg bg-green-nice px-4 py-2 text-sm font-bold text-white',
              'hover:bg-green-nice/90 transition-colors',
              'font-space-grotesk uppercase tracking-wide',
              isSubmitting && 'opacity-60 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"
                />
                Syncing to Google Calendar...
              </span>
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Add Activity'
            )}
          </button>
        </DialogFooter>
      </form>
    </>
  )
}
