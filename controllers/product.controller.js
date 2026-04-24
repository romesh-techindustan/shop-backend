import * as productService from '../services/product.service.js';

export async function getProducts(req, res) {
  const products = await productService.getProducts(req.query);

  res.success(products, 'Products retrieved successfully');
}

export async function getProductById(req, res) {
  const product = await productService.getProductById(req.params.id);

  res.success(product, 'Product retrieved successfully');
}
