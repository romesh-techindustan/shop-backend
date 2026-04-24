import { Cart, CartItem, Product } from '../models/associations.js';

const cartInclude = [
  {
    model: CartItem,
    as: 'items',
    include: [
      {
        model: Product,
        as: 'product',
      },
    ],
  },
];

export async function findCartByUserId(userId, options = {}) {
  return Cart.findOne({
    where: { userId },
    include: cartInclude,
    order: [[{ model: CartItem, as: 'items' }, 'createdAt', 'ASC']],
    transaction: options.transaction,
  });
}

export async function findOrCreateCartByUserId(userId, options = {}) {
  const [cart] = await Cart.findOrCreate({
    where: { userId },
    defaults: { userId },
    transaction: options.transaction,
  });

  return cart;
}

export async function findCartItemById(cartId, itemId, options = {}) {
  return CartItem.findOne({
    where: {
      id: itemId,
      cartId,
    },
    include: [
      {
        model: Product,
        as: 'product',
      },
    ],
    transaction: options.transaction,
  });
}

export async function findMatchingCartItem(
  { cartId, productId, selectedColor = null, selectedSize = null },
  options = {}
) {
  return CartItem.findOne({
    where: {
      cartId,
      productId,
      selectedColor,
      selectedSize,
    },
    include: [
      {
        model: Product,
        as: 'product',
      },
    ],
    transaction: options.transaction,
  });
}

export async function createCartItem(data, options = {}) {
  return CartItem.create(data, {
    transaction: options.transaction,
  });
}

export async function updateCartItem(cartItem, data, options = {}) {
  await cartItem.update(data, {
    transaction: options.transaction,
  });

  return cartItem;
}

export async function deleteCartItem(cartItem, options = {}) {
  return cartItem.destroy({
    transaction: options.transaction,
  });
}

export async function clearCartItems(cartId, options = {}) {
  return CartItem.destroy({
    where: { cartId },
    transaction: options.transaction,
  });
}
