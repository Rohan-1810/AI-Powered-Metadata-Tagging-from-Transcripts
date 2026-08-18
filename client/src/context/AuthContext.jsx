import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('metamind_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('metamind_token');
      const savedUser = localStorage.getItem('metamind_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('metamind_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out...');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('metamind_token', receivedToken);
      localStorage.setItem('metamind_user', JSON.stringify(receivedUser));
      
      toast.success(`Welcome back, ${receivedUser.name}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('metamind_token', receivedToken);
      localStorage.setItem('metamind_user', JSON.stringify(receivedUser));
      
      toast.success(`Account created successfully! Welcome, ${receivedUser.name}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('metamind_token');
    localStorage.removeItem('metamind_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
