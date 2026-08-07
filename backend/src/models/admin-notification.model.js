const mongoose = require('mongoose');

const NOTIFICATION_TYPES = ['offer', 'contact', 'listing', 'system'];

const AdminNotificationSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true, trim: true }, // e.g. "N-3"
    text: { type: String, required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, default: 'system', index: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null }, // null = broadcast
    unread: { type: Boolean, default: true, index: true },
    entityId: { type: String, default: '' } // related offer/contact id
  },
  { timestamps: true }
);

AdminNotificationSchema.index({ unread: 1, createdAt: -1 });

module.exports = mongoose.model('AdminNotification', AdminNotificationSchema);