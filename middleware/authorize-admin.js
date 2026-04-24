import { AppError } from './error-response.js';

export default function authorizeAdmin(req, res, next) {
  if (req.user?.isAdmin !== true) {
    return next(new AppError('Admin access is required', 403));
  }

  next();
}
