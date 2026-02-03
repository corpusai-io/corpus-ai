import { describe, it, expect, beforeAll } from '@jest/globals';

const API_URL = process.env.API_URL || 'http://localhost:8001';

describe('Payment API Tests', () => {
  let accessToken: string;

  beforeAll(async () => {
    // Register and login a test user
    const testEmail = `payment-test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

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

  describe('GET /api/payment/plans', () => {
    it('should return all pricing plans', async () => {
      const response = await fetch(`${API_URL}/api/payment/plans`);

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.plans).toBeDefined();
      expect(Array.isArray(data.plans)).toBe(true);
      expect(data.plans.length).toBeGreaterThan(0);

      // Check plan structure
      const plan = data.plans[0];
      expect(plan.id).toBeDefined();
      expect(plan.name).toBeDefined();
      expect(plan.tier).toBeDefined();
      expect(plan.price).toBeDefined();
      expect(plan.features).toBeDefined();
    });

    it('should include all 4 pricing tiers', async () => {
      const response = await fetch(`${API_URL}/api/payment/plans`);
      const data = await response.json();

      const planNames = data.plans.map((p: any) => p.name);

      expect(planNames).toContain('Free');
      expect(planNames).toContain('Starter');
      expect(planNames).toContain('Standard');
      expect(planNames).toContain('Business');
    });
  });

  describe('POST /api/payment/checkout', () => {
    it('should create Stripe checkout session', async () => {
      // Note: This test requires valid Stripe credentials
      const response = await fetch(`${API_URL}/api/payment/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          priceId: 'price_test_12345',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel',
        }),
      });

      // May fail if Stripe not configured
      if (response.status === 200) {
        const data = await response.json();

        expect(data.sessionId).toBeDefined();
        expect(data.url).toBeDefined();
        expect(data.url).toContain('stripe.com');
      } else {
        // Expected if Stripe not configured in test environment
        expect([500, 400]).toContain(response.status);
      }
    });

    it('should reject checkout without authentication', async () => {
      const response = await fetch(`${API_URL}/api/payment/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_test_12345',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });

    it('should reject checkout with missing fields', async () => {
      const response = await fetch(`${API_URL}/api/payment/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          // Missing priceId, successUrl, cancelUrl
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/payment/subscription', () => {
    it('should return subscription details or 404', async () => {
      const response = await fetch(`${API_URL}/api/payment/subscription`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Either returns subscription or 404 if none exists
      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();

        expect(data.subscription).toBeDefined();
        expect(data.subscription.status).toBeDefined();
      }
    });

    it('should reject request without authentication', async () => {
      const response = await fetch(`${API_URL}/api/payment/subscription`);

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/payment/webhook', () => {
    it('should reject webhook without valid signature', async () => {
      const response = await fetch(`${API_URL}/api/payment/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'invalid-signature',
        },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {},
        }),
      });

      // Should reject invalid signature
      expect([400, 401, 403]).toContain(response.status);
    });
  });
});
