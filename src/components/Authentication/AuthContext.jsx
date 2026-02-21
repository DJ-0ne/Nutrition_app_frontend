/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
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

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');
      
      if (accessToken && storedUser) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/validate-token/`, {
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Try to refresh token
            if (refreshToken) {
              const refreshSuccess = await refreshToken();
              if (!refreshSuccess) {
                logout();
              }
            } else {
              logout();
            }
          }
        } catch (err) {

          logout();
          return err;
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  // Auto refresh token
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (user) refreshToken();
    }, 55 * 60 * 1000); // Refresh every 55 minutes
    
    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = async (email, password) => {
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error messages
        if (data.email) throw new Error(data.email[0]);
        if (data.password) throw new Error(data.password[0]);
        if (data.non_field_errors) throw new Error(data.non_field_errors[0]);
        if (data.error) throw new Error(data.error);
        if (data.detail) throw new Error(data.detail);
        throw new Error('Login failed. Please check your credentials.');
      }
      
      // Save tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.session_id) {
        localStorage.setItem('session_id', data.session_id);
      }
      
      setUser(data.user);
      
      // Role-based redirect
      if (data.redirect) {
        navigate(data.redirect);
      } 
      else {
        // Default redirect based on role
        if (data.user.role === 'system_admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/Home');
        }
      }
      
      return { success: true, user: data.user };
      
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      if (accessToken && refreshToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      return error;
    } finally {
      // Clear everything regardless of API response
      localStorage.clear();
      setUser(null);
      navigate('/Login');
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      logout();
      return false;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        if (data.refresh) {
          localStorage.setItem('refresh_token', data.refresh);
        }
        return true;
      } else {
        logout();
        return false;
      }
    } catch (err) {
      
      logout();
      return { success: false, error: err };
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken,
    getAuthHeaders,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};