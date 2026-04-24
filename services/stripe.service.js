import Stripe from 'stripe';
import { AppError } from '../middleware/error-response.js';

let stripeClient;

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new AppError('STRIPE_SECRET_KEY is not configured', 500);
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

export async function createPaymentIntent({
  amount,
  currency,
  orderId,
  userId,
  receiptEmail,
  idempotencyKey,
}) {
  const stripe = getStripeClient();

  return stripe.paymentIntents.create(
    {
      amount,
      currency,
      receipt_email: receiptEmail,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId,
        userId,
      },
    },
    {
      idempotencyKey: idempotencyKey ?? `order:${orderId}`,
    }
  );
}

export async function cancelPaymentIntent(paymentIntentId) {
  const stripe = getStripeClient();

  return stripe.paymentIntents.cancel(paymentIntentId);
}

export function constructWebhookEvent(rawBody, signature) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError('STRIPE_WEBHOOK_SECRET is not configured', 500);
  }

  try {
    return getStripeClient().webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    throw new AppError('Invalid Stripe webhook signature', 400);
  }
}
