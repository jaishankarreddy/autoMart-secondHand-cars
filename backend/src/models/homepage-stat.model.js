const mongoose = require('mongoose');

const SUPPORTED_SECTIONS = ['hero', 'section'];

const HomepageStatSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true }, // e.g. "hero_cars"
    value: { type: String, required: true }, // "500"
    label: { type: String, default: '' }, // "Cars"
    section: { type: String, enum: SUPPORTED_SECTIONS, default: 'hero' },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomepageStat', HomepageStatSchema);