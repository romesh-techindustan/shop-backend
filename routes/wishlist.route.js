import express from "express";
import * as wishlistController from "../controllers/wishlist.controller.js";
import { addWishlistItemDTO, updateWishlistItemDTO } from "../dto/wishlist.dto.js";
import asyncHandler from "../middleware/async-handler.js";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.use(authenticate);

router.get("/", asyncHandler(wishlistController.getWishlist));
router.post("/items", validate(addWishlistItemDTO), asyncHandler(wishlistController.addItem));
router.patch(
  "/items/:itemId",
  validate(updateWishlistItemDTO),
  asyncHandler(wishlistController.updateItem)
);
router.delete("/items/:itemId", asyncHandler(wishlistController.removeItem));
router.delete("/products/:productId", asyncHandler(wishlistController.removeProduct));
router.delete("/", asyncHandler(wishlistController.clearWishlist));

export default router;
