// Ayra Cars admin seeder
// Usage: node src/seed/seed.js
const mongoose = require('mongoose');
require('dotenv').config();

const { SEED_ADMIN } = require('./data/admin.data');
const Admin = require('../models/admin.model');

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayracars';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to MongoDB:', mongoose.connection.name);

  const admin = await Admin.findOne({ email: SEED_ADMIN.email });
  if (admin) {
    admin.name = SEED_ADMIN.name;
    admin.passwordHash = SEED_ADMIN.password;
    admin.role = SEED_ADMIN.role;
    await admin.save();
    console.log(`Updated admin (${SEED_ADMIN.email})`);
  } else {
    const doc = new Admin({ ...SEED_ADMIN, passwordHash: SEED_ADMIN.password });
    await doc.save();
    console.log(`Created admin (${SEED_ADMIN.email} / ${SEED_ADMIN.password})`);
  }

  await mongoose.disconnect();
  console.log('Seeding complete. MongoDB disconnected.');
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  });
}

module.exports = { seed };
