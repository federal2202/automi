"use client"

import { Task } from '@/types/task'
import { cn } from '@/utils/cn'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExternalLink } from 'lucide-react'

interface TaskDetailDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleDone: (id: string, isDone: boolean) => void
  disabled?: boolean
}

const difficultyStyles: Record<Task['difficulty'], string> = {
  easy: 'bg-green-500/15 text-green-300 border-green-500/40',
  medium: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
  hard: 'bg-red-500/15 text-red-300 border-red-500/40',
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onToggleDone,
  disabled,
}: TaskDetailDialogProps) {
  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.5px] text-[#e5e2e1] normal-case">
            {task.title}
          </DialogTitle>
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
        </DialogHeader>

        <div className="space-y-5">
          {task.description && (
            <section>
              <p className="text-sm leading-relaxed text-white/80">
                {task.description}
              </p>
            </section>
          )}

          {task.steps?.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/60">
                Steps
              </h4>
              <ol className="space-y-3">
                {task.steps
                  .slice()
                  .sort((a, b) => a.stepNumber - b.stepNumber)
                  .map((step) => (
                    <li
                      key={step.stepNumber}
                      className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--green-nice)]/20 text-xs font-semibold text-green-300">
                        {step.stepNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white">
                          {step.title}
                        </div>
                        <p className="mt-1 text-sm text-white/70">
                          {step.instruction}
                        </p>
                      </div>
                    </li>
                  ))}
              </ol>
            </section>
          )}

          {task.resources && task.resources.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/60">
                Resources
              </h4>
              <ul className="space-y-2">
                {task.resources.map((resource) => (
                  <li key={resource.url}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:border-white/20 hover:bg-white/10"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="inline-flex shrink-0 items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70">
                          {resource.type}
                        </span>
                        <span className="truncate text-sm text-white/90">
                          {resource.title}
                        </span>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-white/50 group-hover:text-white" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {task.successCriteria && (
            <section>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/60">
                Success Criteria
              </h4>
              <p className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm leading-relaxed text-white/80">
                {task.successCriteria}
              </p>
            </section>
          )}
        </div>

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
      </DialogContent>
    </Dialog>
  )
}
