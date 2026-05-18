"use client"

import { Calendar, Repeat } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface WelcomeStepProps {
  onNext: () => void
}

/**
 * Step 1: explainer screen. Two short blurbs introducing the two core
 * concepts (Periods and Activities) with examples the user dictated in
 * the spec. No data is collected here — purely a CTA into step 2.
 *
 * Skip is now a global affordance in the wizard chrome (see
 * `OnboardingWizard`), so there is no per-step skip button.
 */
export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-space-grotesk text-3xl sm:text-4xl tracking-[-1.5px] uppercase leading-tight">
          Welcome
        </h1>
        <p className="text-[11px] uppercase tracking-[1.1px] text-text-muted font-jakarta">
          Let&apos;s set up your schedule // two concepts
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <Concept
          icon={Calendar}
          label="Periods"
          body="A period is a life phase with a start and end date — like 'Fall Semester' or 'Q2 Sprint'. It's the container that everything recurring lives inside."
        />
        <Concept
          icon={Repeat}
          label="Activities"
          body="An activity is a recurring rule scoped to a period — like 'Gym Mon/Wed 18:00' or 'Standup weekdays 09:30'. We fan it out across the period and push the events to your Google Calendar."
        />
      </section>

      <footer className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className={cn(
            'h-10 rounded-lg bg-green-nice px-5 text-sm font-bold text-white',
            'hover:bg-green-nice/90 transition-colors',
            'font-space-grotesk uppercase tracking-wide',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-nice/60'
          )}
        >
          Get started
        </button>
      </footer>
    </div>
  )
}

function Concept({
  icon: Icon,
  label,
  body,
}: {
  icon: LucideIcon
  label: string
  body: string
}) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center',
          'rounded-lg bg-green-nice/15 border border-green-nice/30 text-green-nice'
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-[1.1px] text-green-nice font-space-grotesk font-bold">
          {label}
        </span>
        <p className="text-sm sm:text-[15px] leading-relaxed text-white/80 font-jakarta">
          {body}
        </p>
      </div>
    </div>
  )
}
