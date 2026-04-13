/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;
const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // FIX: extracted as useCallback so it never gets shadowed and is stable
  const doLogout = useCallback(async (redirect = true) => {
    const accessToken = localStorage.getItem('access_token');
    const storedRefresh = localStorage.getItem('refresh_token');
    try {
      if (accessToken && storedRefresh) {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: storedRefresh }),
        });
      }
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      // FIX: only clear auth keys, not all localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('session_id');
      localStorage.removeItem('user');
      setUser(null);
      if (redirect) navigate('/Login');
    }
  }, [navigate]);

  // FIX: renamed to doRefreshToken — no more shadowing
  const doRefreshToken = useCallback(async () => {
    const storedRefresh = localStorage.getItem('refresh_token');
    if (!storedRefresh) {
      await doLogout();
      return false;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ refresh_token: storedRefresh }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
        return true;
      } else {
        await doLogout();
        return false;
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      await doLogout();
      return false;
    }
  }, [doLogout]);

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const storedRefresh = localStorage.getItem('refresh_token');

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/validate-token/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else if (response.status === 401 && storedRefresh) {
          // FIX: calls the named function, not a shadowed variable
          const refreshed = await doRefreshToken();
          if (refreshed) {
            // Re-validate after refresh
            const retryRes = await fetch(`${API_BASE_URL}/auth/validate-token/`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
              },
            });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              setUser(retryData.user);
            } else {
              await doLogout(false);
            }
          }
        } else {
          await doLogout(false);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        await doLogout(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // FIX: auto-refresh only starts when user is confirmed logged in
  useEffect(() => {
    if (!user) return;
    const refreshInterval = setInterval(() => {
      doRefreshToken();
    }, 55 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [user, doRefreshToken]);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.email) throw new Error(data.email[0]);
        if (data.password) throw new Error(data.password[0]);
        if (data.non_field_errors) throw new Error(data.non_field_errors[0]);
        if (data.error) throw new Error(data.error);
        if (data.detail) throw new Error(data.detail);
        throw new Error('Login failed. Please check your credentials.');
      }

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.session_id) localStorage.setItem('session_id', data.session_id);

      setUser(data.user);

      if (data.redirect) {
        navigate(data.redirect);
      } else {
        navigate(data.user.role === 'system_admin' ? '/admin/dashboard' : '/user/Home');
      }

      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout: doLogout,
    refreshToken: doRefreshToken,
    getAuthHeaders,
    updateUser: setUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};