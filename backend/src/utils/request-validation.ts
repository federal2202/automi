/**
 * Shared request-validation helpers used across controllers.
 *
 * Keep these small, dependency-free, and behavior-preserving — controllers
 * own their HTTP shaping, these utilities just produce primitive results.
 */

/**
 * Returns the list of keys present in `body` that are not in `allowed`.
 * An empty array means the body is OK.
 *
 * Callers compose the 400 response themselves so the error format stays
 * consistent across controllers, e.g.:
 *
 *   const unknown = rejectUnknownKeys(body, ALLOWED_KEYS);
 *   if (unknown.length > 0) {
 *     res.status(400).json({
 *       error: `Unknown fields: ${unknown.join(", ")}. Allowed: ${ALLOWED_KEYS.join(", ")}`,
 *     });
 *     return;
 *   }
 */
export function rejectUnknownKeys(
  body: Record<string, unknown>,
  allowed: readonly string[],
): string[] {
  const allowedSet = new Set<string>(allowed);
  return Object.keys(body).filter((k) => !allowedSet.has(k));
}

/**
 * Narrows `req.params.x` (typed as `string | undefined` under stricter
 * Express typings) to a guaranteed string. Throws if missing — which under
 * Express's matched-route guarantee should never happen, so this is purely
 * a typing aid that also catches programmer error (wrong param name in route).
 */
export function requireParam(value: string | undefined, name: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required route param: ${name}`);
  }
  return value;
}
