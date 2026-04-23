import express from 'express';
import validate from '../middleware/validate.js';
import { signUpDTO } from '../dto/signup.dto.js';
import { loginDTO } from '../dto/login.dto.js';
import asyncHandler from '../middleware/async-handler.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/sign-up', validate(signUpDTO), asyncHandler(authController.signupController));
router.post('/login', validate(loginDTO), asyncHandler(authController.login));

export default router;
