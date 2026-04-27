import * as wishlistService from "../services/wishlist.service.js";

export async function getWishlist(req, res) {
  const wishlist = await wishlistService.getWishlist(req.user.id);

  res.success(wishlist, "Wishlist retrieved successfully");
}

export async function addItem(req, res) {
  const wishlist = await wishlistService.addWishlistItem(
    req.user.id,
    req.validatedData
  );

  res.success(wishlist, "Item added to wishlist successfully", 201);
}

export async function updateItem(req, res) {
  const wishlist = await wishlistService.updateWishlistItem(
    req.user.id,
    req.params.itemId,
    req.validatedData
  );

  res.success(wishlist, "Wishlist updated successfully");
}

export async function removeItem(req, res) {
  const wishlist = await wishlistService.removeWishlistItem(
    req.user.id,
    req.params.itemId
  );

  res.success(wishlist, "Item removed from wishlist successfully");
}

export async function removeProduct(req, res) {
  const wishlist = await wishlistService.removeWishlistProduct(
    req.user.id,
    req.params.productId
  );

  res.success(wishlist, "Item removed from wishlist successfully");
}

export async function clearWishlist(req, res) {
  const wishlist = await wishlistService.clearWishlist(req.user.id);

  res.success(wishlist, "Wishlist cleared successfully");
}
