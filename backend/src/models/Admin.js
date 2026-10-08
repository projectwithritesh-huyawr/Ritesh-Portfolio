import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, select: false },
  tokenVersion: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);
