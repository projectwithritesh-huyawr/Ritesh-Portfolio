import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 140 },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  technologies: { type: [String], default: [], validate: (items) => items.length <= 30 },
  image: { type: String, default: '', trim: true, maxlength: 1000 },
  githubUrl: { type: String, default: '', trim: true, maxlength: 2048 },
  liveUrl: { type: String, default: '', trim: true, maxlength: 2048 },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0, min: 0, max: 10000 }
}, { timestamps: true });

projectSchema.index({ featured: -1, order: 1, createdAt: -1 });

export default mongoose.model('Project', projectSchema);
