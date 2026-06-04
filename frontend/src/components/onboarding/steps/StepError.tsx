"use client"

import { cn } from '@/utils/cn'

interface StepErrorProps {
  id: string
  /** Validation or submit error text; null/empty hides the region (sr-only). */
  errorText: string | null
}

/**
 * Shared live error region for the wizard's data-collecting steps. Reserves
 * vertical space when visible and stays in the a11y tree (sr-only) when empty.
 */
export function StepError({ id, errorText }: StepErrorProps) {
  const hasError = Boolean(errorText)
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        'text-sm text-red-400 min-h-[1.25rem]',
        !hasError && 'sr-only'
      )}
    >
      {errorText ?? ''}
    </p>
  )
}
