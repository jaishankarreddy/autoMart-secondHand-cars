const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    vehicleId: { type: String, ref: 'Vehicle', required: true } // readable vehicles.id
  },
  { timestamps: true }
);

// A user can save a given vehicle once
WishlistSchema.index({ userId: 1, vehicleId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);