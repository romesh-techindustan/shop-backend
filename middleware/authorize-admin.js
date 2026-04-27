import { AppError } from './error-response.js';
import { isAdminUser } from '../utils/admin.js';

export default function authorizeAdmin(req, res, next) {
  if (!isAdminUser(req.user)) {
    return next(new AppError('Admin access required', 403));
  }

  next();
}
