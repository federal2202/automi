import { api } from '@/api/axios'
import {
  CreateActivityInput,
  RecurringActivity,
  UpdateActivityInput,
} from '@/types/activity'

/**
 * Per-date error returned by the backend when a Google Calendar API call
 * fails for an individual occurrence of a recurring activity.
 */
export interface SyncError {
  date: string
  message: string
}

/** Sync envelope returned alongside `POST /periods/:id/activities`. */
export interface CreateSyncResult {
  created: number
  skipped: number
  errors: SyncError[]
}

/** Sync envelope returned alongside `PATCH /periods/:id/activities/:id`. */
export interface UpdateSyncResult {
  updated: number
  deleted: number
  created: number
  errors: SyncError[]
}

/** Sync envelope returned (as 200) when delete partially fails on Google. */
export interface DeleteSyncResult {
  errors: SyncError[]
}

export type CreateActivityResponse = RecurringActivity & {
  sync: CreateSyncResult
}

export type UpdateActivityResponse = RecurringActivity & {
  sync: UpdateSyncResult
}

/**
 * Result of `deleteActivity` — backend returns:
 *   - 204 No Content → fully removed locally and on Google
 *   - 200 with `{ id, sync: { errors } }` → removed locally; Google leftovers
 */
export type DeleteActivityResult =
  | { kind: 'ok' }
  | { kind: 'partial'; id: string; sync: DeleteSyncResult }

export const getActivities = async (
  periodId: string
): Promise<RecurringActivity[]> => {
  const response = await api.get<RecurringActivity[]>(
    `/periods/${periodId}/activities`
  )
  return response.data
}

export const getActivityById = async (
  periodId: string,
  id: string
): Promise<RecurringActivity> => {
  const response = await api.get<RecurringActivity>(
    `/periods/${periodId}/activities/${id}`
  )
  return response.data
}

export const createActivity = async (
  periodId: string,
  input: CreateActivityInput
): Promise<CreateActivityResponse> => {
  const response = await api.post<CreateActivityResponse>(
    `/periods/${periodId}/activities`,
    input
  )
  return response.data
}

export const updateActivity = async (
  periodId: string,
  id: string,
  input: UpdateActivityInput
): Promise<UpdateActivityResponse> => {
  const response = await api.patch<UpdateActivityResponse>(
    `/periods/${periodId}/activities/${id}`,
    input
  )
  return response.data
}

export const deleteActivity = async (
  periodId: string,
  id: string
): Promise<DeleteActivityResult> => {
  const response = await api.delete<
    { id: string; sync: DeleteSyncResult } | ''
  >(`/periods/${periodId}/activities/${id}`)
  // 204 No Content → axios surfaces status 204 with empty body.
  if (response.status === 204 || !response.data) {
    return { kind: 'ok' }
  }
  const body = response.data as { id: string; sync: DeleteSyncResult }
  if (body.sync && Array.isArray(body.sync.errors) && body.sync.errors.length > 0) {
    return { kind: 'partial', id: body.id, sync: body.sync }
  }
  return { kind: 'ok' }
}
