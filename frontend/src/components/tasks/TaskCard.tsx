"use client"

import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface TaskCardProps {
  task: Task
  onToggleDone: (id: string, isDone: boolean) => void
  disabled?: boolean
}

export function TaskCard({ task, onToggleDone, disabled }: TaskCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border-2 bg-white/5 px-4 py-2.5 backdrop-blur-sm transition-colors',
        task.isDone ? 'border-green-500' : 'border-gray-300/40'
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {task.isDone && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 shrink-0 text-green-500"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span
          className={cn(
            'truncate text-sm font-medium',
            task.isDone ? 'text-white/60 line-through' : 'text-white'
          )}
        >
          {task.title}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onToggleDone(task.id, !task.isDone)}
        disabled={disabled}
        className={cn(
          'shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
          task.isDone
            ? 'bg-white/10 text-white/80 hover:bg-white/15'
            : 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {task.isDone ? 'Undo' : 'Mark as Done'}
      </button>
    </div>
  )
}
