const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: '' }, // "Bought Hyundai Creta · Bengaluru"
    quote: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    color: { type: String, default: '#4f46e5' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', TestimonialSchema);