"use client"

import { cn } from '@/utils/cn'

interface WelcomeStepProps {
  onNext: () => void
  onSkip: () => void
}

/**
 * Step 1: explainer screen. Two short blurbs introducing the two core
 * concepts (Periods and Activities) with examples the user dictated in
 * the spec. No data is collected here — purely a CTA into step 2.
 */
export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
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

      <section className="flex flex-col gap-5">
        <Concept
          label="Periods"
          body="A period is a life phase with a start and end date — like 'Fall Semester' or 'Q2 Sprint'. It's the container that everything recurring lives inside."
        />
        <Concept
          label="Activities"
          body="An activity is a recurring rule scoped to a period — like 'Gym Mon/Wed 18:00' or 'Standup weekdays 09:30'. We fan it out across the period and push the events to your Google Calendar."
        />
      </section>

      <footer className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onSkip}
          className={cn(
            'text-sm text-white/50 hover:text-white/80 transition-colors',
            'font-jakarta underline-offset-4 hover:underline self-center sm:self-auto'
          )}
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={onNext}
          className={cn(
            'rounded-lg bg-green-nice px-5 py-2.5 text-sm font-bold text-white',
            'hover:bg-green-nice/90 transition-colors',
            'font-space-grotesk uppercase tracking-wide'
          )}
        >
          Get started
        </button>
      </footer>
    </div>
  )
}

function Concept({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-[1.1px] text-green-nice font-space-grotesk font-bold">
        {label}
      </span>
      <p className="text-sm sm:text-[15px] leading-relaxed text-white/80 font-jakarta">
        {body}
      </p>
    </div>
  )
}
