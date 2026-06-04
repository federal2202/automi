import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface CardActionsProps {
  title: string
  onEdit: () => void
  onDelete: () => void
  disabled?: boolean
}

export function CardActions({
  title,
  onEdit,
  onDelete,
  disabled,
}: CardActionsProps) {
  return (
    <div className="flex justify-end gap-2 shrink-0">
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        aria-label={`Edit ${title}`}
        className={cn(
          'flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[1.1px] text-white/80 transition-colors',
          'hover:bg-white/15',
          'font-jakarta',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        aria-label={`Delete ${title}`}
        className={cn(
          'flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[1.1px] text-red-200 transition-colors',
          'hover:bg-red-500/25',
          'font-jakarta',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </button>
    </div>
  )
}
