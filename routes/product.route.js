import express from 'express';
import * as productController from '../controllers/product.controller.js';
import asyncHandler from '../middleware/async-handler.js';

const router = express.Router();

router.get('/', asyncHandler(productController.getProducts));
router.get('/:id', asyncHandler(productController.getProductById));

export default router;
