import mongoose from 'mongoose';

const captionSchema = new mongoose.Schema({
  videoUrl: { type: String, required: true, unique: true },
  text: { type: String },
  status: { type: String, enum: ['processing', 'completed', 'error'], default: 'processing' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Caption = mongoose.model('Caption', captionSchema);
