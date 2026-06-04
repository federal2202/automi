import { DAYS_OF_WEEK, ScheduleEntry } from '@/types/activity'

interface CardScheduleProps {
  sortedEntries: ScheduleEntry[]
  contextEntry?: ScheduleEntry
  allSameTimes: boolean
}

export function CardSchedule({
  sortedEntries,
  contextEntry,
  allSameTimes,
}: CardScheduleProps) {
  if (contextEntry) {
    return (
      <p className="font-jakarta text-xs tracking-[0.5px] text-text-muted">
        <span className="text-white/80">
          {DAYS_OF_WEEK[contextEntry.dayOfWeek]}
        </span>
        <span className="mx-1 text-white/40">·</span>
        {contextEntry.startTime} – {contextEntry.endTime}
      </p>
    )
  }

  // Guard the [0] access: real activities always have ≥1 entry, but this keeps
  // the shared-time block from throwing if ever called with an empty schedule.
  if (allSameTimes && sortedEntries.length > 0) {
    return (
      <p className="font-jakarta text-xs tracking-[0.5px] text-text-muted">
        {sortedEntries.map((e) => DAYS_OF_WEEK[e.dayOfWeek]).join(', ')}
        <span className="mx-1 text-white/40">·</span>
        {sortedEntries[0].startTime} – {sortedEntries[0].endTime}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      {sortedEntries.map((e) => (
        <p
          key={e.dayOfWeek}
          className="font-jakarta text-xs tracking-[0.5px] text-text-muted"
        >
          <span className="text-white/80">{DAYS_OF_WEEK[e.dayOfWeek]}</span>{' '}
          {e.startTime} – {e.endTime}
        </p>
      ))}
    </div>
  )
}
