function asPlainRecord(model) {
  if (model && typeof model.get === "function") {
    return model.get({ plain: true });
  }

  return model;
}

export function ratingResponse(ratingModel) {
  const rating = asPlainRecord(ratingModel);

  if (!rating) {
    return null;
  }

  return {
    id: rating.id,
    userId: rating.userId,
    productId: rating.productId,
    score: Number(rating.score),
    review: rating.review,
    user: rating.user
      ? {
          id: rating.user.id,
          name: rating.user.name,
          email: rating.user.email,
        }
      : undefined,
    product: rating.product
      ? {
          id: rating.product.id,
          name: rating.product.name,
          image: rating.product.image,
        }
      : undefined,
    createdAt: rating.createdAt,
    updatedAt: rating.updatedAt,
  };
}

export function ratingSummaryResponse(summary = {}) {
  return {
    productId: summary.productId,
    averageRating: Number(Number(summary.averageRating ?? 0).toFixed(1)),
    ratingCount: Number(summary.ratingCount ?? 0),
  };
}
