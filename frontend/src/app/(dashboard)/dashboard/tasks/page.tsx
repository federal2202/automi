"use client"

import { useQuery } from '@tanstack/react-query'
import { getTasks } from '@/services/tasks.service'
import { TaskList } from '@/components/tasks/TaskList'

export default function TasksPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
    refetchInterval: (query) => {
      const hasPending = query.state.data?.some((t) => t.aiStatus === 'pending')
      return hasPending ? 3000 : false
    },
  })

  return (
    <div className="bg-[#0e0e0e] text-white min-h-full w-full min-w-0 overflow-x-hidden flex flex-col p-4 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl lg:text-[48px] font-bold text-[#e5e2e1] tracking-[-2.4px] uppercase leading-tight font-['Space_Grotesk']">
              TASKS
            </h1>
            <p className="text-[10px] md:text-[11px] text-[#6b7280] tracking-[1.1px] uppercase font-['Plus_Jakarta_Sans']">
              EXECUTION QUEUE // SYNTHESIZED FROM CALENDAR SIGNALS
            </p>
          </div>
        </div>
      </div>

      {isLoading && <p className="text-white/70">Loading tasks...</p>}

      {isError && (
        <p className="text-red-400">Failed to load tasks. Please try again.</p>
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <p className="text-white/70">
          No tasks yet. Create a calendar event with the Task option enabled to generate one.
        </p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <TaskList tasks={data} />
      )}
    </div>
  )
}
