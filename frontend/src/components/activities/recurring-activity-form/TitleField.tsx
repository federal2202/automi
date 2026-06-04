import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TitleFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  hasError: boolean
  errorRegionId: string
}

export function TitleField({
  value,
  onChange,
  disabled,
  hasError,
  errorRegionId,
}: TitleFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor="activity-title"
        className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
      >
        Title
      </Label>
      <Input
        id="activity-title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Morning gym"
        autoFocus
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorRegionId : undefined}
        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
      />
    </div>
  )
}
