import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  token: string | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, email: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('mindtrace_token'));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    if (!token) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const p = await api.getProfile();
      setProfile(p);
    } catch (e) {
      console.error('Failed to fetch user profile', e);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [token]);

  const login = async (newToken: string, email: string) => {
    localStorage.setItem('mindtrace_token', newToken);
    setToken(newToken);
    await refreshProfile();
  };

  const logout = () => {
    localStorage.removeItem('mindtrace_token');
    setToken(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        profile,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
