import { EventType } from '@/types/calendar/calendar.types'

/**
 * Event-type styling — exact Tailwind classes from the current implementation.
 */
export const EVENT_STYLES: Record<EventType, {
  container: string
  title: string
  time: string
  description: string
}> = {
  primary: {
    container: 'bg-[rgba(6,78,59,0.1)] border-l-4 border-[#065f46] text-[#059669]',
    title: 'text-sm font-bold text-[#e5e2e1] font-[\'Plus_Jakarta_Sans\']',
    time: 'text-[10px] font-bold tracking-wide uppercase text-[#059669]',
    description: 'text-xs font-normal text-[#6b7280] font-[\'Plus_Jakarta_Sans\'] leading-relaxed'
  },
  secondary: {
    container: 'bg-[rgba(111,0,190,0.1)] border-l-4 border-[#ddb7ff] text-[#ddb7ff]',
    title: 'text-sm font-bold text-[#e5e2e1] font-[\'Plus_Jakarta_Sans\']',
    time: 'text-[10px] font-bold tracking-wide uppercase text-[#059669]',
    description: 'text-xs font-normal text-[#6b7280] font-[\'Plus_Jakarta_Sans\'] leading-relaxed'
  },
  critical: {
    container: 'bg-[rgba(6,78,59,0.6)] border border-[rgba(6,95,70,0.3)] text-[#a7f3d0]',
    title: 'text-sm font-bold text-[#e5e2e1] font-[\'Plus_Jakarta_Sans\'] uppercase text-[#ecfdf5] font-extrabold',
    time: 'text-[10px] font-bold tracking-wide uppercase text-[#059669]',
    description: 'text-xs font-normal text-[#6b7280] font-[\'Plus_Jakarta_Sans\'] leading-relaxed text-[#ecfdf5] font-medium italic opacity-80'
  },
  inactive: {
    container: 'bg-[#1c1b1b] border border-[rgba(59,75,53,0.15)] text-[#6b7280] opacity-60',
    title: 'text-sm font-bold text-[#e5e2e1] font-[\'Plus_Jakarta_Sans\'] text-[rgba(229,226,225,0.6)]',
    time: 'text-[10px] font-bold tracking-wide uppercase text-[#059669]',
    description: 'text-xs font-normal text-[#6b7280] font-[\'Plus_Jakarta_Sans\'] leading-relaxed'
  }
} as const
