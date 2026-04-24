function asPlainRecord(model) {
  if (model && typeof model.get === 'function') {
    return model.get({ plain: true });
  }

  return model;
}

function toMoneyNumber(value) {
  return Number(Number(value ?? 0).toFixed(2));
}

export function productResponse(productModel) {
  const product = asPlainRecord(productModel);

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    image: product.image,
    description: product.description,
    category: product.category,
    color: product.color,
    size: product.size,
    price: toMoneyNumber(product.price),
    stock: Number(product.stock ?? 0),
    isActive: product.isActive !== false,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
