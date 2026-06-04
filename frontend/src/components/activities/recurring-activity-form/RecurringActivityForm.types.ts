import type {
  CreateActivityInput,
  RecurringActivity,
} from '@/types/activity'

export interface RecurringActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialActivity?: RecurringActivity | null
  onSubmit: (input: CreateActivityInput) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage?: string | null
}

export interface RecurringActivityFormBodyProps {
  initialActivity: RecurringActivity | null
  onCancel: () => void
  onSubmit: (input: CreateActivityInput) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage: string | null
}
