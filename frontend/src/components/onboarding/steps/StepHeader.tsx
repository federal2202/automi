"use client"

import type { ReactNode } from 'react'

interface StepHeaderProps {
  title: string
  /** Eyebrow subtitle below the title (supports inline markup). */
  subtitle: ReactNode
}

/** Shared title + eyebrow header used by the data-collecting wizard steps. */
export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="font-space-grotesk text-3xl sm:text-4xl tracking-[-1.5px] uppercase leading-tight">
        {title}
      </h1>
      <p className="text-[11px] uppercase tracking-[1.1px] text-text-muted font-jakarta">
        {subtitle}
      </p>
    </header>
  )
}
