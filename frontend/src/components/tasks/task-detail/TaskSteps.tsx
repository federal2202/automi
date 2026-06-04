"use client"

import { Task } from '@/types/task'

interface TaskStepsProps {
  task: Task
}

export function TaskSteps({ task }: TaskStepsProps) {
  if (!(task.steps?.length > 0)) return null

  return (
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
  )
}
