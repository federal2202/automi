"use client"

import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface TaskCardProps {
  task: Task
  onToggleDone: (id: string, isDone: boolean) => void
  onOpen: () => void
  disabled?: boolean
}

export function TaskCard({ task, onToggleDone, onOpen, disabled }: TaskCardProps) {
  if (task.aiStatus === 'pending') {
    return (
      <div className="flex h-full flex-col justify-between gap-4 rounded-xl border-2 border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
        </div>
        <div className="flex justify-end">
          <div className="h-6 w-24 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className={cn(
        'group flex h-full cursor-pointer flex-col justify-between gap-4 rounded-xl border-2 p-5 backdrop-blur-sm transition-all',
        'hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--green-nice)_50%,transparent)]',
        task.isDone
          ? 'bg-emerald-500/15 border-emerald-500/60 hover:bg-emerald-500/20'
          : 'bg-red-500/15 border-red-500/50 hover:bg-red-500/20'
      )}
    >
      <div className="flex items-start gap-2 min-w-0">
        {task.isDone && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="mt-1 h-4 w-4 shrink-0 text-emerald-400"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <h3
          className={cn(
            "font-['Space_Grotesk'] text-lg font-bold leading-tight tracking-[-0.5px] line-clamp-2",
            task.isDone ? 'text-white/55 line-through' : 'text-[#e5e2e1]'
          )}
        >
          {task.title}
        </h3>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleDone(task.id, !task.isDone)
          }}
          disabled={disabled}
          className={cn(
            "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[1.1px] transition-colors font-['Plus_Jakarta_Sans']",
            task.isDone
              ? 'border-white/15 bg-white/10 text-white/80 hover:bg-white/15'
              : 'border-emerald-500/60 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {task.isDone ? 'Undo' : 'Mark as Done'}
        </button>
      </div>
    </div>
  )
}
