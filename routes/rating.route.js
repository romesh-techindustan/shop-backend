import express from "express";
import * as ratingController from "../controllers/rating.controller.js";
import { createRatingDTO, updateRatingDTO } from "../dto/rating.dto.js";
import asyncHandler from "../middleware/async-handler.js";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.get("/products/:productId", asyncHandler(ratingController.getProductRatings));

router.use(authenticate);

router.get("/me", asyncHandler(ratingController.getMyRatings));
router.post("/", validate(createRatingDTO), asyncHandler(ratingController.createRating));
router.patch(
  "/:ratingId",
  validate(updateRatingDTO),
  asyncHandler(ratingController.updateRating)
);
router.delete("/:ratingId", asyncHandler(ratingController.deleteRating));

export default router;
