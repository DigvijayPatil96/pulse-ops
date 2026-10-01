import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hospital_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hospital_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('hospital_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('[Auth] Token verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('hospital_token', newToken);
    localStorage.setItem('hospital_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('hospital_token', newToken);
    localStorage.setItem('hospital_user', JSON.stringify(userData));
    return userData;
  };

  const quickLogin = async (role = 'doctor') => {
    const credentials =
      role === 'doctor'
        ? { email: 'dr.chen@hospital.org', password: 'password123' }
        : { email: 'nurse.elena@hospital.org', password: 'password123' };

    return await login(credentials.email, credentials.password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        register,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
