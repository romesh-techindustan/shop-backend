import express from 'express';
import authenticate from '../middleware/authenticate.js';
import asyncHandler from '../middleware/async-handler.js';
import * as orderController from '../controllers/order.controller.js';

const router = express.Router();
router.use(authenticate);

router.get("/orders", asyncHandler(orderController.getAdminOrders))
router.patch("orders/:id/status", asyncHandler(orderController.updateOrderStatus))
router.patch("orders/:id/payment-status", asyncHandler(orderController.updatePaymentStatus))

export default router;