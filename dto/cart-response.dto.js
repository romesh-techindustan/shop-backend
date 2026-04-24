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

function cartItemResponse(itemModel) {
  const item = asPlainRecord(itemModel);
  const unitPrice = toMoneyNumber(item.priceAtTime);
  const quantity = Number(item.quantity ?? 0);

  return {
    id: item.id,
    productId: item.productId,
    quantity,
    selectedColor: item.selectedColor,
    selectedSize: item.selectedSize,
    unitPrice,
    lineTotal: toMoneyNumber(unitPrice * quantity),
    product: productResponse(item.product),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function cartResponse(cartModel) {
  const cart = asPlainRecord(cartModel);
  const items = (cart.items ?? []).map(cartItemResponse);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = toMoneyNumber(
    items.reduce((sum, item) => sum + item.lineTotal, 0)
  );

  return {
    id: cart.id,
    userId: cart.userId,
    totalItems,
    subtotal,
    items,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}
