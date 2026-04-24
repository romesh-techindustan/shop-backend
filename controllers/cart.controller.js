import * as cartService from '../services/cart.service.js';

export async function getCart(req, res) {
  const cart = await cartService.getCartByUserId(req.user.id);

  res.success(cart, 'Cart retrieved successfully');
}

export async function addItem(req, res) {
  const cart = await cartService.addItemToCart(req.user.id, req.validatedData);

  res.success(cart, 'Item added to cart successfully', 201);
}

export async function updateItem(req, res) {
  const cart = await cartService.updateCartItem(
    req.user.id,
    req.params.itemId,
    req.validatedData
  );

  res.success(cart, 'Cart updated successfully');
}

export async function removeItem(req, res) {
  const cart = await cartService.removeCartItem(req.user.id, req.params.itemId);

  res.success(cart, 'Item removed from cart successfully');
}

export async function clearCart(req, res) {
  const cart = await cartService.clearCart(req.user.id);

  res.success(cart, 'Cart cleared successfully');
}
