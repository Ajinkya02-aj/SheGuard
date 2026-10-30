import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sheguard_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authApi.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Failed to load user profile with token:', err.message);
          localStorage.removeItem('sheguard_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('sheguard_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    localStorage.setItem('sheguard_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('sheguard_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await authApi.updateProfile(profileData);
    setUser(res.user);
    return res;
  };

  const toggleDemoMode = async () => {
    if (!user) return;
    const nextMode = !user.demoMode;
    const res = await authApi.updateProfile({ demoMode: nextMode });
    setUser(res.user);
    return res;
  };

  // Quick One-Click Demo Mode Sign-in for immediate evaluation
  const loginDemoAccount = async () => {
    try {
      const demoEmail = 'demo.sheguard@example.com';
      const demoPass = 'SheGuardDemo2026!';
      try {
        return await login(demoEmail, demoPass);
      } catch (loginErr) {
        // If not registered yet, create demo account
        return await register({
          name: 'Priya Sharma (Demo)',
          email: demoEmail,
          phone: '+91 98765 00000',
          password: demoPass,
          bloodGroup: 'O+',
          medicalNotes: 'No known drug allergies. Asthmatic (inhaler in handbag).',
          demoMode: true,
        });
      }
    } catch (err) {
      console.error('Failed to login demo account:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        updateProfile,
        toggleDemoMode,
        loginDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
