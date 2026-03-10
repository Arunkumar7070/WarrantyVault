import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  return { token, user, isAuthenticated: Boolean(token && user), logout: clearSession };
}
