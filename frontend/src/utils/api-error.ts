/**
 * Best-effort extractor for an error message off an unknown thrown value,
 * with axios-style `error.response.data.{message|error}` precedence.
 *
 * Hoisted from `periods/page.tsx` for reuse in Steps 2/3 of the scheduling build.
 */
export function extractAxiosErrorMessage(
  err: unknown,
  fallback: string
): string {
  if (err && typeof err === 'object') {
    const maybe = err as {
      response?: { data?: { message?: string; error?: string } }
      message?: string
    }
    return (
      maybe.response?.data?.message ??
      maybe.response?.data?.error ??
      maybe.message ??
      fallback
    )
  }
  return fallback
}
