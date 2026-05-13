import { api } from '@/api/axios'
import {
  CreateActivityInput,
  RecurringActivity,
  UpdateActivityInput,
} from '@/types/activity'

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
): Promise<RecurringActivity> => {
  const response = await api.post<RecurringActivity>(
    `/periods/${periodId}/activities`,
    input
  )
  return response.data
}

export const updateActivity = async (
  periodId: string,
  id: string,
  input: UpdateActivityInput
): Promise<RecurringActivity> => {
  const response = await api.patch<RecurringActivity>(
    `/periods/${periodId}/activities/${id}`,
    input
  )
  return response.data
}

export const deleteActivity = async (
  periodId: string,
  id: string
): Promise<void> => {
  await api.delete(`/periods/${periodId}/activities/${id}`)
}
