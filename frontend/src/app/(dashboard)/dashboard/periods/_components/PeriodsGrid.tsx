"use client"

import { Period } from '@/types/period'
import { PeriodCard } from '@/components/periods/PeriodCard'

interface PeriodsGridProps {
  periods: Period[]
  onEdit: (period: Period) => void
  onDelete: (period: Period) => void
  deletingId: string | null
}

/** Empty-state copy shown when the user has no periods yet. */
export function PeriodsEmptyState() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-white/70">
        No periods yet. Create your first life phase to start scheduling
        recurring activities inside it.
      </p>
    </div>
  )
}

/** Responsive grid of period cards. */
export function PeriodsGrid({
  periods,
  onEdit,
  onDelete,
  deletingId,
}: PeriodsGridProps) {
  return (
    <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {periods.map((period) => (
        <PeriodCard
          key={period.id}
          period={period}
          onEdit={onEdit}
          onDelete={onDelete}
          disabled={deletingId === period.id}
        />
      ))}
    </div>
  )
}
