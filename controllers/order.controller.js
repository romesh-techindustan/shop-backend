import * as orderService from '../services/order.service.js';

export async function getOrders(req, res) {
  const orders = await orderService.getOrders(req.user.id);

  res.success(orders, 'Orders retrieved successfully');
}

export async function getOrderById(req, res) {
  const order = await orderService.getOrderById(req.user.id, req.params.orderId);

  res.success(order, 'Order retrieved successfully');
}

export async function getCurrentCheckout(req, res) {
  const order = await orderService.getCurrentCheckout(req.user.id);

  res.success(order, 'Current checkout retrieved successfully');
}

export async function previewOrder(req, res) {
  const preview = await orderService.previewOrder(req.user.id, req.validatedData);

  res.success(preview, 'Order preview calculated successfully');
}

export async function getAdminOrders(req, res) {
  const orders = await orderService.getAdminOrders(req.query);

  res.success(orders, 'Orders retrieved successfully');
}

export async function checkout(req, res) {
  const order = await orderService.createCheckout(req.user, req.validatedData);

  res.success(order, 'Checkout created successfully', 201);
}

export async function retryPayment(req, res) {
  const order = await orderService.retryPayment(req.user, req.params.orderId);

  res.success(order, 'Payment retry created successfully');
}

export async function cancelOrder(req, res) {
  const order = await orderService.cancelOrder(req.user.id, req.params.orderId);

  res.success(order, 'Order cancelled successfully');
}

export async function updateOrderStatus(req, res) {
  const order = await orderService.updateOrderStatus(
    req.params.orderId,
    req.validatedData.status
  );

  res.success(order, 'Order status updated successfully');
}

export async function updatePaymentStatus(req, res) {
  const order = await orderService.updateCodPaymentStatus(
    req.params.orderId,
    req.validatedData.paymentStatus
  );

  res.success(order, 'Payment status updated successfully');
}

export async function stripeWebhook(req, res) {
  const result = await orderService.handleStripeWebhook(
    req.body,
    req.headers['stripe-signature']
  );

  res.status(200).json(result);
}
