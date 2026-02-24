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
      const access_token = localStorage.getItem('access_token');
      const refresh_token = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');
      
      if (access_token && storedUser) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/validate-token/`, {
            headers: { 
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Try to refresh token
            if (refresh_token) {
              const refreshSuccess = await refreshTokenFunc();
              if (refreshSuccess) {
                const revalidateResponse = await fetch(`${API_BASE_URL}/api/auth/validate-token/`, {
                  headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                });
                
                if (revalidateResponse.ok) {
                  const revalidateData = await revalidateResponse.json();
                  setUser(revalidateData.user);
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
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  // Auto refresh token
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (user) refreshTokenFunc();
    }, 55 * 60 * 1000);
    
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
        if (data.email) throw new Error(data.email[0]);
        if (data.password) throw new Error(data.password[0]);
        if (data.non_field_errors) throw new Error(data.non_field_errors[0]);
        if (data.error) throw new Error(data.error);
        if (data.detail) throw new Error(data.detail);
        throw new Error('Login failed. Please check your credentials.');
      }
      
      // Save tokens & user
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.session_id) {
        localStorage.setItem('session_id', data.session_id);
      }
      
      setUser(data.user);
      
      // ==================== ROLE-BASED REDIRECT ====================
      // Supports BOTH your custom 'system_admin' role AND Django superuser/staff
      if (data.redirect) {
        navigate(data.redirect);
      } 
      else if (
        data.user.is_staff === true || 
        data.user.is_superuser === true || 
        data.user.role === 'system_admin'
      ) {
        navigate('/admin/dashboard');   
      } 
      else {
        navigate('/user/Home');
      }
      // ============================================================

      return { success: true, user: data.user };
      
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');
    
    try {
      if (access_token && refresh_token) {
        await fetch(`${API_BASE_URL}/api/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refresh_token }),
        });
      }
    } catch (error) {
      // Continue anyway
    } finally {
      localStorage.clear();
      setUser(null);
      navigate('/Login');
    }
  };

  const refreshTokenFunc = async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    
    if (!refresh_token) {
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
        body: JSON.stringify({ refresh_token: refresh_token }),
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
      return false;
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
    refreshToken: refreshTokenFunc,
    getAuthHeaders,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};