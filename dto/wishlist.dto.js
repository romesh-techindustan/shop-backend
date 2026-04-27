import { z } from "zod";

export const addWishlistItemDTO = z.object({
  productId: z.string().uuid("A valid product id is required"),
});

export const updateWishlistItemDTO = z.object({
  productId: z.string().uuid("A valid product id is required"),
});
