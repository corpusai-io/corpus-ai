/**
 * API Client for Corpus AI Backend
 * Handles authentication and API requests
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export interface AuthTokens {
  IdToken: string;
  AccessToken: string;
  RefreshToken: string;
}

export interface User {
  username: string;
  email: string;
  tier: number;
  chat_usage: number;
  createdAt: number;
}

export interface ApiError {
  error: string;
  message?: string;
}

/**
 * Auth API
 */
export const authApi = {
  /**
   * Register a new user
   */
  async register(email: string, password: string, name?: string) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  },

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthTokens & { user: User }> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    console.log('🔍 Login response:', data); // DEBUG

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store tokens in localStorage
    if (typeof window !== 'undefined' && data.IdToken) {
      console.log('✅ Storing tokens...'); // DEBUG
      localStorage.setItem('idToken', data.IdToken);
      localStorage.setItem('accessToken', data.AccessToken);
      localStorage.setItem('refreshToken', data.RefreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    } else {
      console.error('❌ No IdToken found in response!', { IdToken: data.IdToken }); // DEBUG
    }

    return data;
  },

  /**
   * Logout user
   */
  async logout() {
    if (typeof window === 'undefined') return;

    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear local storage
    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  /**
   * Confirm signup with verification code
   */
  async confirmSignup(email: string, code: string) {
    const response = await fetch(`${API_URL}/api/auth/confirm-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Confirmation failed');
    }

    return data;
  },

  /**
   * Initiate forgot password flow
   */
  async forgotPassword(email: string) {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send reset code');
    }

    return data;
  },

  /**
   * Initiate Google SSO - redirects to backend which redirects to Cognito/Google
   */
  googleLogin() {
    window.location.href = `${API_URL}/api/auth/google`;
  },

  /**
   * Confirm forgot password with code and new password
   */
  async confirmForgotPassword(email: string, code: string, newPassword: string) {
    const response = await fetch(`${API_URL}/api/auth/confirm-forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }

    return data;
  },
};
