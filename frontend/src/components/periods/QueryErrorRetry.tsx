"use client"

import { cn } from '@/utils/cn'
import { extractAxiosErrorMessage } from '@/utils/api-error'

interface QueryErrorRetryProps {
  /** Leading sentence, e.g. "Failed to load periods." */
  message: string
  error: unknown
  isFetching: boolean
  onRetry: () => void
  /** Busy label on the retry button. Defaults to ASCII "Retrying...". */
  retryingLabel?: string
}

/**
 * Inline "failed to load + retry" block shared by the periods list and detail
 * pages. Preserves the exact copy, error-message extraction and disabled/retry
 * label behavior the pages had inline.
 */
export function QueryErrorRetry({
  message,
  error,
  isFetching,
  onRetry,
  retryingLabel = 'Retrying...',
}: QueryErrorRetryProps) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-red-400">
        {message} {extractAxiosErrorMessage(error, 'Please try again.')}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isFetching}
        className={cn(
          'rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80',
          'hover:bg-white/10 transition-colors',
          'font-space-grotesk uppercase tracking-wide',
          isFetching && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isFetching ? retryingLabel : 'Retry'}
      </button>
    </div>
  )
}
