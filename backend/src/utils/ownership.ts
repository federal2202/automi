/**
 * Ownership helpers. Use these to look up a record while enforcing that it
 * belongs to a specific user. Designed to be reused across resources
 * (Period, RecurringActivity, ActivityException, ...) so we don't sprinkle
 * the same `findFirst({ where: { id, userId } })` pattern everywhere.
 *
 * `Delegate` is intentionally typed as the minimum shape we need from a
 * Prisma model delegate (a `findFirst` method). This keeps the helper
 * generic without resorting to `any`.
 */

export interface OwnershipDelegate<TRecord> {
  findFirst(args: {
    where: { id: string; userId: string };
  }): Promise<TRecord | null>;
}

/**
 * Returns the record if it exists AND belongs to `userId`, otherwise `null`.
 * Callers decide how to respond (typically 404).
 */
export const assertOwnership = async <TRecord>(
  delegate: OwnershipDelegate<TRecord>,
  id: string,
  userId: string,
): Promise<TRecord | null> => {
  return delegate.findFirst({ where: { id, userId } });
};
