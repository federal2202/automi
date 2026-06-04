import { cn } from '@/utils/cn'

interface FormErrorProps {
  errorRegionId: string
  errorText: string | null
  hasError: boolean
}

export function FormError({ errorRegionId, errorText, hasError }: FormErrorProps) {
  return (
    <p
      id={errorRegionId}
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
