import * as authService from '../services/auth.service.js';
import {userResponse } from '../dto/user-response.dto.js';

export const signupController = async (req, res) => {
  const user = await authService.signUpService(req.validatedData);
  const response = userResponse(user);

  res.success(response, 'User created successfully', 201);
};

export const login = async (req, res) => {
  const user = await authService.login(req.validatedData);
  const response = userResponse(user);

  res.success(response, 'User created successfully', 201);
};
