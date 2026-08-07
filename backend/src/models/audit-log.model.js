const mongoose = require('mongoose');

const AUDIT_ACTIONS = ['create', 'update', 'delete', 'login', 'status_change'];

const AuditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    action: { type: String, enum: AUDIT_ACTIONS, required: true },
    resource: { type: String, required: true, index: true }, // vehicle/offer/contact/brand
    entityId: { type: String, default: '' },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' }
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);