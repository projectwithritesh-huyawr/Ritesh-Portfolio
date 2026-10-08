import bcrypt from 'bcrypt';
import Admin from '../models/Admin.js';
import { generateToken } from '../utils/generateToken.js';

export const login = async (req, res) => {
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({ success: false, message: 'Authentication is not configured.' });
  }

  const admin = await Admin.findOne({ email: req.body.email }).select('+password');
  const passwordMatches = admin && await bcrypt.compare(req.body.password, admin.password);
  if (!passwordMatches) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  return res.json({
    success: true,
    data: { token: generateToken(admin), admin: { id: admin.id, name: admin.name, email: admin.email } },
    message: 'Signed in successfully.'
  });
};

export const me = (req, res) => res.json({
  success: true,
  data: { id: req.admin.id, name: req.admin.name, email: req.admin.email },
  message: 'Admin session is valid.'
});

export const logout = async (req, res) => {
  await Admin.updateOne({ _id: req.admin.id }, { $inc: { tokenVersion: 1 } });
  return res.json({ success: true, message: 'Signed out successfully.' });
};
