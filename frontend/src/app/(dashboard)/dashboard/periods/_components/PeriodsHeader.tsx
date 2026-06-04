"use client"

import { Plus } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PeriodsHeaderProps {
  onCreate: () => void
}

/** Page title block + "Create Period" action for the periods list page. */
export function PeriodsHeader({ onCreate }: PeriodsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl lg:text-[48px] font-bold text-text-primary tracking-[-2.4px] uppercase leading-tight font-space-grotesk">
            PERIODS
          </h1>
          <p className="text-[10px] md:text-[11px] text-text-muted tracking-[1.1px] uppercase font-jakarta">
            LIFE PHASES // BOUNDARIES FOR RECURRING ACTIVITIES
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className={cn(
            'inline-flex items-center justify-center gap-2 self-start lg:self-auto',
            'rounded-lg bg-green-dark px-4 py-2.5 text-sm font-bold text-white',
            'hover:bg-green-dark/90 active:scale-[0.98] transition-all',
            'font-space-grotesk uppercase tracking-wide'
          )}
        >
          <Plus className="h-4 w-4" />
          Create Period
        </button>
      </div>
    </div>
  )
}
