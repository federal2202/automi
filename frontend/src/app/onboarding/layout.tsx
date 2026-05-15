import { Toaster } from 'sonner'

/**
 * Minimal onboarding layout — no sidebar, no top nav. The root layout
 * already sets up fonts, auth init, and React Query, so we just paint a
 * full-bleed dark background here and ship a dedicated `<Toaster>` so error
 * toasts from period/activity submits surface to the user (the dashboard
 * Toaster is scoped to /(dashboard) only).
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full bg-bg-surface text-white">
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        richColors
        closeButton
      />
    </div>
  )
}
