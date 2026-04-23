import express from 'express';
import asyncHandler from '../middleware/async-handler.js';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

router.get("/", asyncHandler(userController.getAllUsers));
router.get("/:id", asyncHandler(userController.getUserById));

export default router;
