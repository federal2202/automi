import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SharedTimeFieldsProps {
  sharedStart: string
  sharedEnd: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  disabled?: boolean
  hasError: boolean
  errorRegionId: string
}

export function SharedTimeFields({
  sharedStart,
  sharedEnd,
  onStartChange,
  onEndChange,
  disabled,
  hasError,
  errorRegionId,
}: SharedTimeFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="activity-start"
          className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
        >
          Start Time
        </Label>
        <Input
          id="activity-start"
          type="time"
          value={sharedStart}
          max={sharedEnd || undefined}
          onChange={(e) => onStartChange(e.target.value)}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorRegionId : undefined}
          className="bg-white/5 border-white/10 text-white"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="activity-end"
          className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
        >
          End Time
        </Label>
        <Input
          id="activity-end"
          type="time"
          value={sharedEnd}
          min={sharedStart || undefined}
          onChange={(e) => onEndChange(e.target.value)}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorRegionId : undefined}
          className="bg-white/5 border-white/10 text-white"
        />
      </div>
    </div>
  )
}
