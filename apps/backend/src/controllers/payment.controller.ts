import { Response, Request } from 'express';
import Stripe from 'stripe';
import { UserModel } from '@corpusai/aws-common';
import { AuthRequest } from '../middleware/auth.middleware';
import { PRICING_PLANS, getPlanByStripePriceId } from '../config/pricing';

// Initialize Stripe (only if API key is provided)
const STRIPE_ENABLED = !!process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_ENABLED
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    })
  : null;

/**
 * Stripe webhook handler
 * POST /api/payment/webhook
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  if (!STRIPE_ENABLED || !stripe) {
    return res.status(503).json({ error: 'Stripe is not configured' });
  }

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log('Stripe webhook received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);

  const { customer, subscription, client_reference_id } = session;

  if (!customer || !subscription || !client_reference_id) {
    console.error('Missing required fields in checkout session');
    return;
  }

  const username = client_reference_id;

  // Get subscription details
  const sub = await stripe.subscriptions.retrieve(subscription as string);
  const priceId = sub.items.data[0]?.price.id;

  if (!priceId) {
    console.error('No price ID found in subscription');
    return;
  }

  // Get plan from price ID
  const plan = getPlanByStripePriceId(priceId);

  if (!plan) {
    console.error('Plan not found for price ID:', priceId);
    return;
  }

  // Update user tier
  await updateUserTier(username, plan.tier, customer as string);

  console.log(`User ${username} upgraded to ${plan.name} (tier ${plan.tier})`);

  // TODO: Send confirmation email
}

/**
 * Handle payment succeeded
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);

  const { customer, subscription } = invoice;

  if (!subscription) {
    return;
  }

  // Get subscription
  const sub = await stripe.subscriptions.retrieve(subscription as string);
  const priceId = sub.items.data[0]?.price.id;

  if (!priceId) {
    return;
  }

  // Get plan
  const plan = getPlanByStripePriceId(priceId);

  if (!plan) {
    return;
  }

  // Find user by customer ID
  const users = await UserModel.scan('customer').eq(customer as string).exec();

  if (users.length === 0) {
    console.error('User not found for customer:', customer);
    return;
  }

  const user = users[0];

  // Reset usage on renewal
  await UserModel.update(
    { username: user.username, customer: user.customer },
    {
      chat_usage: 0,
      resetAt: Date.now(),
      expireAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // +30 days
    }
  );

  console.log(`Usage reset for user ${user.username}`);

  // TODO: Send payment confirmation email
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id);

  const { customer } = invoice;

  // Find user
  const users = await UserModel.scan('customer').eq(customer as string).exec();

  if (users.length === 0) {
    return;
  }

  const user = users[0];

  console.log(`Payment failed for user ${user.username}`);

  // TODO: Send payment failed email
  // TODO: Optionally downgrade to free tier after grace period
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  const { customer, items } = subscription;
  const priceId = items.data[0]?.price.id;

  if (!priceId) {
    return;
  }

  // Get plan
  const plan = getPlanByStripePriceId(priceId);

  if (!plan) {
    return;
  }

  // Find user
  const users = await UserModel.scan('customer').eq(customer as string).exec();

  if (users.length === 0) {
    return;
  }

  const user = users[0];

  // Update tier
  await UserModel.update(
    { username: user.username, customer: user.customer },
    { tier: plan.tier }
  );

  console.log(`User ${user.username} tier updated to ${plan.tier}`);
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  const { customer } = subscription;

  // Find user
  const users = await UserModel.scan('customer').eq(customer as string).exec();

  if (users.length === 0) {
    return;
  }

  const user = users[0];

  // Downgrade to free tier
  await UserModel.update(
    { username: user.username, customer: user.customer },
    { tier: 0 }
  );

  console.log(`User ${user.username} downgraded to free tier`);

  // TODO: Send cancellation confirmation email
}

/**
 * Update user tier
 */
async function updateUserTier(
  username: string,
  tier: number,
  customerId: string
) {
  const users = await UserModel.query('username').eq(username).exec();

  if (users.length === 0) {
    console.error('User not found:', username);
    return;
  }

  const user = users[0];

  await UserModel.update(
    { username, customer: user.customer || customerId },
    {
      tier,
      customer: customerId,
      customer_type: 'stripe',
      resetAt: Date.now(),
      expireAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // +30 days
    }
  );
}

/**
 * Create checkout session
 * POST /api/payment/checkout
 */
export async function createCheckoutSession(req: AuthRequest, res: Response) {
  if (!STRIPE_ENABLED || !stripe) {
    return res.status(503).json({ error: 'Stripe is not configured' });
  }

  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        error: 'priceId, successUrl, and cancelUrl are required',
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: username,
      customer_email: username,
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get pricing plans
 * GET /api/payment/plans
 */
export async function getPricingPlans(req: Request, res: Response) {
  res.json({
    success: true,
    plans: PRICING_PLANS,
  });
}

/**
 * Create customer portal session
 * POST /api/payment/portal
 */
export async function createPortalSession(req: AuthRequest, res: Response) {
  if (!STRIPE_ENABLED || !stripe) {
    return res.status(503).json({ error: 'Stripe is not configured' });
  }

  try {
    const { returnUrl } = req.body;
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!returnUrl) {
      return res.status(400).json({ error: 'returnUrl is required' });
    }

    // Get user
    const users = await UserModel.query('username').eq(username).exec();

    if (users.length === 0 || !users[0].customer) {
      return res.status(404).json({
        error: 'No Stripe customer found for this user',
      });
    }

    const customerId = users[0].customer;

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({
      error: 'Failed to create portal session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get subscription details
 * GET /api/payment/subscription
 */
export async function getSubscriptionDetails(req: AuthRequest, res: Response) {
  if (!STRIPE_ENABLED || !stripe) {
    return res.status(503).json({ error: 'Stripe is not configured' });
  }

  try {
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user
    const users = await UserModel.query('username').eq(username).exec();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    if (!user.customer) {
      return res.json({
        success: true,
        subscription: null,
        message: 'No active subscription',
      });
    }

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: user.customer,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.json({
        success: true,
        subscription: null,
        message: 'No active subscription',
      });
    }

    const sub = subscriptions.data[0];
    const priceId = sub.items.data[0]?.price.id;
    const plan = priceId ? getPlanByStripePriceId(priceId) : null;

    res.json({
      success: true,
      subscription: {
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        plan: plan ? {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          interval: plan.interval,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({
      error: 'Failed to get subscription',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Cancel subscription
 * POST /api/payment/cancel
 */
export async function cancelSubscription(req: AuthRequest, res: Response) {
  if (!STRIPE_ENABLED || !stripe) {
    return res.status(503).json({ error: 'Stripe is not configured' });
  }

  try {
    const username = req.user?.email;

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user
    const users = await UserModel.query('username').eq(username).exec();

    if (users.length === 0 || !users[0].customer) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: users[0].customer,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const sub = subscriptions.data[0];

    // Cancel at period end
    await stripe.subscriptions.update(sub.id, {
      cancel_at_period_end: true,
    });

    res.json({
      success: true,
      message: 'Subscription will be cancelled at period end',
      cancelAt: sub.current_period_end,
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
