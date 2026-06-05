"use client"

import { Task } from '@/types/task'
import { ExternalLink } from 'lucide-react'

interface TaskResourcesProps {
  task: Task
}

export function TaskResources({ task }: TaskResourcesProps) {
  if (!task.resources || task.resources.length === 0) return null

  return (
    <section>
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/60">
        Resources
      </h4>
      <ul className="space-y-2">
        {task.resources.map((resource, i) => {
          const isString = typeof resource === 'string'
          const title = isString ? resource : resource.title
          const type = isString ? null : resource.type
          const url = isString ? null : resource.url

          return (
            <li key={i}>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {type && (
                      <span className="inline-flex shrink-0 items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70">
                        {type}
                      </span>
                    )}
                    <span className="truncate text-sm text-white/90">{title}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-white/50 group-hover:text-white" />
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="truncate text-sm text-white/90">{title}</span>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
