'use client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface CalendarErrorBannerProps {
  onRetry: () => void
  /** True when the error is REAUTH_REQUIRED — retrying can't fix a revoked/insufficient Google grant. */
  reauthRequired?: boolean
}

/**
 * Banner shown when Google Calendar failed but fallback sample data is shown.
 */
export function CalendarErrorBanner({ onRetry, reauthRequired }: CalendarErrorBannerProps) {
  if (reauthRequired) {
    return (
      <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg">
        <p className="text-sm text-yellow-200">
          Your Google Calendar access needs to be reconnected. Showing sample data.
          <a
            href={`${API_URL}/auth/google`}
            className="ml-2 underline hover:no-underline"
          >
            Reconnect Google Calendar
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg">
      <p className="text-sm text-yellow-200">
        Unable to connect to Google Calendar. Showing sample data.
        <button onClick={onRetry} className="ml-2 underline hover:no-underline">
          Retry
        </button>
      </p>
    </div>
  )
}
