import { RecurringActivity } from '@/types/activity'

export type ActivityDayBuckets = Record<number, RecurringActivity[]>

/**
 * Bucket activities by each entry in `schedule` (0..6) and sort each bucket by
 * that day's start time. An activity with multiple schedule entries appears in
 * each of its day buckets. Times are zero-padded `HH:mm`, so lexicographic
 * compare matches chronological.
 */
export function groupActivitiesByDay(
  activities: RecurringActivity[] | undefined
): ActivityDayBuckets {
  const buckets: ActivityDayBuckets = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  }
  if (!activities) return buckets
  for (const a of activities) {
    a.schedule.forEach((entry) => {
      if (entry.dayOfWeek >= 0 && entry.dayOfWeek <= 6) {
        buckets[entry.dayOfWeek].push(a)
      }
    })
  }
  for (const dowKey of Object.keys(buckets)) {
    const dow = Number(dowKey)
    buckets[dow].sort((x, y) => {
      const sx = x.schedule.find((e) => e.dayOfWeek === dow)?.startTime ?? ''
      const sy = y.schedule.find((e) => e.dayOfWeek === dow)?.startTime ?? ''
      return sx.localeCompare(sy)
    })
  }
  return buckets
}
