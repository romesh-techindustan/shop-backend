import * as orderService from "../services/order.service.js";
import { constructWebhookEvent } from "../services/stripe.service.js";

export async function stripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = constructWebhookEvent(req.body, signature);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${error.message}`,
    });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.expired":
      await orderService.syncStripeCheckoutSession(event.data.object);
      break;
    case "checkout.session.async_payment_failed":
      await orderService.markStripeCheckoutSessionFailed(event.data.object);
      break;
    case "payment_intent.succeeded":
      await orderService.markStripePaymentIntentSucceeded(event.data.object);
      break;
    case "payment_intent.payment_failed":
      await orderService.markStripePaymentIntentFailed(event.data.object);
      break;
    default:
      break;
  }

  res.json({ received: true });
}
