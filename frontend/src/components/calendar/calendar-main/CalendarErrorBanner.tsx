'use client'

interface CalendarErrorBannerProps {
  onRetry: () => void
}

/**
 * Banner shown when Google Calendar failed but fallback sample data is shown.
 */
export function CalendarErrorBanner({ onRetry }: CalendarErrorBannerProps) {
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
