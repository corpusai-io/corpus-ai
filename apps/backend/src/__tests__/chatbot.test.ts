import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const API_URL = process.env.API_URL || 'http://localhost:8001';

describe('Chatbot API Tests', () => {
  let accessToken: string;
  let chatbotId: string;
  let testEmail: string;
  let testPassword: string;

  beforeAll(async () => {
    // Register and login a test user
    testEmail = `chatbot-test-${Date.now()}@example.com`;
    testPassword = 'TestPassword123!';

    // Register
    await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    // Login
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const loginData = await loginResponse.json();
    accessToken = loginData.AccessToken;
  });

  describe('POST /api/chatbots', () => {
    it('should create a new chatbot successfully', async () => {
      const response = await fetch(`${API_URL}/api/chatbots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: 'Test Chatbot',
          origin: 'https://example.com',
          language: 'en',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.chatbot).toBeDefined();
      expect(data.chatbot.chatbotId).toBeDefined();
      expect(data.chatbot.title).toBe('Test Chatbot');
      expect(data.chatbot.status).toBe('BUILDING');

      // Store for subsequent tests
      chatbotId = data.chatbot.chatbotId;
    });

    it('should reject creation without authentication', async () => {
      const response = await fetch(`${API_URL}/api/chatbots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Chatbot',
          origin: 'https://example.com',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });

    it('should reject creation with missing required fields', async () => {
      const response = await fetch(`${API_URL}/api/chatbots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: 'Test Chatbot',
          // Missing origin
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/chatbots', () => {
    it('should list all user chatbots', async () => {
      const response = await fetch(`${API_URL}/api/chatbots`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.chatbots).toBeDefined();
      expect(Array.isArray(data.chatbots)).toBe(true);
      expect(data.chatbots.length).toBeGreaterThan(0);
    });

    it('should reject request without authentication', async () => {
      const response = await fetch(`${API_URL}/api/chatbots`);

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/chatbots/:id', () => {
    it('should get chatbot by ID', async () => {
      const response = await fetch(`${API_URL}/api/chatbots/${chatbotId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.chatbot).toBeDefined();
      expect(data.chatbot.chatbotId).toBe(chatbotId);
      expect(data.chatbot.title).toBe('Test Chatbot');
    });

    it('should return 404 for non-existent chatbot', async () => {
      const response = await fetch(
        `${API_URL}/api/chatbots/non-existent-id`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });

  describe('PUT /api/chatbots/:id', () => {
    it('should update chatbot successfully', async () => {
      const response = await fetch(`${API_URL}/api/chatbots/${chatbotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: 'Updated Test Chatbot',
          desc: 'This is an updated description',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.chatbot).toBeDefined();
      expect(data.chatbot.title).toBe('Updated Test Chatbot');
      expect(data.chatbot.desc).toBe('This is an updated description');
    });

    it('should reject update without authentication', async () => {
      const response = await fetch(`${API_URL}/api/chatbots/${chatbotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthorized Update',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('DELETE /api/chatbots/:id', () => {
    it('should delete chatbot successfully', async () => {
      const response = await fetch(`${API_URL}/api/chatbots/${chatbotId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 404 when deleting non-existent chatbot', async () => {
      const response = await fetch(
        `${API_URL}/api/chatbots/non-existent-id`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });

  afterAll(async () => {
    // Clean up: delete test user (if endpoint exists)
    // This would require implementing user deletion endpoint
  });
});
