import { api } from '@/api/axios'
import { CreatePeriodInput, Period, UpdatePeriodInput } from '@/types/period'

export const getPeriods = async (): Promise<Period[]> => {
  const response = await api.get<Period[]>('/periods')
  return response.data
}

export const getPeriodById = async (id: string): Promise<Period> => {
  const response = await api.get<Period>(`/periods/${id}`)
  return response.data
}

export const createPeriod = async (
  input: CreatePeriodInput
): Promise<Period> => {
  const response = await api.post<Period>('/periods', input)
  return response.data
}

export const updatePeriod = async (
  id: string,
  input: UpdatePeriodInput
): Promise<Period> => {
  const response = await api.patch<Period>(`/periods/${id}`, input)
  return response.data
}

export const deletePeriod = async (id: string): Promise<void> => {
  await api.delete(`/periods/${id}`)
}
