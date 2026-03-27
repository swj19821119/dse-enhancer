import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  nickname: string;
  avatarUrl?: string;
  isVip: boolean;
  currentLevel?: number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isGuest: boolean;
  guestId: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setGuest: (isGuest: boolean, guestId?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isGuest: false,
      guestId: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ isLoading: loading }),
      setGuest: (isGuest, guestId) => set({ isGuest, guestId: guestId || null }),
      logout: () => set({ user: null, token: null, isGuest: false, guestId: null }),
    }),
    {
      name: 'dse-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isGuest: state.isGuest,
        guestId: state.guestId,
      }),
    }
  )
);
