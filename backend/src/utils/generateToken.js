import jwt from 'jsonwebtoken';

export const generateToken = (admin) => jwt.sign(
  { sub: admin.id, tokenVersion: admin.tokenVersion },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
);
