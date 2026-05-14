import {create} from 'zustand';
import { User } from '@/types/User';
import { api } from '@/api/axios';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;

    getUser: () => User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
    /**
     * Silently push the browser's IANA timezone to `/me/timezone` if it
     * differs from the server-stored value. No toasts; failure logs to
     * console and never blocks the app.
     */
    syncDeviceTimezone: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    // Start in a loading state so route guards wait for the first
    // checkAuth() to complete before deciding to redirect.
    isLoading: true,
    isInitialized: false,
    setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    getUser: () => get().user,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => set({ user: null, isAuthenticated: false }),

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/auth/user');
            if (response.data.user) {
                set({ user: response.data.user, isAuthenticated: true });
            } else {
                set({ user: null, isAuthenticated: false });
            }
        } catch {
            // If request fails (401), user is not authenticated
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false, isInitialized: true });
        }
    },

    syncDeviceTimezone: async () => {
        const { user } = get();
        if (!user) return;
        let deviceTz: string | undefined;
        try {
            deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            return;
        }
        if (!deviceTz || user.timezone === deviceTz) return;
        try {
            const response = await api.patch<User>('/me/timezone', {
                timezone: deviceTz,
            });
            const updated = response.data;
            // Merge the fresh timezone (and any other server-derived fields)
            // into the existing user object so other state stays intact.
            set({ user: { ...user, ...updated } });
        } catch (err) {
            // Silent — log and move on so the app isn't blocked.
            console.warn('Failed to sync device timezone', err);
        }
    },
}));
