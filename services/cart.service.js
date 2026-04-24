import sequelize from '../config/database.js';
import { cartResponse } from '../dto/cart-response.dto.js';
import { AppError } from '../middleware/error-response.js';
import * as cartRepository from '../repositories/cart.repository.js';
import { getProductById } from '../repositories/product.repository.js';

function normalizeOptionalString(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function resolveSelections(product, payload = {}) {
  const selectedColor =
    normalizeOptionalString(payload.selectedColor) ??
    normalizeOptionalString(product.color);
  const selectedSize = payload.selectedSize ?? product.size ?? null;

  if (
    selectedColor &&
    product.color &&
    selectedColor.toLowerCase() !== product.color.toLowerCase()
  ) {
    throw new AppError(`Product is only available in ${product.color}`, 400);
  }

  if (selectedSize && product.size && selectedSize !== product.size) {
    throw new AppError(`Product is only available in size ${product.size}`, 400);
  }

  return {
    selectedColor,
    selectedSize,
  };
}

function assertProductCanBePurchased(product) {
  if (product.isActive === false) {
    throw new AppError('Product is not available', 400);
  }
}

function assertStockAvailable(product, quantity) {
  const stock = Number(product.stock);

  if (!Number.isNaN(stock) && stock < quantity) {
    throw new AppError(`Only ${stock} item(s) left in stock`, 400);
  }
}

function toCartSnapshot(cart) {
  return cartResponse(cart);
}

export async function getCartByUserId(userId) {
  const existingCart = await cartRepository.findCartByUserId(userId);

  if (existingCart) {
    return toCartSnapshot(existingCart);
  }

  const cart = await cartRepository.findOrCreateCartByUserId(userId);

  return toCartSnapshot({
    ...cart.get({ plain: true }),
    items: [],
  });
}

export async function addItemToCart(userId, data) {
  const product = await getProductById(data.productId);
  assertProductCanBePurchased(product);

  const selections = resolveSelections(product, data);

  await sequelize.transaction(async (transaction) => {
    const cart = await cartRepository.findOrCreateCartByUserId(userId, {
      transaction,
    });

    const matchingItem = await cartRepository.findMatchingCartItem(
      {
        cartId: cart.id,
        productId: product.id,
        ...selections,
      },
      { transaction }
    );

    if (matchingItem) {
      const nextQuantity = matchingItem.quantity + data.quantity;
      assertStockAvailable(product, nextQuantity);

      await cartRepository.updateCartItem(
        matchingItem,
        {
          quantity: nextQuantity,
          priceAtTime: product.price,
        },
        { transaction }
      );

      return;
    }

    assertStockAvailable(product, data.quantity);

    await cartRepository.createCartItem(
      {
        cartId: cart.id,
        productId: product.id,
        quantity: data.quantity,
        priceAtTime: product.price,
        ...selections,
      },
      { transaction }
    );
  });

  return getCartByUserId(userId);
}

export async function updateCartItem(userId, itemId, data) {
  await sequelize.transaction(async (transaction) => {
    const cart = await cartRepository.findOrCreateCartByUserId(userId, {
      transaction,
    });

    const cartItem = await cartRepository.findCartItemById(cart.id, itemId, {
      transaction,
    });

    if (!cartItem) {
      throw new AppError('Cart item not found', 404);
    }

    const product = cartItem.product ?? (await getProductById(cartItem.productId));
    assertProductCanBePurchased(product);

    const nextQuantity = data.quantity ?? cartItem.quantity;
    const selections = resolveSelections(product, {
      selectedColor: data.selectedColor ?? cartItem.selectedColor,
      selectedSize: data.selectedSize ?? cartItem.selectedSize,
    });

    const matchingItem = await cartRepository.findMatchingCartItem(
      {
        cartId: cart.id,
        productId: cartItem.productId,
        ...selections,
      },
      { transaction }
    );

    if (matchingItem && matchingItem.id !== cartItem.id) {
      const mergedQuantity = matchingItem.quantity + nextQuantity;
      assertStockAvailable(product, mergedQuantity);

      await cartRepository.updateCartItem(
        matchingItem,
        {
          quantity: mergedQuantity,
          priceAtTime: product.price,
        },
        { transaction }
      );

      await cartRepository.deleteCartItem(cartItem, { transaction });
      return;
    }

    assertStockAvailable(product, nextQuantity);

    await cartRepository.updateCartItem(
      cartItem,
      {
        quantity: nextQuantity,
        priceAtTime: product.price,
        ...selections,
      },
      { transaction }
    );
  });

  return getCartByUserId(userId);
}

export async function removeCartItem(userId, itemId) {
  await sequelize.transaction(async (transaction) => {
    const cart = await cartRepository.findOrCreateCartByUserId(userId, {
      transaction,
    });

    const cartItem = await cartRepository.findCartItemById(cart.id, itemId, {
      transaction,
    });

    if (!cartItem) {
      throw new AppError('Cart item not found', 404);
    }

    await cartRepository.deleteCartItem(cartItem, { transaction });
  });

  return getCartByUserId(userId);
}

export async function clearCart(userId) {
  await sequelize.transaction(async (transaction) => {
    const cart = await cartRepository.findOrCreateCartByUserId(userId, {
      transaction,
    });

    await cartRepository.clearCartItems(cart.id, { transaction });
  });

  return getCartByUserId(userId);
}
