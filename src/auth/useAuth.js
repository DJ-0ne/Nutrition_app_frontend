// src/auth/useAuth.js
import { useAuthContext } from '@/components/Authentication/AuthContext';

export const useAuth = () => {
  const context = useAuthContext();

  return {
    token: localStorage.getItem('access_token'),
    user: context.user,                    // ← REAL user object (with is_staff, role, etc.)
    apiBaseURL: import.meta.env.VITE_API_URL || process.env.VITE_API_URL,
    isAuthenticated: context.isAuthenticated,
    logout: context.logout,
  };
};