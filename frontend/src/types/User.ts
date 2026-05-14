export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    /** IANA timezone string, e.g. "Europe/Warsaw". Server-authoritative. */
    timezone?: string;
}
