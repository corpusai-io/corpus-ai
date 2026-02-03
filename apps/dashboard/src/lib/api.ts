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
      credentials: 'include', // Include cookies
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store tokens in localStorage (client-side only with proper methods)
    if (typeof window !== 'undefined' && typeof localStorage?.setItem === 'function' && data.IdToken) {
      localStorage.setItem('idToken', data.IdToken);
      localStorage.setItem('accessToken', data.AccessToken);
      localStorage.setItem('refreshToken', data.RefreshToken);
    }

    return data;
  },

  /**
   * Logout user
   */
  async logout() {
    if (typeof window === 'undefined' || typeof localStorage?.getItem !== 'function') return;

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
    if (typeof localStorage?.removeItem === 'function') {
      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    if (typeof window === 'undefined' || typeof localStorage?.getItem !== 'function') {
      throw new Error('Cannot access localStorage on server');
    }

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('No access token found');
    }

    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user');
    }

    // Store user in localStorage
    if (typeof localStorage?.setItem === 'function') {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data.user;
  },

  /**
   * Verify token
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify?token=${encodeURIComponent(token)}`);
      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined' || typeof localStorage?.getItem !== 'function') return false;
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): User | null {
    if (typeof window === 'undefined' || typeof localStorage?.getItem !== 'function') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};

/**
 * Generic API request helper
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = (typeof window !== 'undefined' && typeof localStorage?.getItem === 'function')
    ? localStorage.getItem('accessToken')
    : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API request failed: ${response.statusText}`);
  }

  return data;
}

/**
 * Chatbot API
 */
export const chatbotApi = {
  async list() {
    return apiRequest('/api/chatbots');
  },

  async get(chatbotId: string) {
    return apiRequest(`/api/chatbots/${chatbotId}`);
  },

  async create(data: { title: string; origin: string; language?: string; files?: any[] }) {
    return apiRequest('/api/chatbots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(chatbotId: string, data: Partial<{ title: string; desc: string }>) {
    return apiRequest(`/api/chatbots/${chatbotId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(chatbotId: string) {
    return apiRequest(`/api/chatbots/${chatbotId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Customize API
 */
export const customizeApi = {
  async get(chatbotId: string) {
    return apiRequest(`/api/customize/${chatbotId}`);
  },

  async update(chatbotId: string, data: any) {
    return apiRequest(`/api/customize/${chatbotId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Data Store API
 */
export const dataStoreApi = {
  async list(chatbotId: string) {
    return apiRequest(`/api/data-store/${chatbotId}`);
  },

  async add(chatbotId: string, record: any) {
    return apiRequest(`/api/data-store/${chatbotId}`, {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },

  async delete(chatbotId: string, dataId: string) {
    return apiRequest(`/api/data-store/${chatbotId}/${dataId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Leads API
 */
export const leadsApi = {
  async list(chatbotId: string, params?: { limit?: number; cursor?: string }) {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiRequest(`/api/leads/${chatbotId}${query}`);
  },

  async export(chatbotId: string) {
    const accessToken = (typeof window !== 'undefined' && typeof localStorage?.getItem === 'function')
      ? localStorage.getItem('accessToken')
      : null;

    const response = await fetch(`${API_URL}/api/leads/${chatbotId}/export`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },

  async getFields(chatbotId: string) {
    return apiRequest(`/api/leads/${chatbotId}/fields`);
  },

  async updateFields(chatbotId: string, fields: any) {
    return apiRequest(`/api/leads/${chatbotId}/fields`, {
      method: 'PUT',
      body: JSON.stringify(fields),
    });
  },
};

/**
 * Query Log API
 */
export const queryLogApi = {
  async list(chatbotId: string, params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/api/query-log/${chatbotId}${query}`);
  },

  async analytics(chatbotId: string, params?: { startDate?: number; endDate?: number }) {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiRequest(`/api/query-log/${chatbotId}/analytics${query}`);
  },

  async export(chatbotId: string) {
    const accessToken = (typeof window !== 'undefined' && typeof localStorage?.getItem === 'function')
      ? localStorage.getItem('accessToken')
      : null;

    const response = await fetch(`${API_URL}/api/query-log/${chatbotId}/export`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};

/**
 * Quota API
 */
export const quotaApi = {
  async get() {
    return apiRequest('/api/quota');
  },

  async getTiers() {
    return apiRequest('/api/quota/tiers');
  },
};

/**
 * Payment API
 */
export const paymentApi = {
  async getPlans() {
    return apiRequest('/api/payment/plans');
  },

  async createCheckout(data: { priceId: string; successUrl: string; cancelUrl: string }) {
    return apiRequest('/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createPortalSession() {
    return apiRequest('/api/payment/portal', {
      method: 'POST',
    });
  },

  async getSubscription() {
    return apiRequest('/api/payment/subscription');
  },

  async cancel() {
    return apiRequest('/api/payment/cancel', {
      method: 'POST',
    });
  },
};

/**
 * Integrations API
 */
export const integrationsApi = {
  async list(chatbotId: string) {
    return apiRequest(`/api/integrations/${chatbotId}`);
  },

  async getSlackOAuthUrl(chatbotId: string) {
    const data = await apiRequest<{ url: string }>(`/api/integrations/slack/oauth?chatbotId=${chatbotId}`);
    return data.url;
  },

  async connectSlack(chatbotId: string, code: string) {
    return apiRequest(`/api/integrations/slack/${chatbotId}`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async disconnectSlack(chatbotId: string) {
    return apiRequest(`/api/integrations/slack/${chatbotId}`, {
      method: 'DELETE',
    });
  },

  async connectGoogleDrive(chatbotId: string, code: string) {
    return apiRequest(`/api/integrations/google-drive/${chatbotId}`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async disconnectGoogleDrive(chatbotId: string) {
    return apiRequest(`/api/integrations/google-drive/${chatbotId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Access Control API
 */
export const accessControlApi = {
  async list(chatbotId: string) {
    return apiRequest(`/api/access-control/${chatbotId}`);
  },

  async grant(chatbotId: string, email: string) {
    return apiRequest(`/api/access-control/${chatbotId}`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async revoke(chatbotId: string, email: string) {
    return apiRequest(`/api/access-control/${chatbotId}/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
  },

  async updateMode(chatbotId: string, mode: 'public' | 'private' | 'whitelist') {
    return apiRequest(`/api/access-control/${chatbotId}/mode`, {
      method: 'PUT',
      body: JSON.stringify({ mode }),
    });
  },

  async generateApiKey(chatbotId: string) {
    return apiRequest(`/api/access-control/${chatbotId}/apikey`, {
      method: 'POST',
    });
  },
};
