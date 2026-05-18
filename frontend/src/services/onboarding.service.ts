import { api } from '@/api/axios'
import { User } from '@/types/User'

/**
 * Mark the currently authenticated user as having finished onboarding.
 *
 * Endpoint is idempotent — calling it twice is safe. The returned User
 * carries the fresh `onboardingCompletedAt` ISO timestamp, which the
 * caller should merge into the auth store so the dashboard guard stops
 * bouncing the user back to `/onboarding`.
 */
export const completeOnboarding = async (): Promise<User> => {
  const response = await api.post<User>('/me/onboarding/complete')
  return response.data
}
