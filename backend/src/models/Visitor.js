import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  ipHash: { type: String, required: true, select: false },
  userAgent: { type: String, default: '', maxlength: 300 },
  page: { type: String, required: true, trim: true, maxlength: 120 },
  visitedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: false });

visitorSchema.index({ page: 1, visitedAt: -1 });

export default mongoose.model('Visitor', visitorSchema);
