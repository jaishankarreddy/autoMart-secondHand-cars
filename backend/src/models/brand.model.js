const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, default: '' }, // monogram e.g. "H"
    color: { type: String, default: '#2563eb' }, // accent hex
    logo: { type: String, default: '' }, // CDN URL
    type: { type: String, enum: ['car', 'bike', 'both'], default: 'both' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Brand', BrandSchema);