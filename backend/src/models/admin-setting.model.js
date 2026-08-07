const mongoose = require('mongoose');

const NOTIFICATION_TOGGLES = [
  { key: 'offerAlerts', label: 'New offer alerts', default: true },
  { key: 'contactAlerts', label: 'Contact enquiry alerts', default: true },
  { key: 'weeklyDigest', label: 'Weekly digest', default: false },
  { key: 'listingUpdates', label: 'Listing updates', default: true }
];

const MARKETPLACE_TOGGLES = [
  { key: 'autoApprove', label: 'Auto-approve listings', default: false },
  { key: 'showDriveAwayPrices', label: 'Show drive-away prices', default: true },
  { key: 'whatsappOffers', label: 'WhatsApp offer notifications', default: true }
];

const toggleDefaults = (toggles) =>
  Object.fromEntries(toggles.map((t) => [t.key, t.default]));

const AdminSettingSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      unique: true,
      index: true
    },
    profile: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    notifications: {
      type: Map,
      of: Boolean,
      default: () => toggleDefaults(NOTIFICATION_TOGGLES)
    },
    marketplace: {
      type: Map,
      of: Boolean,
      default: () => toggleDefaults(MARKETPLACE_TOGGLES)
    },
    region: {
      location: { type: String, default: 'Karnataka, India' },
      currency: { type: String, default: '₹ INR' }
    }
  },
  { timestamps: true }
);

module.exports = {
  AdminSetting: mongoose.model('AdminSetting', AdminSettingSchema),
  NOTIFICATION_TOGGLES,
  MARKETPLACE_TOGGLES
};