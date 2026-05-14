import { toast } from 'sonner'
import type {
  CreateSyncResult,
  DeleteSyncResult,
  UpdateSyncResult,
} from '@/services/activities.service'

/**
 * Surface the result of a Google Calendar fan-out triggered by activity
 * create. Mirrors the three branches the backend can return:
 *   - all good          → success toast with event count
 *   - partial failure   → warning toast + console-log error detail
 *   - no occurrences    → info toast (period had no matching weekdays)
 */
export function toastActivityCreate(sync: CreateSyncResult): void {
  if (sync.errors.length === 0 && sync.created > 0) {
    toast.success(
      `Activity added — ${sync.created} event${sync.created === 1 ? '' : 's'} created in Google Calendar`
    )
    return
  }
  if (sync.errors.length > 0 && sync.created > 0) {
    toast.warning(
      `Activity added — ${sync.created} event${sync.created === 1 ? '' : 's'} created, ${sync.errors.length} failed`
    )
    console.warn('Activity create — Google Calendar sync errors', sync.errors)
    return
  }
  if (sync.created === 0 && sync.errors.length === 0) {
    toast.info('Activity added — no events to create (no matching days in period)')
    return
  }
  // Created === 0 with errors: surfacing as an error for visibility.
  toast.error(
    `Activity added but ${sync.errors.length} Google Calendar event${sync.errors.length === 1 ? '' : 's'} failed`
  )
  console.warn('Activity create — Google Calendar sync errors', sync.errors)
}

/**
 * Surface the result of a Google Calendar fan-out triggered by activity
 * edit. The backend may delete+recreate when daysOfWeek changes, so we
 * collapse `updated + created + deleted` into a single "synced" count for
 * a tidy single-sentence toast.
 */
export function toastActivityUpdate(sync: UpdateSyncResult): void {
  const synced = sync.updated + sync.created + sync.deleted
  if (sync.errors.length === 0) {
    if (synced === 0) {
      toast.info('Activity updated — no Google Calendar events to sync')
      return
    }
    toast.success(
      `Activity updated — ${synced} event${synced === 1 ? '' : 's'} synced`
    )
    return
  }
  toast.warning(
    `Activity updated — ${synced} event${synced === 1 ? '' : 's'} synced, ${sync.errors.length} failed`
  )
  console.warn('Activity update — Google Calendar sync errors', sync.errors)
}

/**
 * Surface the result of activity delete. The backend usually returns 204,
 * but on Google API errors it returns 200 with `{ sync: { errors } }` —
 * the local row is gone either way, so we frame partial failures as
 * "deleted, but…" rather than a hard error.
 */
export function toastActivityDelete(result: {
  kind: 'ok' | 'partial'
  sync?: DeleteSyncResult
}): void {
  if (result.kind === 'ok') {
    toast.success('Activity deleted')
    return
  }
  const count = result.sync?.errors.length ?? 0
  toast.warning(
    `Activity deleted, but ${count} event${count === 1 ? '' : 's'} couldn't be removed from Google Calendar`
  )
  if (result.sync?.errors.length) {
    console.warn('Activity delete — Google Calendar sync errors', result.sync.errors)
  }
}
