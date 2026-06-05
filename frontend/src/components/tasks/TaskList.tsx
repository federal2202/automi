"use client"

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Task } from '@/types/task'
import { toggleTaskDone } from '@/services/tasks.service'
import { TaskCard } from './TaskCard'
import { TaskDetailDialog } from './TaskDetailDialog'

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) =>
      toggleTaskDone(id, isDone),
    onMutate: async ({ id, isDone }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<Task[]>(['tasks'])
      queryClient.setQueryData<Task[]>(['tasks'], (curr) =>
        curr?.map((t) => (t.id === id ? { ...t, isDone } : t))
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['tasks'], ctx.previous)
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Task[]>(['tasks'], (curr) =>
        curr?.map((t) => (t.id === updated.id ? updated : t))
      )
    },
  })

  const handleToggleDone = (id: string, isDone: boolean) => {
    mutation.mutate({ id, isDone })
    if (isDone) setSelectedId(null)
  }

  const selectedTask = tasks.find((t) => t.id === selectedId) ?? null
  const pendingId =
    mutation.isPending && mutation.variables ? mutation.variables.id : null

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleDone={handleToggleDone}
            onOpen={() => setSelectedId(task.id)}
            disabled={pendingId === task.id}
          />
        ))}
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={selectedTask !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
        onToggleDone={handleToggleDone}
        disabled={selectedTask ? pendingId === selectedTask.id : false}
      />
    </>
  )
}
