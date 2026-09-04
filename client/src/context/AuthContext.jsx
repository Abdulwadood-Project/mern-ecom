import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('shophub_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authApi.getCurrentUser();
        setCurrentUser(data.data.user);
      } catch {
        localStorage.removeItem('shophub_token');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const handleAuthSuccess = (payload) => {
    localStorage.setItem('shophub_token', payload.token);
    setCurrentUser(payload.user);
    return payload.user;
  };

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    return handleAuthSuccess(data.data);
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    return handleAuthSuccess(data.data);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // clear local session even if API call fails
    }
    localStorage.removeItem('shophub_token');
    setCurrentUser(null);
  };

  const refreshUser = async () => {
    const { data } = await authApi.getCurrentUser();
    setCurrentUser(data.data.user);
    return data.data.user;
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated: Boolean(currentUser),
    isAdmin: currentUser?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
