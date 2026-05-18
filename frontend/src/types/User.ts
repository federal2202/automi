export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    /** IANA timezone string, e.g. "Europe/Warsaw". Server-authoritative. */
    timezone?: string;
    /** ISO timestamp the user finished (or skipped) onboarding. Null until
     *  they explicitly Skip or Finish the wizard. Server-authoritative. */
    onboardingCompletedAt?: string | null;
}
