import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, UserRole } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  role: UserRole | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('honeychain_token'));
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('honeychain_user'));
  const [role, setRole] = useState<UserRole | null>(() => (localStorage.getItem('honeychain_role') as UserRole) || null);

  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) {
      localStorage.setItem('honeychain_token', token);
    } else {
      localStorage.removeItem('honeychain_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('honeychain_user', user);
    } else {
      localStorage.removeItem('honeychain_user');
    }
  }, [user]);

  useEffect(() => {
    if (role) {
      localStorage.setItem('honeychain_role', role);
    } else {
      localStorage.removeItem('honeychain_role');
    }
  }, [role]);

  const login = (data: AuthResponse) => {
    setToken(data.token);
    setUser(data.username);
    setRole(data.role);
    localStorage.setItem('honeychain_token', data.token);
    localStorage.setItem('honeychain_user', data.username);
    localStorage.setItem('honeychain_role', data.role);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('honeychain_token');
    localStorage.removeItem('honeychain_user');
    localStorage.removeItem('honeychain_role');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
