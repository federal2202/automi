"use client"

import { Task } from '@/types/task'

interface TaskDescriptionProps {
  task: Task
}

export function TaskDescription({ task }: TaskDescriptionProps) {
  if (!task.description) return null

  return (
    <section>
      <p className="text-sm leading-relaxed text-white/80">
        {task.description}
      </p>
    </section>
  )
}
