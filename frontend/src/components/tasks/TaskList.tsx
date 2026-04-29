"use client"

import { useState } from 'react'
import { Task } from '@/types/task'
import { toggleTaskDone } from '@/services/tasks.service'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks: initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const handleToggleDone = async (id: string, isDone: boolean) => {
    const previous = tasks
    setTasks((curr) => curr.map((t) => (t.id === id ? { ...t, isDone } : t)))
    setPendingIds((curr) => new Set(curr).add(id))

    try {
      const updated = await toggleTaskDone(id, isDone)
      setTasks((curr) => curr.map((t) => (t.id === id ? updated : t)))
    } catch (error) {
      console.error('Failed to toggle task done:', error)
      setTasks(previous)
    } finally {
      setPendingIds((curr) => {
        const next = new Set(curr)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleDone={handleToggleDone}
          disabled={pendingIds.has(task.id)}
        />
      ))}
    </div>
  )
}
