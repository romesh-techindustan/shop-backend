import { z } from "zod";

const scoreSchema = z.coerce
  .number()
  .int("Rating must be a whole number")
  .min(1, "Rating must be at least 1")
  .max(5, "Rating cannot exceed 5");

const reviewSchema = z
  .string()
  .trim()
  .max(1000, "Review is too long")
  .optional();

export const createRatingDTO = z.object({
  productId: z.string().uuid("A valid product id is required"),
  score: scoreSchema,
  review: reviewSchema,
});

export const updateRatingDTO = z
  .object({
    score: scoreSchema.optional(),
    review: reviewSchema,
  })
  .refine(
    (value) => value.score !== undefined || value.review !== undefined,
    {
      message: "At least one rating field must be provided",
    }
  );
