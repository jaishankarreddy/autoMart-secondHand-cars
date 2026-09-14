// Ayra Cars database seeder
// Usage: node src/seed/seed.js        (upsert without wiping)
//        node src/seed/seed.js --drop (wipe collections first)
const mongoose = require('mongoose');
require('dotenv').config();

const { CARS } = require('./data/cars.data');
const { BIKES } = require('./data/bikes.data');
const { VEHICLE_DETAILS } = require('./data/vehicle-details.data');
const { BRANDS } = require('./data/brands.data');
const { STATS, TESTIMONIALS, FAQS } = require('./data/home.data');
const { OFFERS, CONTACTS, NOTIFICATIONS, SEED_USERS, SEED_ADMIN } = require('./data/admin.data');

const Vehicle = require('../models/vehicle.model');
const Brand = require('../models/brand.model');
const HomepageStat = require('../models/homepage-stat.model');
const Testimonial = require('../models/testimonial.model');
const Faq = require('../models/faq.model');
const VehicleOffer = require('../models/vehicle-offer.model');
const ContactMessage = require('../models/contact-message.model');
const AdminNotification = require('../models/admin-notification.model');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');

const SHIPPED_IDS = new Set(['c2', 'c8', 'c5', 'b7', 'b2']);

function stampDate(dateStr) {
  // Convert the human-friendly date strings to legitimate Date objects.
  const base = Date.now();
  const today = new Date(base);
  if (dateStr.startsWith('Today')) return today;
  if (dateStr.startsWith('Yesterday')) {
    const d = new Date(base);
    d.setDate(d.getDate() - 1);
    return d;
  }
  const m = /^([A-Za-z]{3}) (\d{1,2}), (\d{1,2}:\d{2} (?:AM|PM))$/.exec(dateStr);
  if (m) {
    const hoursStr = `${m[2]} ${m[3]}`;
    const normalized = hoursStr.replace(/(\d{1,2}):(\d{2}) (AM|PM)/, (_, h, mi, ap) => {
      let hour = parseInt(h, 10);
      if (ap === 'PM' && hour !== 12) hour += 12;
      if (ap === 'AM' && hour === 12) hour = 0;
      return `${String(hour).padStart(2, '0')}:${mi}`;
    });
    return new Date(normalized);
  }
  return new Date();
}

function buildVehicles() {
  const cars = CARS.map((c) => ({ ...c, vehicleType: 'car' }));
  const bikes = BIKES.map((b) => ({ ...b, vehicleType: 'bike' }));
  const vehicles = [...cars, ...bikes];

  // Merge rich detail rows (features, gallery, seller, availability, registration...)
  const detailsById = new Map(VEHICLE_DETAILS.map((d) => [d.id, d]));
  return vehicles.map((v) => {
    const detail = detailsById.get(v.id) || {};
    const status = SHIPPED_IDS.has(v.id) ? 'sold' : detail.availability || 'available';
    return {
      ...v,
      availability: status,
      engine: detail.engine || (v.engineCC ? `${v.engineCC} cc` : 'Electric'),
      power: detail.power || '',
      registration: detail.registration || '',
      insurance: detail.insurance || '',
      image: v.image,
      images: detail.images || [v.image],
      description: detail.description || ['Ayra Cars certified vehicle.'],
      features: detail.features || [],
      seller: detail.seller || { name: 'Ayra Cars Certified', verified: true }
    };
  });
}

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayracars';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to MongoDB:', mongoose.connection.name);
  const drop = process.argv.includes('--drop');
  const modelList = [
    'Vehicle', 'Brand', 'HomepageStat', 'Testimonial', 'Faq',
    'VehicleOffer', 'ContactMessage', 'AdminNotification', 'User', 'Admin',
    'AdminSetting', 'Comparison', 'AuditLog'
  ];
  if (drop) {
    for (const name of modelList) {
      const model = mongoose.models[name];
      if (model) await model.collection.drop().catch(() => {});
    }
    console.log('Dropped existing collections.');
  }

  // Vehicles (subset at the core)
  const vehicles = buildVehicles();
  for (const v of vehicles) {
    await Vehicle.findOneAndUpdate({ id: v.id }, v, { upsert: true, new: true });
  }
  console.log(`Seeded ${vehicles.length} vehicles`);

  // Brands
  for (const b of BRANDS) {
    await Brand.findOneAndUpdate({ name: b.name }, b, { upsert: true });
  }
  console.log(`Seeded ${BRANDS.length} brands`);

  // Homepage config
  for (const s of STATS) await HomepageStat.findOneAndUpdate({ key: s.key }, s, { upsert: true });
  for (const t of TESTIMONIALS) await Testimonial.create(t);
  for (const f of FAQS) await Faq.findOneAndUpdate({ question: f.question }, f, { upsert: true });
  console.log(`Seeded ${STATS.length} stats, ${TESTIMONIALS.length} testimonials, ${FAQS.length} FAQs`);

  // Offers, contacts, notifications
  for (const o of OFFERS) {
    await VehicleOffer.findOneAndUpdate(
      { id: o.id },
      { id: o.id, vehicleId: o.vehicleId, name: o.customer, phone: o.phone, offerPrice: o.offerPrice, askingPrice: o.askingPrice, status: o.status, createdAt: stampDate(o.date) },
      { upsert: true }
    );
  }
  for (const c of CONTACTS) {
    await ContactMessage.findOneAndUpdate(
      { id: c.id },
      { id: c.id, name: c.name, email: c.email, phone: c.phone, subject: c.subject, message: c.message, status: c.status, createdAt: stampDate(c.date) },
      { upsert: true }
    );
  }
  for (const n of NOTIFICATIONS) {
    await AdminNotification.findOneAndUpdate(
      { id: n.id },
      { id: n.id, text: n.text, type: n.type, unread: n.unread },
      { upsert: true }
    );
  }
  console.log(`Seeded ${OFFERS.length} offers, ${CONTACTS.length} contacts, ${NOTIFICATIONS.length} notifications`);

  // Demo users
  for (const u of SEED_USERS) {
    const { password, ...rest } = u;
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      existing.name = u.name; existing.phone = u.phone;
      if (password) existing.passwordHash = password;
      await existing.save();
    } else {
      // Let the User pre-save hook hash it
      const user = new User({ ...rest, passwordHash: password });
      await user.save();
    }
  }
  console.log(`Seeded ${SEED_USERS.length} demo users (password: ${SEED_USERS[0].password})`);

  // Demo admin
  const admin = await Admin.findOne({ email: SEED_ADMIN.email });
  if (admin) {
    admin.name = SEED_ADMIN.name; admin.passwordHash = SEED_ADMIN.password; admin.role = SEED_ADMIN.role;
    await admin.save();
  } else {
    const doc = new Admin({ ...SEED_ADMIN, passwordHash: SEED_ADMIN.password });
    await doc.save();
  }
  console.log(`Seeded demo admin (${SEED_ADMIN.email} / ${SEED_ADMIN.password})`);

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