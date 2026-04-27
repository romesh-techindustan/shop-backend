import express from "express";
import asyncHandler from "../middleware/async-handler.js";
import * as stripeWebhookController from "../controllers/stripe-webhook.controller.js";

const router = express.Router();

router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(stripeWebhookController.stripeWebhook)
);

export default router;
