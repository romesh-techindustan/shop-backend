import { productResponse } from '../dto/product-response.dto.js';
import { AppError } from '../middleware/error-response.js';
import * as productRepository from '../repositories/product.repository.js';
import { getRatingSummariesByProductIds } from '../repositories/rating.repository.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

function parsePositiveInteger(value, fallback) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

function parseBoolean(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalizedValue = String(value).trim().toLowerCase();

  if (normalizedValue === 'true') {
    return true;
  }

  if (normalizedValue === 'false') {
    return false;
  }

  return fallback;
}

function mergeProductRatingSummary(product, ratingSummaries) {
  const plainProduct =
    product && typeof product.get === 'function'
      ? product.get({ plain: true })
      : product;

  return {
    ...plainProduct,
    ...(ratingSummaries.get(plainProduct.id) ?? {
      averageRating: 0,
      ratingCount: 0,
    }),
  };
}

export async function getProducts(query = {}) {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const limit = Math.min(
    parsePositiveInteger(query.limit, DEFAULT_LIMIT),
    MAX_LIMIT
  );

  const search = typeof query.search === 'string' ? query.search.trim() : undefined;
  const category =
    typeof query.category === 'string' ? query.category.trim() : undefined;

  const { rows, count } = await productRepository.getProducts({
    page,
    limit,
    search: search || undefined,
    category: category || undefined,
    isActive: parseBoolean(query.isActive, true),
  });

  const ratingSummaries = await getRatingSummariesByProductIds(
    rows.map((product) => product.id)
  );

  return {
    items: rows.map((product) =>
      productResponse(mergeProductRatingSummary(product, ratingSummaries))
    ),
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages: count === 0 ? 0 : Math.ceil(count / limit),
    },
  };
}

export async function getProductById(id) {
  const product = await productRepository.getProductById(id);
  const ratingSummaries = await getRatingSummariesByProductIds([product.id]);

  return productResponse(mergeProductRatingSummary(product, ratingSummaries));
}

export async function getCategories() {
  return productRepository.getDistinctCategories();
}

export async function getProductsByCategory(category){
  if (category.trim()===""){
    throw new AppError('Please provide a valid category', 400)
  }

  const products = await productRepository.getProductsByCategory(category);
  const ratingSummaries = await getRatingSummariesByProductIds(
    products.map((product) => product.id)
  );

  return products.map((product) =>
    productResponse(mergeProductRatingSummary(product, ratingSummaries))
  );
}
