"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Period } from '@/types/period'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { setUser } from '@/stores/authSlice'
import { completeOnboarding } from '@/services/onboarding.service'

export type StepIndex = 0 | 1 | 2

/**
 * Drives the three-step wizard: which screen is visible (no URL change — the
 * wizard lives at a single `/onboarding` route so back/forward feel instant),
 * the stashed period from step 2, and completion.
 *
 * The global Skip and a successful Finish are the only paths that flip the
 * server-side `onboardingCompletedAt` flag (via Redux `setUser` + the
 * onboarding service). Closing the tab mid-wizard leaves the user
 * un-onboarded and the guard routes them back here on next visit.
 */
export function useOnboardingNavigation() {
  const router = useRouter()
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()

  const [step, setStep] = useState<StepIndex>(0)
  const [createdPeriod, setCreatedPeriod] = useState<Period | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)

  /**
   * Mark onboarding complete on the server, optimistically update the local
   * auth store so the dashboard guard doesn't bounce the user back mid-nav,
   * then route to the calendar. Failure is surfaced via toast but never traps.
   *
   * `celebrate` controls whether the calendar plays its first-arrival stagger
   * animation: true only for a real Finish, false for Skip.
   */
  const exitToDashboard = async (celebrate: boolean) => {
    if (isCompleting) return
    setIsCompleting(true)
    // Optimistic flip — the guard re-evaluates synchronously off this.
    if (user) {
      dispatch(
        setUser({
          ...user,
          onboardingCompletedAt:
            user.onboardingCompletedAt ?? new Date().toISOString(),
        })
      )
    }
    try {
      const updated = await completeOnboarding()
      dispatch(setUser({ ...(user ?? {}), ...updated }))
    } catch (err) {
      console.warn('Failed to mark onboarding complete', err)
      toast.error('Could not save onboarding status. You can revisit later.')
    } finally {
      if (celebrate) {
        try {
          sessionStorage.setItem('justOnboarded', '1')
        } catch {
          // sessionStorage can throw in some privacy modes — animation
          // is a nice-to-have, not critical.
        }
      }
      router.replace('/dashboard/calendar')
    }
  }

  return {
    step,
    setStep,
    createdPeriod,
    setCreatedPeriod,
    isCompleting,
    finishAndExit: () => exitToDashboard(true),
    skipAndExit: () => exitToDashboard(false),
  }
}
