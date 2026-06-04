"use client"

import { Task } from '@/types/task'

interface TaskSuccessCriteriaProps {
  task: Task
}

export function TaskSuccessCriteria({ task }: TaskSuccessCriteriaProps) {
  if (!task.successCriteria) return null

  return (
    <section>
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/60">
        Success Criteria
      </h4>
      <p className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm leading-relaxed text-white/80">
        {task.successCriteria}
      </p>
    </section>
  )
}
