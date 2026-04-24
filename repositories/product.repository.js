import { Op } from 'sequelize';
import { AppError } from '../middleware/error-response.js';
import sequelize from '../config/database.js';
import Product from '../models/product.model.js';

export async function createProduct(data) {
  return Product.create(data);
}

export async function updateProduct(id, data) {
  const existingProduct = await Product.findOne({
    where: { id },
  });

  if (!existingProduct) {
    return null;
  }

  await existingProduct.update(data);

  return existingProduct;
}

export async function getProductById(id) {
  const product = await Product.findOne({
    where: { id },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
}

export async function getProductByID(id) {
  return getProductById(id);
}

export async function getProducts({
  category,
  search,
  page = 1,
  limit = 12,
  isActive = true,
} = {}) {
  const where = {};

  if (category) {
    where.category = category;
  }

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { sku: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  return Product.findAndCountAll({
    where,
    limit,
    offset: (page - 1) * limit,
    order: [['createdAt', 'DESC']],
  });
}

export async function getProductsByCategory(category) {
  return Product.findAll({
    where: {
      category,
      isActive: true,
    },
    order: [['createdAt', 'DESC']],
  });
}

export async function reserveProductStock(productId, quantity, options = {}) {
  const [affectedCount] = await Product.update(
    {
      stock: sequelize.literal(`stock - ${Number(quantity)}`),
    },
    {
      where: {
        id: productId,
        stock: {
          [Op.gte]: quantity,
        },
      },
      transaction: options.transaction,
    }
  );

  return affectedCount > 0;
}

export async function restoreProductStock(productId, quantity, options = {}) {
  return Product.increment('stock', {
    by: quantity,
    where: {
      id: productId,
    },
    transaction: options.transaction,
  });
}

export async function getUniqueCategories() {
  const categories = await Product.findAll({
    attributes: ['category'],
    where: {
      isActive: true,
    },
    group: ['category'],
    order: [['category', 'ASC']],
    raw: true,
  });

  return categories.map((item) => item.category);
}
