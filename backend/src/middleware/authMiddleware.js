import jwt from 'jsonwebtoken';
import { isDatabaseConnected } from '../config/database.js';
import Admin from '../models/Admin.js';

export const requireAdmin = async (req, res, next) => {
  const token = req.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' });
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({ success: false, message: 'Authentication is not configured.' });
  }
  if (!isDatabaseConnected()) {
    return res.status(503).json({ success: false, message: 'Database service is not configured.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(payload.sub);
    if (!admin || payload.tokenVersion !== admin.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    req.admin = admin;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    return next(error);
  }
};
