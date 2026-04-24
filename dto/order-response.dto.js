import { productResponse } from './product-response.dto.js';

function asPlainRecord(model) {
  if (model && typeof model.get === 'function') {
    return model.get({ plain: true });
  }

  return model;
}

function toMoneyNumber(value) {
  return Number(Number(value ?? 0).toFixed(2));
}

function orderItemResponse(itemModel) {
  const item = asPlainRecord(itemModel);

  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    productSku: item.productSku,
    productImage: item.productImage,
    quantity: Number(item.quantity ?? 0),
    selectedColor: item.selectedColor,
    selectedSize: item.selectedSize,
    unitPrice: toMoneyNumber(item.unitPrice),
    lineTotal: toMoneyNumber(item.lineTotal),
    product: productResponse(item.product),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function orderResponse(orderModel) {
  const order = asPlainRecord(orderModel);
  const items = (order.items ?? []).map(orderItemResponse);

  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentProvider,
    paymentProvider: order.paymentProvider,
    subtotal: toMoneyNumber(order.subtotal),
    totalAmount: toMoneyNumber(order.totalAmount),
    currency: order.currency,
    shippingAddress: order.shippingAddress,
    stripePaymentIntentId: order.stripePaymentIntentId,
    clientSecret: order.stripeClientSecret,
    items,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
