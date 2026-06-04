"use client"

import { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface TaskDoneButtonProps {
  task: Task
  onToggleDone: (id: string, isDone: boolean) => void
  disabled?: boolean
}

export function TaskDoneButton({
  task,
  onToggleDone,
  disabled,
}: TaskDoneButtonProps) {
  return (
    <div className="flex justify-end pt-2">
      <button
        type="button"
        onClick={() => onToggleDone(task.id, !task.isDone)}
        disabled={disabled}
        className={cn(
          "rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[1.1px] transition-colors font-['Plus_Jakarta_Sans']",
          task.isDone
            ? 'border-white/15 bg-white/10 text-white/80 hover:bg-white/15'
            : 'border-emerald-500/60 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {task.isDone ? 'Undo' : 'Mark as Done'}
      </button>
    </div>
  )
}
