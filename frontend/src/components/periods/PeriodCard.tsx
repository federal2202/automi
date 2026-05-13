"use client"

import { memo, useCallback, MouseEvent } from 'react'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { Period } from '@/types/period'
import { cn } from '@/utils/cn'
import { daysBetween, formatPeriodRange } from '@/utils/period-dates'

interface PeriodCardProps {
  period: Period
  onEdit: (period: Period) => void
  onDelete: (period: Period) => void
  disabled?: boolean
}

function PeriodCardImpl({
  period,
  onEdit,
  onDelete,
  disabled,
}: PeriodCardProps) {
  const range = formatPeriodRange(period.startDate, period.endDate)
  const days = daysBetween(period.startDate, period.endDate)

  const href = `/dashboard/periods/${period.id}`

  const handleEdit = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      onEdit(period)
    },
    [onEdit, period]
  )

  const handleDelete = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      onDelete(period)
    },
    [onDelete, period]
  )

  return (
    <div
      className={cn(
        'group relative h-full rounded-xl border-2 backdrop-blur-sm transition-all',
        'border-white/10 bg-white/5 hover:bg-white/[0.08] hover:-translate-y-0.5',
        'focus-within:ring-2 focus-within:ring-green-nice focus-within:ring-offset-2 focus-within:ring-offset-bg-surface'
      )}
    >
      <Link
        href={href}
        aria-label={`Open ${period.title}`}
        className={cn(
          'flex h-full flex-col justify-between gap-4 p-5 rounded-xl',
          'focus:outline-none'
        )}
      >
        <div className="flex flex-col gap-2 min-w-0">
          <h3 className="font-space-grotesk text-xl font-bold leading-tight tracking-[-0.5px] text-text-primary line-clamp-2">
            {period.title}
          </h3>
          <p className="text-sm text-white/70 font-jakarta">
            {range}
          </p>
          {days !== null && (
            <p className="text-[10px] uppercase tracking-[1.1px] text-text-muted font-jakarta">
              {days} day{days === 1 ? '' : 's'}
            </p>
          )}
        </div>
        {/* Spacer to reserve room so action buttons don't overlap content */}
        <div aria-hidden className="h-7" />
      </Link>

      <div className="pointer-events-none absolute bottom-5 right-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={handleEdit}
          disabled={disabled}
          aria-label={`Edit ${period.title}`}
          className={cn(
            'pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[1.1px] text-white/80 transition-colors',
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
          aria-label={`Delete ${period.title}`}
          className={cn(
            'pointer-events-auto flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[1.1px] text-red-200 transition-colors',
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

export const PeriodCard = memo(PeriodCardImpl)
