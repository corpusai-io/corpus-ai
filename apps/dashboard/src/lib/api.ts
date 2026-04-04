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
  name?: string;
  tier: number;
  chat_usage: number;
  since?: number;
  expireAt?: number;
  createdAt?: number;
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
   * Refresh access token using stored refresh token
   */
  async refreshToken(): Promise<{ IdToken: string; AccessToken: string }> {
    if (typeof window === 'undefined' || typeof localStorage?.getItem !== 'function') {
      throw new Error('Cannot access localStorage on server');
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error('Token refresh failed');
    const data = await response.json();

    // Update stored tokens
    if (typeof localStorage?.setItem === 'function') {
      localStorage.setItem('idToken', data.IdToken);
      localStorage.setItem('accessToken', data.AccessToken);
    }

    return data;
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
 * Token refresh state - prevents multiple simultaneous refresh attempts
 */
let isRefreshing = false;
let refreshPromise: Promise<{ IdToken: string; AccessToken: string }> | null = null;

/**
 * Generic API request helper with automatic token refresh on 401
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const makeRequest = async () => {
    const accessToken = (typeof window !== 'undefined' && typeof localStorage?.getItem === 'function')
      ? localStorage.getItem('accessToken')
      : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest();

  // If 401, attempt token refresh and retry once
  if (response.status === 401) {
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = authApi.refreshToken()
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      await (refreshPromise || authApi.refreshToken());
      // Retry the original request with new token
      response = await makeRequest();
    } catch {
      // Refresh failed - clear tokens and redirect to sign-in
      if (typeof window !== 'undefined' && typeof localStorage?.removeItem === 'function') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      if (typeof window !== 'undefined') {
        window.location.href = `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'}/Sign-In`;
      }
      throw new Error('Session expired');
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || `API request failed: ${response.statusText}`);
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

  async create(data: { title: string; desc?: string; origin: string; language?: string; files?: any[]; textContent?: string }) {
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

  async getUploadUrl(chatbotId: string, filename: string, contentType: string) {
    return apiRequest<{ uploadUrl: string; fileKey: string; fileId: string }>(
      `/api/chatbots/${chatbotId}/upload-url`,
      {
        method: 'POST',
        body: JSON.stringify({ filename, contentType }),
      }
    );
  },

  async uploadFile(chatbotId: string, file: File): Promise<{ fileKey: string; fileId: string }> {
    const accessToken = (typeof window !== 'undefined' && typeof localStorage?.getItem === 'function')
      ? localStorage.getItem('accessToken')
      : null;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/chatbots/${chatbotId}/upload`, {
      method: 'POST',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `Upload failed: ${response.statusText}`);
    }

    return data;
  },

  async startBuild(chatbotId: string, fileKeys?: string[], fileMeta?: Array<{name: string, size: number}>) {
    return apiRequest(`/api/chatbots/${chatbotId}/build`, {
      method: 'POST',
      body: JSON.stringify({ fileKeys, fileMeta }),
    });
  },

  async getStatus(chatbotId: string) {
    return apiRequest<{ status: string; step: number; errorMessage?: string }>(
      `/api/chatbots/${chatbotId}/status`
    );
  },

  async rebuild(chatbotId: string) {
    return apiRequest(`/api/chatbots/${chatbotId}/rebuild`, {
      method: 'POST',
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
    return apiRequest(`/api/data-store/${chatbotId}/delete`, {
      method: 'POST',
      body: JSON.stringify({ dataId }),
    });
  },

  async getViewUrl(chatbotId: string, dataId: string, s3Key?: string) {
    return apiRequest<{ success: boolean; url: string }>(`/api/data-store/${chatbotId}/view`, {
      method: 'POST',
      body: JSON.stringify({ dataId, s3Key }),
    });
  },

  async getViewToken(chatbotId: string, dataId: string, s3Key?: string) {
    return apiRequest<{ success: boolean; token: string }>(`/api/data-store/${chatbotId}/view-token`, {
      method: 'POST',
      body: JSON.stringify({ dataId, s3Key }),
    });
  },
};

/**
 * Leads API
 */
export const leadsApi = {
  async list(chatbotId: string, params?: {
    limit?: number;
    cursor?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    intent?: string;
    status?: string;
  }) {
    const filteredParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') filteredParams[key] = String(value);
      });
    }
    const query = Object.keys(filteredParams).length ? `?${new URLSearchParams(filteredParams).toString()}` : '';
    return apiRequest(`/api/leads/${chatbotId}${query}`);
  },

  async get(chatbotId: string, dataId: string) {
    return apiRequest<{
      success: boolean;
      lead: any;
      transcript: Array<{ role: string; content: string; createdAt: string }>;
    }>(`/api/leads/${chatbotId}/${dataId}`);
  },

  async update(chatbotId: string, dataId: string, data: { status?: string; notes?: string }) {
    return apiRequest(`/api/leads/${chatbotId}/${dataId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async analytics(chatbotId: string) {
    return apiRequest<{
      success: boolean;
      analytics: {
        total: number;
        intentBreakdown: { hot: number; warm: number; cold: number };
        statusBreakdown: { new: number; contacted: number; converted: number; archived: number };
        leadsOverTime: Record<string, number>;
      };
    }>(`/api/leads/${chatbotId}/analytics`);
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
    const p = { ...params };
    if (p.startDate) p.startDate = new Date(p.startDate).toISOString();
    if (p.endDate) p.endDate = new Date(p.endDate).toISOString();
    const query = p ? `?${new URLSearchParams(p).toString()}` : '';
    return apiRequest(`/api/query-log/${chatbotId}${query}`);
  },

  async analytics(chatbotId: string, params?: { startDate?: number; endDate?: number }) {
    const p: any = { ...params };
    if (p.startDate) p.startDate = new Date(p.startDate).toISOString();
    if (p.endDate) p.endDate = new Date(p.endDate).toISOString();
    const query = p ? `?${new URLSearchParams(p).toString()}` : '';
    return apiRequest(`/api/query-log/${chatbotId}/analytics${query}`);
  },

  async export(chatbotId: string, params?: { startDate?: number; endDate?: number }) {
    const accessToken = (typeof window !== 'undefined' && typeof localStorage?.getItem === 'function')
      ? localStorage.getItem('accessToken')
      : null;

    const p: any = { ...params };
    if (p.startDate) p.startDate = new Date(p.startDate).toISOString();
    if (p.endDate) p.endDate = new Date(p.endDate).toISOString();
    const qs = p && Object.keys(p).length ? `?${new URLSearchParams(p).toString()}` : '';

    const response = await fetch(`${API_URL}/api/query-log/${chatbotId}/export${qs}`, {
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

  async createPortalSession(returnUrl?: string) {
    return apiRequest('/api/payment/portal', {
      method: 'POST',
      body: JSON.stringify({ returnUrl: returnUrl || (typeof window !== 'undefined' ? window.location.href : '') }),
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

  async connectTelegram(chatbotId: string, data: { httpToken: string; botId: string }) {
    return apiRequest(`/api/integrations/telegram/${chatbotId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async disconnectTelegram(chatbotId: string) {
    return apiRequest(`/api/integrations/telegram/${chatbotId}`, {
      method: 'DELETE',
    });
  },

  async connectWhatsApp(chatbotId: string, data: { phoneNumberId: string; accessToken: string; verificationToken?: string }) {
    return apiRequest(`/api/integrations/whatsapp/${chatbotId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async disconnectWhatsApp(chatbotId: string) {
    return apiRequest(`/api/integrations/whatsapp/${chatbotId}`, {
      method: 'DELETE',
    });
  },

  async connectZapier(chatbotId: string, data: { hookUrl: string; hookType: string }) {
    return apiRequest('/api/integrations/zapier/subscribe', {
      method: 'POST',
      body: JSON.stringify({ chatbotId, ...data }),
    });
  },

  async disconnectZapier(chatbotId: string, hookType: string) {
    return apiRequest('/api/integrations/zapier/unsubscribe', {
      method: 'DELETE',
      body: JSON.stringify({ chatbotId, hookType }),
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

  async generateApiKey(chatbotId: string, label?: string) {
    return apiRequest(`/api/access-control/${chatbotId}/apikey`, {
      method: 'POST',
      body: JSON.stringify({ label }),
    });
  },

  async listApiKeys(chatbotId: string) {
    return apiRequest(`/api/access-control/${chatbotId}/apikeys`);
  },

  async deleteApiKey(chatbotId: string, keyId: string) {
    return apiRequest(`/api/access-control/${chatbotId}/apikeys/${keyId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Chat History API
 */
export const chatHistoryApi = {
  async getHistory(chatbotId: string, limit?: number, lastKey?: string) {
    const params: Record<string, string> = {};
    if (limit) params.limit = String(limit);
    if (lastKey) params.lastKey = lastKey;
    const query = Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<{
      success: boolean;
      messages: Array<{
        chatbotId: string;
        messageId: string;
        role: 'user' | 'bot';
        content: string;
        citations: any[];
        feedback: number | null;
        createdAt: string;
        sessionId: string;
      }>;
      lastKey: string | null;
      count: number;
    }>(`/api/chat/history/${chatbotId}${query}`);
  },

  async clearHistory(chatbotId: string) {
    return apiRequest(`/api/chat/history/${chatbotId}`, {
      method: 'DELETE',
    });
  },

  async updateFeedback(chatbotId: string, messageId: string, feedback: 1 | -1 | null) {
    return apiRequest(`/api/chat/history/${chatbotId}/${messageId}/feedback`, {
      method: 'PUT',
      body: JSON.stringify({ feedback }),
    });
  },
};

export interface DbSslConfig {
  enabled: boolean;
  ca?: string;
  cert?: string;
  key?: string;
  rejectUnauthorized?: boolean;
}

export interface DbConnectionPayload {
  dbType: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  // SSL — MySQL, PostgreSQL
  ssl?: DbSslConfig;
  // MSSQL
  mssqlEncrypt?: boolean;
  mssqlTrustServerCert?: boolean;
  // MongoDB
  mongoAuthSource?: string;
  mongoConnectionString?: string;
}

export interface DbConnection {
  id: string;
  name: string;
  dbType: string;
  host: string;
  port: number;
  database: string;
  username: string;
  status: 'connected' | 'error';
  selectedTables: string[];
  sslEnabled?: boolean;
  mssqlEncrypt?: boolean;
  createdAt?: number;
  updatedAt?: number;
  schemaLastSynced?: number;
  schemaDoc?: string; // intentionally not typed fully - not displayed to user
}

/**
 * Database Connections API
 */
export const databaseApi = {
  async testConnection(config: DbConnectionPayload) {
    return apiRequest<{ success: boolean; error?: string }>('/api/databases/test', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  async fetchTables(config: DbConnectionPayload) {
    return apiRequest<{ tables: string[]; error?: string }>('/api/databases/tables', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  async saveConnection(data: DbConnectionPayload & {
    chatbotId: string;
    name: string;
    selectedTables: string[];
  }) {
    return apiRequest<{ success: boolean; connection: any }>('/api/databases/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getConnections(chatbotId: string) {
    return apiRequest<{ connections: any[] }>(`/api/databases/${chatbotId}`);
  },

  async deleteConnection(connectionId: string) {
    return apiRequest<{ success: boolean }>(`/api/databases/${connectionId}`, {
      method: 'DELETE',
    });
  },

  async refreshSchema(connectionId: string): Promise<{ success: boolean; schemaLastSynced: number }> {
    return apiRequest(`/api/databases/${connectionId}/refresh-schema`, { method: 'POST' });
  },

  async nlQuery(chatbotId: string, query: string): Promise<{
    success: boolean;
    answer?: string;
    executedQuery?: string;
    queryType?: 'sql' | 'mql';
    rowCount?: number;
    connectionName?: string;
    duration?: number;
    error?: string;
  }> {
    return apiRequest(`/api/databases/${chatbotId}/nl-query`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },
};

/**
 * AI Actions API
 */
export const aiActionsApi = {
  async get(chatbotId: string): Promise<{
    success: boolean;
    buttonActions: any[];
    formActions: any[];
    builtins: any[];
  }> {
    return apiRequest(`/api/ai-actions/${chatbotId}`);
  },

  async save(chatbotId: string, data: {
    buttonActions: any[];
    formActions: any[];
    builtins: any[];
  }): Promise<{ success: boolean }> {
    return apiRequest(`/api/ai-actions/${chatbotId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Builtin Integrations API
 */
export const builtinIntegrationsApi = {
  async getAll(chatbotId: string): Promise<{
    success: boolean;
    integrations: Array<{
      integrationKey: string;
      enabled: boolean;
      connected: boolean;
      operations: string[];
      triggerDescription: string;
      metadata: Record<string, string>;
    }>;
  }> {
    return apiRequest(`/api/builtin-integrations/${chatbotId}`);
  },

  async save(chatbotId: string, integrationKey: string, data: {
    credentials: Record<string, string>;
    operations: string[];
    triggerDescription: string;
    enabled: boolean;
    metadata?: Record<string, string>;
  }): Promise<{ success: boolean }> {
    return apiRequest(`/api/builtin-integrations/${chatbotId}/${integrationKey}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async test(chatbotId: string, integrationKey: string, credentials: Record<string, string>): Promise<{
    success: boolean;
    ok: boolean;
    accountName?: string;
    error?: string;
  }> {
    return apiRequest(`/api/builtin-integrations/${chatbotId}/${integrationKey}/test`, {
      method: 'POST',
      body: JSON.stringify({ credentials }),
    });
  },

  async disconnect(chatbotId: string, integrationKey: string): Promise<{ success: boolean }> {
    return apiRequest(`/api/builtin-integrations/${chatbotId}/${integrationKey}`, {
      method: 'DELETE',
    });
  },
};
