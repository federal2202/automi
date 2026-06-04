"use client"

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { Loader } from '@/components/shared/Loader'

interface EventFormActionsProps {
  mode: 'create' | 'edit'
  isLoading: boolean
  onCancel: () => void
  onDelete: () => void
}

/**
 * EventFormActions — footer with delete / cancel / submit buttons.
 */
export function EventFormActions({
  mode,
  isLoading,
  onCancel,
  onDelete,
}: EventFormActionsProps) {
  return (
    <div className="flex justify-between pt-6 border-t border-[#ffffff]/10">
      {mode === 'edit' && (
        <Button
          type="button"
          variant="gradient-destructive"
          size="lg"
          onClick={onDelete}
          disabled={isLoading}
        >
          Delete
        </Button>
      )}
      <div className={cn('flex space-x-2', mode === 'create' && 'ml-auto')}>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onCancel}
          disabled={isLoading}
          className="text-[#ffffff]/70 hover:text-white hover:bg-white/5"
        >
          Cancel
        </Button>
        <Button type="submit" variant="gradient" size="lg" disabled={isLoading}>
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader size="sm" hideOrbit />
              Saving...
            </span>
          ) : mode === 'create' ? (
            'Create Event'
          ) : (
            'Update Event'
          )}
        </Button>
      </div>
    </div>
  )
}
