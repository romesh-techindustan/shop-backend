import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { addCartItemDTO, updateCartItemDTO } from '../dto/cart-item.dto.js';
import asyncHandler from '../middleware/async-handler.js';
import authenticate from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(cartController.getCart));
router.post('/items', validate(addCartItemDTO), asyncHandler(cartController.addItem));
router.patch(
  '/items/:itemId',
  validate(updateCartItemDTO),
  asyncHandler(cartController.updateItem)
);
router.delete('/items/:itemId', asyncHandler(cartController.removeItem));
router.delete('/', asyncHandler(cartController.clearCart));

export default router;
