import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
})

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<unknown> | null = null;

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as RetriableConfig | undefined;

        if (!original || error.response?.status !== 401 || original._retry) {
            return Promise.reject(error);
        }

        if (original.url?.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        // reauth_required means the user's Google grant is gone (revoked
        // access, insufficient scopes) — our own JWT is fine, so refreshing
        // it here would just waste a round trip and hit the same error again.
        // Let it propagate straight to the caller (services/calendar/errors.ts
        // maps it to a distinct REAUTH_REQUIRED type).
        const data = error.response?.data as { error?: string } | undefined;
        if (data?.error === 'reauth_required') {
            return Promise.reject(error);
        }

        original._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = api.post('/auth/refresh').finally(() => {
                    refreshPromise = null;
                });
            }
            await refreshPromise;
            return api(original);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    }
);
