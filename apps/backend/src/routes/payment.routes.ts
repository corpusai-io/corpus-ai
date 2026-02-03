import { Router } from 'express';
import {
  handleStripeWebhook,
  createCheckoutSession,
  getPricingPlans,
  createPortalSession,
  getSubscriptionDetails,
  cancelSubscription,
} from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import express from 'express';

const router = Router();

/**
 * Payment Routes
 * Note: Webhook endpoint uses raw body for signature verification
 */

// Stripe webhook (PUBLIC - uses raw body)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// Get pricing plans (PUBLIC)
router.get('/plans', getPricingPlans);

// Create checkout session (protected)
router.post('/checkout', authenticateToken, createCheckoutSession);

// Create customer portal session (protected)
router.post('/portal', authenticateToken, createPortalSession);

// Get subscription details (protected)
router.get('/subscription', authenticateToken, getSubscriptionDetails);

// Cancel subscription (protected)
router.post('/cancel', authenticateToken, cancelSubscription);

export default router;
