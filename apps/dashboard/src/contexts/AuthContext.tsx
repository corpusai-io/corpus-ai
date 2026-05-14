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

/**
 * Decode JWT token to extract expiry timestamp (in milliseconds)
 * Only decodes the payload - does not verify signature
 */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to ms
  } catch {
    return null;
  }
}

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
          // Check for auth tokens passed via URL hash from website sign-in
          const hash = window.location.hash;
          if (hash.startsWith('#auth=')) {
            try {
              const authData = JSON.parse(decodeURIComponent(hash.substring(6)));
              if (authData.accessToken && authData.user) {
                localStorage.setItem('accessToken', authData.accessToken);
                localStorage.setItem('idToken', authData.idToken);
                localStorage.setItem('refreshToken', authData.refreshToken);
                localStorage.setItem('user', JSON.stringify(authData.user));
                console.log('[AuthContext] Recovered tokens from URL hash');
              }
              // Clean up the URL hash
              window.history.replaceState(null, '', window.location.pathname);
            } catch (e) {
              console.warn('[AuthContext] Failed to parse auth hash:', e);
            }
          }

          const accessToken = localStorage.getItem('accessToken');
          const userStr = localStorage.getItem('user');
          console.log('[AuthContext] Initializing auth, accessToken present:', !!accessToken, 'user present:', !!userStr);

          if (accessToken && userStr) {
            try {
              // First try to use stored user data
              const storedUser = JSON.parse(userStr);
              console.log('[AuthContext] Using stored user data:', storedUser);
              setUser(storedUser);

              // Optionally fetch fresh data in background (don't await)
              authApi.getCurrentUser()
                .then(freshUser => {
                  console.log('[AuthContext] Fresh user data fetched:', freshUser);
                  setUser(freshUser);
                })
                .catch(err => {
                  console.warn('[AuthContext] Failed to fetch fresh user data (using stored):', err);
                });
            } catch (parseError) {
              console.error('[AuthContext] Failed to parse stored user, fetching from backend');
              // Fall back to fetching from backend
              const currentUser = await authApi.getCurrentUser();
              console.log('[AuthContext] User fetched from backend:', currentUser);
              setUser(currentUser);
            }
          } else {
            console.log('[AuthContext] No accessToken or user found in localStorage');
          }
        }
      } catch (error) {
        console.error('[AuthContext] Auth init error:', error);
        // Don't clear tokens on error - user might just have network issues
        // Only clear if it's an auth error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('token') || errorMessage.includes('auth')) {
          console.log('[AuthContext] Clearing invalid tokens');
          if (typeof window !== 'undefined' && typeof localStorage?.removeItem === 'function') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('idToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        }
      } finally {
        setLoading(false);
        console.log('[AuthContext] Loading complete');
      }
    };

    initAuth();
  }, []);

  // Proactive token refresh: check every 60s, refresh if expiring within 5 minutes
  useEffect(() => {
    if (!user) return;

    const checkAndRefreshToken = async () => {
      if (typeof window === 'undefined' || typeof localStorage?.getItem !== 'function') return;

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const expiry = getTokenExpiry(accessToken);
      if (!expiry) return;

      const now = Date.now();
      const timeUntilExpiry = expiry - now;
      const FIVE_MINUTES = 5 * 60 * 1000;

      if (timeUntilExpiry <= FIVE_MINUTES) {
        console.log('[AuthContext] Access token expiring soon, refreshing proactively...');
        try {
          await authApi.refreshToken();
          console.log('[AuthContext] Proactive token refresh succeeded');
        } catch (error) {
          console.error('[AuthContext] Proactive token refresh failed:', error);
          // Token refresh failed - log user out
          if (typeof localStorage?.removeItem === 'function') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('idToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
          setUser(null);
          const signInUrl = `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'}/Sign-In`;
          window.location.href = signInUrl;
        }
      }
    };

    // Check immediately on mount
    checkAndRefreshToken();

    // Then check every 60 seconds
    const intervalId = setInterval(checkAndRefreshToken, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      setUser(response.user);
      router.push('/');
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
    const signInUrl = `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'}/Sign-In`;
    try {
      await authApi.logout();
      setUser(null);
      window.location.href = signInUrl;
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      window.location.href = signInUrl;
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
