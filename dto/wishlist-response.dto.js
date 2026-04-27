import { productResponse } from "./product-response.dto.js";

function asPlainRecord(model) {
  if (model && typeof model.get === "function") {
    return model.get({ plain: true });
  }

  return model;
}

function wishlistItemResponse(itemModel) {
  const item = asPlainRecord(itemModel);

  return {
    id: item.id,
    userId: item.userId,
    productId: item.productId,
    product: productResponse(item.product),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function wishlistResponse(items = []) {
  const wishlistItems = items.map(wishlistItemResponse);

  return {
    totalItems: wishlistItems.length,
    items: wishlistItems,
  };
}
