import sequelize from "../config/database.js";
import { wishlistResponse } from "../dto/wishlist-response.dto.js";
import { AppError } from "../middleware/error-response.js";
import { getProductById } from "../repositories/product.repository.js";
import * as wishlistRepository from "../repositories/wishlist.repository.js";

async function getActiveProduct(productId) {
  const product = await getProductById(productId);

  if (product.isActive === false) {
    throw new AppError("Product is not available", 400);
  }

  return product;
}

export async function getWishlist(userId) {
  const items = await wishlistRepository.findWishlistByUserId(userId);

  return wishlistResponse(items);
}

export async function addWishlistItem(userId, data) {
  const product = await getActiveProduct(data.productId);

  await sequelize.transaction(async (transaction) => {
    const existingItem = await wishlistRepository.findWishlistItemByProductId(
      userId,
      product.id,
      { transaction }
    );

    if (existingItem) {
      throw new AppError("Product is already in wishlist", 409);
    }

    await wishlistRepository.createWishlistItem(
      {
        userId,
        productId: product.id,
      },
      { transaction }
    );
  });

  return getWishlist(userId);
}

export async function updateWishlistItem(userId, itemId, data) {
  const product = await getActiveProduct(data.productId);

  await sequelize.transaction(async (transaction) => {
    const wishlistItem = await wishlistRepository.findWishlistItemById(
      userId,
      itemId,
      { transaction }
    );

    if (!wishlistItem) {
      throw new AppError("Wishlist item not found", 404);
    }

    const matchingItem = await wishlistRepository.findWishlistItemByProductId(
      userId,
      product.id,
      { transaction }
    );

    if (matchingItem && matchingItem.id !== wishlistItem.id) {
      throw new AppError("Product is already in wishlist", 409);
    }

    await wishlistRepository.updateWishlistItem(
      wishlistItem,
      { productId: product.id },
      { transaction }
    );
  });

  return getWishlist(userId);
}

export async function removeWishlistItem(userId, itemId) {
  await sequelize.transaction(async (transaction) => {
    const wishlistItem = await wishlistRepository.findWishlistItemById(
      userId,
      itemId,
      { transaction }
    );

    if (!wishlistItem) {
      throw new AppError("Wishlist item not found", 404);
    }

    await wishlistRepository.deleteWishlistItem(wishlistItem, { transaction });
  });

  return getWishlist(userId);
}

export async function removeWishlistProduct(userId, productId) {
  await sequelize.transaction(async (transaction) => {
    const wishlistItem = await wishlistRepository.findWishlistItemByProductId(
      userId,
      productId,
      { transaction }
    );

    if (!wishlistItem) {
      throw new AppError("Wishlist item not found", 404);
    }

    await wishlistRepository.deleteWishlistItem(wishlistItem, { transaction });
  });

  return getWishlist(userId);
}

export async function clearWishlist(userId) {
  await wishlistRepository.clearWishlist(userId);

  return getWishlist(userId);
}
