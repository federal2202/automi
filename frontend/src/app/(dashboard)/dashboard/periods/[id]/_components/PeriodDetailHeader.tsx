"use client"

import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { Period } from '@/types/period'
import { cn } from '@/utils/cn'
import { formatPeriodRange } from '@/utils/period-dates'
import { QueryErrorRetry } from '@/components/periods/QueryErrorRetry'

interface PeriodDetailHeaderProps {
  period: Period | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
  isFetching: boolean
  onRetry: () => void
  onAddActivity: () => void
}

/** Back link + period title/range + "Add Activity" action for the detail page. */
export function PeriodDetailHeader({
  period,
  isLoading,
  isError,
  error,
  isFetching,
  onRetry,
  onAddActivity,
}: PeriodDetailHeaderProps) {
  return (
    <>
      <Link
        href="/dashboard/periods"
        className={cn(
          'inline-flex items-center gap-1.5 self-start mb-4 rounded-md px-2 py-1 text-[11px] uppercase tracking-[1.1px] text-text-muted',
          'font-jakarta hover:text-white hover:bg-white/5 transition-colors'
        )}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to periods
      </Link>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex flex-col min-w-0">
            {isLoading && (
              <p className="text-white/70 font-jakarta">Loading period…</p>
            )}
            {isError && (
              <QueryErrorRetry
                message="Failed to load period."
                error={error}
                isFetching={isFetching}
                onRetry={onRetry}
                retryingLabel="Retrying…"
              />
            )}
            {period && (
              <>
                <h1 className="text-2xl md:text-3xl lg:text-[48px] font-bold text-text-primary tracking-[-2.4px] uppercase leading-tight font-space-grotesk line-clamp-2">
                  {period.title}
                </h1>
                <p className="text-[10px] md:text-[11px] text-text-muted tracking-[1.1px] uppercase font-jakarta">
                  {formatPeriodRange(period.startDate, period.endDate)}
                </p>
              </>
            )}
          </div>

          {period && (
            <button
              type="button"
              onClick={onAddActivity}
              className={cn(
                'inline-flex items-center justify-center gap-2 self-start lg:self-auto',
                'rounded-lg border border-green-nice/40 bg-green-nice/15 px-4 py-2.5 text-sm font-bold text-green-200',
                'hover:bg-green-nice/25 active:scale-[0.98] transition-all',
                'font-space-grotesk uppercase tracking-wide'
              )}
            >
              <Plus className="h-4 w-4" />
              Add Activity
            </button>
          )}
        </div>
      </div>
    </>
  )
}
