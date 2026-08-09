const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: { type: String, default: '', unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user'], default: 'user' },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    avatar: { type: String, default: '' },
    wishlist: { type: [String], default: [] },
    preferences: {
      notifyOffers: { type: Boolean, default: true },
      notifyNewsletter: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

UserSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);