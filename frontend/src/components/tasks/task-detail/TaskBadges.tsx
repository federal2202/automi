"use client"

import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

const difficultyStyles: Record<Task['difficulty'], string> = {
  easy: 'bg-green-500/15 text-green-300 border-green-500/40',
  medium: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
  hard: 'bg-red-500/15 text-red-300 border-red-500/40',
}

interface TaskBadgesProps {
  task: Task
}

export function TaskBadges({ task }: TaskBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
          difficultyStyles[task.difficulty]
        )}
      >
        {task.difficulty}
      </span>
      <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/80">
        {task.estimatedTimeMinutes} min
      </span>
      {task.isDone && (
        <span className="inline-flex items-center rounded-full border border-green-500/40 bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-300">
          Completed
        </span>
      )}
    </div>
  )
}
