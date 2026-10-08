import 'dotenv/config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import Admin from '../models/Admin.js';

try {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
    throw new Error('Set ADMIN_EMAIL, ADMIN_PASSWORD, and JWT_SECRET in backend/.env first.');
  }
  if (process.env.ADMIN_PASSWORD.length < 16) {
    throw new Error('ADMIN_PASSWORD must be at least 16 characters long.');
  }
  if (!await connectDatabase()) throw new Error('Set MONGODB_URI in backend/.env first.');

  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  if (await Admin.exists({ email })) throw new Error('An admin with ADMIN_EMAIL already exists; no account was changed.');

  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await Admin.create({ name: process.env.ADMIN_NAME || 'Ritesh Sahebrav Rajput', email, password });
  console.log('Initial admin account created. Keep backend/.env private.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
