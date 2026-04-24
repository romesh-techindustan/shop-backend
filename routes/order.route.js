import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { checkoutDTO } from '../dto/checkout.dto.js';
import {
  updateOrderStatusDTO,
  updatePaymentStatusDTO,
} from '../dto/order-management.dto.js';
import asyncHandler from '../middleware/async-handler.js';
import authenticate from '../middleware/authenticate.js';
import authorizeAdmin from '../middleware/authorize-admin.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(orderController.getOrders));
router.get('/current-checkout', asyncHandler(orderController.getCurrentCheckout));
router.post('/preview', validate(checkoutDTO), asyncHandler(orderController.previewOrder));
router.post('/checkout', validate(checkoutDTO), asyncHandler(orderController.checkout));
router.get(
  '/admin',
  authorizeAdmin,
  asyncHandler(orderController.getAdminOrders)
);
router.patch(
  '/admin/:orderId/status',
  authorizeAdmin,
  validate(updateOrderStatusDTO),
  asyncHandler(orderController.updateOrderStatus)
);
router.patch(
  '/admin/:orderId/payment-status',
  authorizeAdmin,
  validate(updatePaymentStatusDTO),
  asyncHandler(orderController.updatePaymentStatus)
);
router.get('/:orderId', asyncHandler(orderController.getOrderById));
router.post('/:orderId/retry-payment', asyncHandler(orderController.retryPayment));
router.post('/:orderId/cancel', asyncHandler(orderController.cancelOrder));

export default router;
