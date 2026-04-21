import {create} from 'zustand';
import { User } from '@/types/User';
import { api } from '@/api/axios';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;

    getUser: () => User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
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
            }
        } catch (error) {
            // If request fails (401), user is not authenticated
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false });
        }
    },
}));