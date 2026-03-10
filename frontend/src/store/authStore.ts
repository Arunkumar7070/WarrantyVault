import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UserProfile } from "@/types";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  setSession: (token: string, user: UserProfile) => void;
  setUser: (user: UserProfile) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    { name: "warrantyvault-auth" },
  ),
);
