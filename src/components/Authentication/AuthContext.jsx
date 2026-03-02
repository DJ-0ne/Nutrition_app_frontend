/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ========== Helper functions ==========
  const logout = useCallback(async () => {
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');

    try {
      if (access_token && refresh_token) {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token }),
        });
      }
    } catch (err) {
      // ignore
    } finally {
      localStorage.clear();
      flushSync(() => {
        setUser(null);
      });
      navigate('/Login', { replace: true });
    }
  }, [navigate]);

  const refreshTokenFunc = useCallback(async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
      logout();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
        return true;
      } else {
        logout();
        return false;
      }
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const access_token = localStorage.getItem('access_token');
      const refresh_token = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');

      if (access_token && storedUser) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/validate-token/`, {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            if (refresh_token) {
              const refreshed = await refreshTokenFunc();
              if (refreshed) {
                const newToken = localStorage.getItem('access_token');
                const revalidate = await fetch(`${API_BASE_URL}/auth/validate-token/`, {
                  headers: { Authorization: `Bearer ${newToken}` },
                });
                if (revalidate.ok) {
                  const data = await revalidate.json();
                  setUser(data.user);
                } else {
                  logout();
                }
              } else {
                logout();
              }
            } else {
              logout();
            }
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [logout, refreshTokenFunc]);

  // Auto refresh token every 55 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) refreshTokenFunc();
    }, 55 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, refreshTokenFunc]);

  const login = useCallback(
    async (email, password) => {
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.email) throw new Error(data.email[0]);
          if (data.password) throw new Error(data.password[0]);
          if (data.non_field_errors) throw new Error(data.non_field_errors[0]);
          if (data.error) throw new Error(data.error);
          if (data.detail) throw new Error(data.detail);
          throw new Error('Login failed');
        }

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        // Role-based redirect
        if (data.redirect) {
          navigate(data.redirect);
        } else if (data.user.is_staff || data.user.is_superuser || data.user.role === 'system_admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/Home');
        }

        return { success: true, user: data.user };
      } catch (err) {
        const msg = err.message || 'Login failed';
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [navigate]
  );

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, []);

  // ✅ Memoized updateUser – crucial to prevent infinite loops
  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken: refreshTokenFunc,
    getAuthHeaders,
    isAuthenticated: !!user,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};