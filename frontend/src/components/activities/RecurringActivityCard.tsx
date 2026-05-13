"use client"

import { memo, useCallback } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { RecurringActivity } from '@/types/activity'
import { cn } from '@/utils/cn'

interface RecurringActivityCardProps {
  activity: RecurringActivity
  onEdit: (activity: RecurringActivity) => void
  onDelete: (activity: RecurringActivity) => void
  disabled?: boolean
}

function RecurringActivityCardImpl({
  activity,
  onEdit,
  onDelete,
  disabled,
}: RecurringActivityCardProps) {
  const handleEdit = useCallback(() => onEdit(activity), [onEdit, activity])
  const handleDelete = useCallback(
    () => onDelete(activity),
    [onDelete, activity]
  )

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-colors',
        'hover:bg-white/[0.08] sm:flex-row sm:items-center sm:justify-between'
      )}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <h4 className="font-space-grotesk text-base font-semibold leading-tight text-text-primary line-clamp-2">
          {activity.title}
        </h4>
        <p className="font-jakarta text-xs tracking-[0.5px] text-text-muted">
          {activity.startTime} – {activity.endTime}
        </p>
      </div>

      <div className="flex justify-end gap-2 shrink-0">
        <button
          type="button"
          onClick={handleEdit}
          disabled={disabled}
          aria-label={`Edit ${activity.title}`}
          className={cn(
            'flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[1.1px] text-white/80 transition-colors',
            'hover:bg-white/15',
            'font-jakarta',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={disabled}
          aria-label={`Delete ${activity.title}`}
          className={cn(
            'flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[1.1px] text-red-200 transition-colors',
            'hover:bg-red-500/25',
            'font-jakarta',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      </div>
    </div>
  )
}

export const RecurringActivityCard = memo(RecurringActivityCardImpl)
