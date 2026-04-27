import { ratingResponse, ratingSummaryResponse } from "../dto/rating-response.dto.js";
import { AppError } from "../middleware/error-response.js";
import { getProductById } from "../repositories/product.repository.js";
import * as ratingRepository from "../repositories/rating.repository.js";

function normalizeReview(review) {
  if (typeof review !== "string") {
    return null;
  }

  const trimmed = review.trim();

  return trimmed ? trimmed : null;
}

async function getRatingForUserOrFail(userId, ratingId) {
  const rating = await ratingRepository.findRatingByIdForUser(userId, ratingId);

  if (!rating) {
    throw new AppError("Rating not found", 404);
  }

  return rating;
}

export async function getProductRatings(productId) {
  await getProductById(productId);

  const [ratings, summary] = await Promise.all([
    ratingRepository.findRatingsByProductId(productId),
    ratingRepository.getRatingSummaryByProductId(productId),
  ]);

  return {
    summary: ratingSummaryResponse(summary),
    items: ratings.map(ratingResponse),
  };
}

export async function getMyRatings(userId) {
  const ratings = await ratingRepository.findRatingsByUserId(userId);

  return ratings.map(ratingResponse);
}

export async function createRating(userId, data) {
  await getProductById(data.productId);

  const existingRating = await ratingRepository.findRatingByUserAndProduct(
    userId,
    data.productId
  );

  if (existingRating) {
    throw new AppError("You have already rated this product", 409);
  }

  const rating = await ratingRepository.createRating({
    userId,
    productId: data.productId,
    score: data.score,
    review: normalizeReview(data.review),
  });

  return ratingResponse(rating);
}

export async function updateRating(userId, ratingId, data) {
  const rating = await getRatingForUserOrFail(userId, ratingId);

  const updatedRating = await ratingRepository.updateRating(rating, {
    ...(data.score !== undefined ? { score: data.score } : {}),
    ...(data.review !== undefined ? { review: normalizeReview(data.review) } : {}),
  });

  return ratingResponse(updatedRating);
}

export async function deleteRating(userId, ratingId) {
  const rating = await getRatingForUserOrFail(userId, ratingId);

  await ratingRepository.deleteRating(rating);

  return { id: ratingId };
}
