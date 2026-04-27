import { Product, Wishlist } from "../models/associations.js";

const wishlistInclude = [
  {
    model: Product,
    as: "product",
  },
];

export async function findWishlistByUserId(userId, options = {}) {
  return Wishlist.findAll({
    where: { userId },
    include: wishlistInclude,
    order: [["createdAt", "DESC"]],
    transaction: options.transaction,
  });
}

export async function findWishlistItemById(userId, itemId, options = {}) {
  return Wishlist.findOne({
    where: {
      id: itemId,
      userId,
    },
    include: wishlistInclude,
    transaction: options.transaction,
  });
}

export async function findWishlistItemByProductId(userId, productId, options = {}) {
  return Wishlist.findOne({
    where: {
      userId,
      productId,
    },
    include: wishlistInclude,
    transaction: options.transaction,
  });
}

export async function createWishlistItem(data, options = {}) {
  return Wishlist.create(data, {
    transaction: options.transaction,
  });
}

export async function updateWishlistItem(item, data, options = {}) {
  await item.update(data, {
    transaction: options.transaction,
  });

  return item;
}

export async function deleteWishlistItem(item, options = {}) {
  return item.destroy({
    transaction: options.transaction,
  });
}

export async function clearWishlist(userId, options = {}) {
  return Wishlist.destroy({
    where: { userId },
    transaction: options.transaction,
  });
}
