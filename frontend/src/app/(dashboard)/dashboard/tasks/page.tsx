"use client"

import { useQuery } from '@tanstack/react-query'
import { getTasks } from '@/services/tasks.service'
import { TaskList } from '@/components/tasks/TaskList'

export default function TasksPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white mb-4">
        Tasks generated from Calendar Events
      </h1>

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
