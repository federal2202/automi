"use client"

import { Task } from '@/types/task'
import {
  Dialog,
  DialogContent,
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.5px] text-[#e5e2e1] normal-case">
            {task.title}
          </DialogTitle>
          <TaskBadges task={task} />
        </DialogHeader>

        <div className="space-y-5">
          <TaskDescription task={task} />
          <TaskSteps task={task} />
          <TaskResources task={task} />
          <TaskSuccessCriteria task={task} />
        </div>

        <TaskDoneButton
          task={task}
          onToggleDone={onToggleDone}
          disabled={disabled}
        />
      </DialogContent>
    </Dialog>
  )
}
