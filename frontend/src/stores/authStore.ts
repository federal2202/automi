import {create} from 'zustand';
import { User } from '@/types/User';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;

    getUser: () => User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    getUser: () => get().user,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
}));