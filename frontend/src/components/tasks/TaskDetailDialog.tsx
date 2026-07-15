"use client"

import { Task } from '@/types/task'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  TaskBadges,
  TaskDescription,
  TaskSteps,
  TaskResources,
  TaskSuccessCriteria,
  TaskDoneButton,
} from './task-detail'

interface TaskDetailDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleDone: (id: string, isDone: boolean) => void
  disabled?: boolean
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
      <DialogContent
        className={[
          '!w-screen !h-[100dvh] !max-w-none !rounded-none',
          'sm:!w-[95vw] sm:!h-[85vh] sm:!max-w-6xl sm:!rounded-xl',
          'flex flex-col overflow-hidden p-4 pt-6 sm:p-6',
        ].join(' ')}
      >
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold tracking-[-0.5px] text-[#e5e2e1] normal-case break-words">
            {task.title}
          </DialogTitle>
          <TaskBadges task={task} />
          <DialogDescription className="sr-only">
            Task details for {task.title}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 overflow-y-auto md:overflow-visible -mx-1 px-1">
          {/* Left column */}
          <div className="min-h-0 flex flex-col gap-4 md:overflow-y-auto md:pr-2">
            <TaskDescription task={task} />
            <TaskResources task={task} />
            <TaskSuccessCriteria task={task} />
          </div>

          {/* Right column */}
          <div className="min-h-0 md:overflow-y-auto md:pr-2">
            <TaskSteps task={task} />
          </div>
        </div>

        <div className="shrink-0 pt-4 border-t border-white/10 flex justify-end">
          <TaskDoneButton
            task={task}
            onToggleDone={onToggleDone}
            disabled={disabled}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
