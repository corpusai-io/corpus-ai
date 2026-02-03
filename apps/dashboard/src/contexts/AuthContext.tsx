'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Only access localStorage on client side with proper methods
        if (typeof window !== 'undefined' && typeof localStorage?.getItem === 'function') {
          const accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            // Fetch current user from backend
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
        // Clear invalid tokens
        if (typeof window !== 'undefined' && typeof localStorage?.removeItem === 'function') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('idToken');
          localStorage.removeItem('refreshToken');
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      setUser(response.user);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await authApi.register(email, password, name);

      // Auto-login after registration
      if (response.message === 'User registered successfully') {
        await login(email, password);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      router.push('/signin');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
