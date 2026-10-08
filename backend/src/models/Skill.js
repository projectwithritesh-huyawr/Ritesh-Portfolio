import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  icon: { type: String, default: '', trim: true, maxlength: 100 },
  order: { type: Number, default: 0, min: 0, max: 10000 }
}, { timestamps: true });

skillSchema.index({ order: 1, name: 1 });

export default mongoose.model('Skill', skillSchema);
