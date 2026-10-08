import { isDatabaseConnected } from '../config/database.js';

export const requireDatabase = (req, res, next) => {
  if (!isDatabaseConnected()) {
    return res.status(503).json({ success: false, message: 'Database service is not configured.' });
  }
  return next();
};
