import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const API_URL = process.env.API_URL || 'http://localhost:8001';

describe('Authentication API Tests', () => {
  let testEmail: string;
  let testPassword: string;
  let accessToken: string;

  beforeAll(() => {
    testEmail = `test-${Date.now()}@example.com`;
    testPassword = 'TestPassword123!';
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: 'Test User',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toContain('registered');
    });

    it('should reject duplicate email', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject invalid email format', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: testPassword,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject weak password', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `test2-${Date.now()}@example.com`,
          password: '123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.IdToken).toBeDefined();
      expect(data.AccessToken).toBeDefined();
      expect(data.RefreshToken).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);

      // Store token for subsequent tests
      accessToken = data.AccessToken;
    });

    it('should reject incorrect password', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPassword123!',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });

    it('should reject non-existent user', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: testPassword,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.user.tier).toBeDefined();
    });

    it('should reject request without token', async () => {
      const response = await fetch(`${API_URL}/api/auth/me`);

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });

    it('should reject invalid token', async () => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: 'Bearer invalid-token-12345',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
