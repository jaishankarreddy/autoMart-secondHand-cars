const mongoose = require('mongoose');

const ContactStatusSchema = ['New', 'Replied'];

const ContactMessageSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true, trim: true }, // e.g. "C-1006"
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    status: { type: String, enum: ContactStatusSchema, default: 'New', index: true },
    repliedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

ContactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);