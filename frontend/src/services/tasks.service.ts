import { api } from '@/api/axios'
import { Task } from '@/types/task'

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks')
  return response.data
}

export const getTaskById = async (id: string): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${id}`)
  return response.data
}

export const toggleTaskDone = async (id: string, isDone: boolean): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/${id}/done`, { isDone })
  return response.data
}

export const tasksService = {
  getTasks,
  getTaskById,
  toggleTaskDone,
} as const
