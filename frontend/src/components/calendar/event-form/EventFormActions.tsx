"use client"

import { cn } from '@/utils/cn'

interface EventFormActionsProps {
  mode: 'create' | 'edit'
  isLoading: boolean
  onCancel: () => void
  onDelete: () => void
}

/**
 * EventFormActions — footer with delete / cancel / submit buttons,
 * styled to match the period delete modal (ConfirmDeleteFooter).
 */
export function EventFormActions({
  mode,
  isLoading,
  onCancel,
  onDelete,
}: EventFormActionsProps) {
  return (
    <div className="flex justify-between pt-6 border-t border-white/10">
      {mode === 'edit' && (
        <button
          type="button"
          onClick={onDelete}
          disabled={isLoading}
          className={cn(
            'rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-bold text-red-200',
            'hover:bg-red-500/25 transition-colors',
            'font-space-grotesk uppercase tracking-wide',
            isLoading && 'opacity-60 cursor-not-allowed'
          )}
        >
          Delete
        </button>
      )}
      <div className={cn('flex gap-2', mode === 'create' && 'ml-auto')}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            'rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80',
            'hover:bg-white/10 transition-colors',
            'font-space-grotesk uppercase tracking-wide',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'rounded-lg border border-green-nice/40 bg-green-nice/15 px-4 py-2 text-sm font-bold text-green-200',
            'hover:bg-green-nice/25 transition-colors',
            'font-space-grotesk uppercase tracking-wide',
            isLoading && 'opacity-60 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-3.5 w-3.5 rounded-full border-2 border-green-200/40 border-t-green-200 animate-spin"
              />
              Saving...
            </span>
          ) : mode === 'create' ? (
            'Create Event'
          ) : (
            'Update Event'
          )}
        </button>
      </div>
    </div>
  )
}
