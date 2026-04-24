import sequelize from '../config/database.js';
import { orderResponse } from '../dto/order-response.dto.js';
import { AppError } from '../middleware/error-response.js';
import * as cartRepository from '../repositories/cart.repository.js';
import * as orderRepository from '../repositories/order.repository.js';
import * as productRepository from '../repositories/product.repository.js';
import * as stripeService from './stripe.service.js';

function toCents(value) {
  return Math.round(Number(value ?? 0) * 100);
}

function fromCents(value) {
  return Number((value / 100).toFixed(2));
}

function assertCartCanCheckout(cart) {
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }
}

function assertProductAvailable(product) {
  if (!product || product.isActive === false) {
    throw new AppError('One or more cart products are no longer available', 400);
  }
}

function buildOrderItems(cartItems) {
  return cartItems.map((item) => {
    const product = item.product;
    const unitPriceCents = toCents(item.priceAtTime);
    const quantity = Number(item.quantity);
    const lineTotalCents = unitPriceCents * quantity;

    return {
      productId: item.productId,
      productName: product.name,
      productSku: product.sku,
      productImage: product.image,
      quantity,
      unitPrice: fromCents(unitPriceCents),
      lineTotal: fromCents(lineTotalCents),
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
    };
  });
}

function parsePositiveInteger(value, fallback) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

function buildOrderTotals(items) {
  const subtotalCents = items.reduce(
    (sum, item) => sum + toCents(item.lineTotal),
    0
  );

  return {
    subtotal: fromCents(subtotalCents),
    totalAmount: fromCents(subtotalCents),
  };
}

async function restoreReservedStock(order, transaction) {
  await Promise.all(
    (order.items ?? []).map((item) =>
      productRepository.restoreProductStock(item.productId, item.quantity, {
        transaction,
      })
    )
  );
}

async function cancelReservedOrder(orderId, paymentStatus = 'cancelled') {
  await sequelize.transaction(async (transaction) => {
    const order = await orderRepository.findOrderById(orderId, { transaction });

    if (!order || order.status !== 'pending') {
      return;
    }

    await restoreReservedStock(order, transaction);

    await orderRepository.updateOrder(
      order,
      {
        status: 'cancelled',
        paymentStatus,
      },
      { transaction }
    );
  });
}

export async function getOrders(userId) {
  const orders = await orderRepository.findOrdersByUserId(userId);

  return orders.map(orderResponse);
}

export async function getOrderById(userId, orderId) {
  const order = await orderRepository.findOrderByIdForUser(orderId, userId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return orderResponse(order);
}

export async function getCurrentCheckout(userId) {
  const order = await orderRepository.findCurrentStripeCheckoutByUserId(userId);

  if (!order) {
    return null;
  }

  return orderResponse(order);
}

export async function previewOrder(userId, data = {}) {
  const cart = await cartRepository.findCartByUserId(userId);
  assertCartCanCheckout(cart);

  const items = buildOrderItems(cart.items);
  const totals = buildOrderTotals(items);

  return {
    paymentMethod: data.paymentProvider ?? 'stripe',
    paymentProvider: data.paymentProvider ?? 'stripe',
    currency: data.currency ?? 'usd',
    subtotal: totals.subtotal,
    totalAmount: totals.totalAmount,
    items,
  };
}

export async function getAdminOrders(query = {}) {
  const page = parsePositiveInteger(query.page, 1);
  const limit = Math.min(parsePositiveInteger(query.limit, 20), 100);
  const { rows, count } = await orderRepository.findOrders({
    page,
    limit,
    userId: query.userId,
    status: query.status,
    paymentProvider: query.paymentProvider ?? query.paymentMethod,
    paymentStatus: query.paymentStatus,
  });

  return {
    items: rows.map(orderResponse),
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages: count === 0 ? 0 : Math.ceil(count / limit),
    },
  };
}

export async function createCheckout(user, data) {
  const existingPendingOrder = await orderRepository.findPendingOrderByUserId(
    user.id
  );

  if (existingPendingOrder) {
    throw new AppError(
      'You already have a pending order. Complete or cancel it before starting another checkout.',
      409
    );
  }

  const checkoutOrder = await sequelize.transaction(async (transaction) => {
    const cart = await cartRepository.findCartByUserId(user.id, { transaction });
    assertCartCanCheckout(cart);

    const orderItems = buildOrderItems(cart.items);
    const { subtotal, totalAmount } = buildOrderTotals(orderItems);

    for (const item of cart.items) {
      assertProductAvailable(item.product);

      const reserved = await productRepository.reserveProductStock(
        item.productId,
        item.quantity,
        { transaction }
      );

      if (!reserved) {
        throw new AppError(
          `${item.product.name} does not have enough stock for checkout`,
          400
        );
      }
    }

    const order = await orderRepository.createOrder(
      {
        userId: user.id,
        paymentProvider: data.paymentProvider,
        subtotal,
        totalAmount,
        currency: data.currency,
        shippingAddress: data.shippingAddress ?? null,
      },
      { transaction }
    );

    await orderRepository.bulkCreateOrderItems(
      orderItems.map((item) => ({
        ...item,
        orderId: order.id,
      })),
      { transaction }
    );

    if (data.paymentProvider === 'cod') {
      await cartRepository.clearCartItems(cart.id, { transaction });
    }

    return {
      id: order.id,
      totalAmount,
      currency: order.currency,
      paymentProvider: order.paymentProvider,
    };
  });

  if (checkoutOrder.paymentProvider === 'cod') {
    const order = await orderRepository.findOrderByIdForUser(
      checkoutOrder.id,
      user.id
    );

    return orderResponse(order);
  }

  let paymentIntent;

  try {
    paymentIntent = await stripeService.createPaymentIntent({
      amount: toCents(checkoutOrder.totalAmount),
      currency: checkoutOrder.currency,
      orderId: checkoutOrder.id,
      userId: user.id,
      receiptEmail: user.email,
    });

    await sequelize.transaction(async (transaction) => {
      const order = await orderRepository.findOrderById(checkoutOrder.id, {
        transaction,
      });

      await orderRepository.updateOrder(
        order,
        {
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
        },
        { transaction }
      );
    });

    const order = await orderRepository.findOrderByIdForUser(
      checkoutOrder.id,
      user.id
    );

    return orderResponse(order);
  } catch (error) {
    if (paymentIntent?.id) {
      try {
        await stripeService.cancelPaymentIntent(paymentIntent.id);
      } catch {
        // Keep the original checkout error; webhook handling will reconcile later.
      }
    }

    await cancelReservedOrder(checkoutOrder.id, 'failed');
    throw error;
  }
}

export async function retryPayment(user, orderId) {
  const retryOrder = await sequelize.transaction(async (transaction) => {
    const order = await orderRepository.findOrderByIdForUpdate(orderId, {
      transaction,
      lock: true,
    });

    if (!order || order.userId !== user.id) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentProvider !== 'stripe') {
      throw new AppError('Only Stripe orders can retry payment', 400);
    }

    if (!['failed', 'cancelled'].includes(order.paymentStatus)) {
      throw new AppError('Only failed or cancelled payments can be retried', 400);
    }

    for (const item of order.items ?? []) {
      assertProductAvailable(item.product);

      const reserved = await productRepository.reserveProductStock(
        item.productId,
        item.quantity,
        { transaction }
      );

      if (!reserved) {
        throw new AppError(
          `${item.productName} does not have enough stock for payment retry`,
          400
        );
      }
    }

    await orderRepository.updateOrder(
      order,
      {
        status: 'pending',
        paymentStatus: 'pending',
        stripePaymentIntentId: null,
        stripeClientSecret: null,
      },
      { transaction }
    );

    return {
      id: order.id,
      totalAmount: order.totalAmount,
      currency: order.currency,
    };
  });

  let paymentIntent;

  try {
    paymentIntent = await stripeService.createPaymentIntent({
      amount: toCents(retryOrder.totalAmount),
      currency: retryOrder.currency,
      orderId: retryOrder.id,
      userId: user.id,
      receiptEmail: user.email,
      idempotencyKey: `order:${retryOrder.id}:retry:${Date.now()}`,
    });

    await sequelize.transaction(async (transaction) => {
      const order = await orderRepository.findOrderById(retryOrder.id, {
        transaction,
      });

      await orderRepository.updateOrder(
        order,
        {
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
        },
        { transaction }
      );
    });

    const order = await orderRepository.findOrderByIdForUser(
      retryOrder.id,
      user.id
    );

    return orderResponse(order);
  } catch (error) {
    if (paymentIntent?.id) {
      try {
        await stripeService.cancelPaymentIntent(paymentIntent.id);
      } catch {
        // Keep the original retry error; webhook handling will reconcile later.
      }
    }

    await cancelReservedOrder(retryOrder.id, 'failed');
    throw error;
  }
}

export async function updateOrderStatus(orderId, status) {
  await sequelize.transaction(async (transaction) => {
    const order = await orderRepository.findOrderByIdForUpdate(orderId, {
      transaction,
      lock: true,
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status === 'cancelled') {
      throw new AppError('Cancelled orders cannot be updated', 400);
    }

    if (status === 'cancelled') {
      if (order.paymentProvider === 'stripe' && order.paymentStatus === 'succeeded') {
        throw new AppError('Refund paid Stripe orders before cancelling', 400);
      }

      await restoreReservedStock(order, transaction);
    }

    await orderRepository.updateOrder(
      order,
      {
        status,
        ...(status === 'cancelled' && order.paymentStatus === 'pending'
          ? { paymentStatus: 'cancelled' }
          : {}),
      },
      { transaction }
    );
  });

  const order = await orderRepository.findOrderById(orderId);

  return orderResponse(order);
}

export async function updateCodPaymentStatus(orderId, paymentStatus) {
  await sequelize.transaction(async (transaction) => {
    const order = await orderRepository.findOrderByIdForUpdate(orderId, {
      transaction,
      lock: true,
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentProvider !== 'cod') {
      throw new AppError('Only COD payment status can be updated manually', 400);
    }

    if (order.status === 'cancelled') {
      throw new AppError('Cancelled orders cannot be updated', 400);
    }

    if (paymentStatus === 'succeeded') {
      await orderRepository.updateOrder(
        order,
        {
          paymentStatus,
          status: order.status === 'pending' ? 'paid' : order.status,
        },
        { transaction }
      );
      return;
    }

    if (['failed', 'cancelled'].includes(paymentStatus)) {
      await restoreReservedStock(order, transaction);
      await orderRepository.updateOrder(
        order,
        {
          paymentStatus,
          status: 'cancelled',
        },
        { transaction }
      );
      return;
    }

    await orderRepository.updateOrder(order, { paymentStatus }, { transaction });
  });

  const order = await orderRepository.findOrderById(orderId);

  return orderResponse(order);
}

export async function cancelOrder(userId, orderId) {
  const order = await orderRepository.findOrderByIdForUser(orderId, userId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.status !== 'pending' || order.paymentStatus !== 'pending') {
    throw new AppError('Only pending orders can be cancelled', 400);
  }

  if (order.stripePaymentIntentId) {
    await stripeService.cancelPaymentIntent(order.stripePaymentIntentId);
  }

  await cancelReservedOrder(order.id, 'cancelled');

  const cancelledOrder = await orderRepository.findOrderByIdForUser(
    orderId,
    userId
  );

  return orderResponse(cancelledOrder);
}

export async function handleStripeWebhook(rawBody, signature) {
  const event = stripeService.constructWebhookEvent(rawBody, signature);
  const paymentIntent = event.data.object;

  if (event.type === 'payment_intent.succeeded') {
    await markPaymentSucceeded(paymentIntent.id);
  }

  if (event.type === 'payment_intent.payment_failed') {
    await markPaymentFailed(paymentIntent.id);
  }

  if (event.type === 'payment_intent.canceled') {
    await markPaymentCancelled(paymentIntent.id);
  }

  return {
    received: true,
  };
}

async function markPaymentSucceeded(paymentIntentId) {
  await sequelize.transaction(async (transaction) => {
    const order = await orderRepository.findOrderByPaymentIntentId(
      paymentIntentId,
      { transaction }
    );

    if (
      !order ||
      order.status !== 'pending' ||
      order.paymentStatus !== 'pending'
    ) {
      return;
    }

    await orderRepository.updateOrder(
      order,
      {
        status: 'paid',
        paymentStatus: 'succeeded',
      },
      { transaction }
    );

    const cart = await cartRepository.findOrCreateCartByUserId(order.userId, {
      transaction,
    });

    await cartRepository.clearCartItems(cart.id, { transaction });
  });
}

async function markPaymentFailed(paymentIntentId) {
  const order = await orderRepository.findOrderByPaymentIntentId(paymentIntentId);

  if (!order || order.paymentStatus !== 'pending') {
    return;
  }

  await cancelReservedOrder(order.id, 'failed');
}

async function markPaymentCancelled(paymentIntentId) {
  const order = await orderRepository.findOrderByPaymentIntentId(paymentIntentId);

  if (!order || order.paymentStatus !== 'pending') {
    return;
  }

  await cancelReservedOrder(order.id, 'cancelled');
}
