// AutoMart backend — minimal Express server
// Demonstrates the DB design with a few core endpoints.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { connectDB } = require('./config/db');

const Admin = require('./models/admin.model');
const User = require('./models/user.model');
const Vehicle = require('./models/vehicle.model');
const Brand = require('./models/brand.model');
const VehicleOffer = require('./models/vehicle-offer.model');
const ContactMessage = require('./models/contact-message.model');
const Testimonial = require('./models/testimonial.model');
const Faq = require('./models/faq.model');
const HomepageStat = require('./models/homepage-stat.model');

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Image uploads -----------------------------------------------------------
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
    cb(null, `v-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\//.test(file.mimetype))
});
// Serve uploaded images under /uploads (proxied by the Angular dev server).
app.use('/uploads', express.static(UPLOADS_DIR));

// Remove an uploaded image file from disk (best-effort).
function cleanUpload(imageUrl) {
  try {
    const filePath = path.join(UPLOADS_DIR, path.basename(imageUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Failed to clean uploaded file:', err.message);
  }
}

// Fields the admin form may submit (everything else is ignored).
const VEHICLE_FIELDS = [
  'vehicleType', 'brand', 'model', 'variant', 'year', 'priceInLakh', 'rating',
  'featured', 'availability', 'fuel', 'transmission', 'mileage', 'kilometers',
  'district', 'location', 'owners', 'bodyType', 'color', 'engineCC', 'abs',
  'engine', 'power', 'registration', 'insurance', 'description'
];

function toBool(v) {
  if (v === undefined) return undefined;
  return v === true || v === 'true' || v === '1';
}

function buildVehiclePayload(body) {
  const payload = {};
  for (const field of VEHICLE_FIELDS) {
    if (body[field] === undefined) continue;
    const val = body[field];
    switch (field) {
      case 'vehicleType':
        if (val === 'car' || val === 'bike') payload.vehicleType = val;
        break;
      case 'year':
      case 'priceInLakh':
      case 'rating':
      case 'mileage':
      case 'kilometers':
      case 'owners':
      case 'engineCC':
        payload[field] = Number(val);
        break;
      case 'featured':
      case 'abs':
        payload[field] = toBool(val);
        break;
      case 'description':
        payload[field] = String(val)
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      default:
        payload[field] = String(val).trim();
    }
  }
  return payload;
}

async function nextVehicleId(vehicleType) {
  const docs = await Vehicle.find({ vehicleType }, 'id').lean();
  const nums = docs.map((d) => parseInt(String(d.id).replace(/\D/g, ''), 10) || 0);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${vehicleType}-${String(next).padStart(2, '0')}`;
}

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'automart-api' }));

// --- User authentication ------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'automart-dev-secret-change-me';

function signUserToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Require a valid user JWT. Populates req.user.
function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'You must be logged in to do that.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
}

// POST /api/auth/register — create a user account and log them in
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash: String(password),
      emailVerified: true
    });
    res.status(201).json({ token: signUserToken(user), user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login — sign a user in
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await user.comparePassword(String(password)))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    res.json({ token: signUserToken(user), user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — current user from token
app.get('/api/auth/me', authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

// --- User wishlist ------------------------------------------------------------
// GET /api/wishlist — current user's saved vehicles (full catalogue entries)
app.get('/api/wishlist', authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const ids = user.wishlist || [];
    const vehicles = await Vehicle.find({ id: { $in: ids } }).lean();
    const order = new Map(ids.map((id, i) => [id, i]));
    vehicles.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    res.json({ wishlist: ids, vehicles });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist/:id — add a vehicle to the user's wishlist
app.post('/api/wishlist/:id', authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const vehicle = await Vehicle.findOne({ id: req.params.id });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    if (!user.wishlist.includes(req.params.id)) {
      user.wishlist.push(req.params.id);
      await user.save();
    }
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wishlist/:id — remove a vehicle from the user's wishlist
app.delete('/api/wishlist/:id', authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.wishlist = user.wishlist.filter((id) => id !== req.params.id);
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
});

// Admin: sign in (issues a short-lived JWT)
app.post('/api/admin/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const matches = await admin.comparePassword(String(password));
    if (!matches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    admin.lastLoginAt = new Date();
    await admin.save();

    const token = jwt.sign(
      { sub: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'automart-dev-secret-change-me',
      { expiresIn: '12h' }
    );

    res.json({ token, admin: admin.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

// GET /api/vehicles — catalogue listing with filters + pagination
app.get('/api/vehicles', async (req, res, next) => {
  try {
    const {
      type, brand, model, q, minPrice, maxPrice, fuel, transmission, bodyType,
      district, color, minYear, maxYear, year, owners, abs, engineCc, engineCcMin,
      engineCcMax, mileageMax, featured, sortBy, page = 1, limit = 12
    } = req.query;

    // Repeated query params (e.g. ?brand=A&brand=B) arrive as arrays → $in.
    const asArray = (v) => (v === undefined ? undefined : Array.isArray(v) ? v : [v]);
    const asNumbers = (v) => asArray(v)?.map((x) => Number(x));

    const filter = {};
    if (type) filter.vehicleType = type;
    if (asArray(brand)?.length) filter.brand = { $in: asArray(brand) };
    if (asArray(model)?.length) filter.model = { $in: asArray(model) };
    if (asArray(fuel)?.length) filter.fuel = { $in: asArray(fuel) };
    if (asArray(transmission)?.length) filter.transmission = { $in: asArray(transmission) };
    if (asArray(bodyType)?.length) filter.bodyType = { $in: asArray(bodyType) };
    if (asArray(district)?.length) filter.district = { $in: asArray(district) };
    if (asArray(color)?.length) filter.color = { $in: asArray(color) };
    if (asNumbers(owners)?.length) filter.owners = { $in: asNumbers(owners) };
    if (asNumbers(year)?.length) filter.year = { $in: asNumbers(year) };
    if (abs !== undefined) filter.abs = abs === 'true';
    if (engineCc) filter.engineCC = Number(engineCc);
    if (engineCcMin || engineCcMax) {
      filter.engineCC = { ...(filter.engineCC || {}) };
      if (engineCcMin) filter.engineCC.$gte = Number(engineCcMin);
      if (engineCcMax) filter.engineCC.$lte = Number(engineCcMax);
    }
    if (featured) filter.featured = true;
    if (minPrice || maxPrice) {
      filter.priceInLakh = {};
      if (minPrice) filter.priceInLakh.$gte = Number(minPrice);
      if (maxPrice) filter.priceInLakh.$lte = Number(maxPrice);
    }
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = Number(minYear);
      if (maxYear) filter.year.$lte = Number(maxYear);
    }
    if (mileageMax) filter.mileage = { $lte: Number(mileageMax) };
    if (q) {
      const qRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { brand: qRegex },
        { model: qRegex },
        { variant: qRegex },
        { district: qRegex }
      ];
    }

    const sort = {};
    if (sortBy === 'price_asc') sort.priceInLakh = 1;
    else if (sortBy === 'price_desc') sort.priceInLakh = -1;
    else if (sortBy === 'year_desc') sort.year = -1;
    else if (sortBy === 'mileage_desc') sort.mileage = -1;
    else sort.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);
    const LIST_PROJECTION =
      'id vehicleType brand model variant year priceInLakh rating featured availability ' +
      'fuel transmission mileage kilometers district location owners bodyType color ' +
      'engineCC abs engine power registration insurance image';
    const [items, total] = await Promise.all([
      Vehicle.find(filter).select(LIST_PROJECTION).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Vehicle.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// GET /api/vehicles/:id — full detail
app.get('/api/vehicles/:id', async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ id: req.params.id }).lean();
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
});

// GET /api/brands
app.get('/api/brands', async (_req, res, next) => {
  try {
    res.json(await Brand.find().sort({ name: 1 }).lean());
  } catch (err) {
    next(err);
  }
});

// GET /api/facets?type=car|bike — distinct filter options for the sidebar
app.get('/api/facets', async (req, res, next) => {
  try {
    const type = req.query.type === 'bike' ? 'bike' : 'car';
    const base = { vehicleType: type };
    const [brands, models, years, fuels, transmissions, owners, bodyTypes, districts, colors, price] =
      await Promise.all([
        Vehicle.distinct('brand', base),
        Vehicle.distinct('model', base),
        Vehicle.distinct('year', base),
        Vehicle.distinct('fuel', base),
        Vehicle.distinct('transmission', base),
        Vehicle.distinct('owners', base),
        Vehicle.distinct('bodyType', base),
        Vehicle.distinct('district', base),
        Vehicle.distinct('color', base),
        Vehicle.aggregate([
          { $match: base },
          { $group: { _id: null, min: { $min: '$priceInLakh' }, max: { $max: '$priceInLakh' } } }
        ])
      ]);
    res.json({
      type,
      brands,
      models,
      years,
      fuels,
      transmissions,
      owners,
      bodyTypes,
      districts,
      colors,
      priceMin: price[0] ? price[0].min : 0,
      priceMax: price[0] ? price[0].max : 0
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/testimonials — active customer testimonials
app.get('/api/testimonials', async (_req, res, next) => {
  try {
    const list = await Testimonial.find({ isActive: true }).sort({ createdAt: 1 }).lean();
    res.json(list.map((t) => ({
      id: String(t._id),
      name: t.name,
      role: t.role,
      quote: t.quote,
      rating: t.rating,
      color: t.color
    })));
  } catch (err) {
    next(err);
  }
});

// GET /api/faqs — ordered FAQ list
app.get('/api/faqs', async (_req, res, next) => {
  try {
    const list = await Faq.find({ isActive: true }).sort({ order: 1 }).lean();
    res.json(list.map((f) => ({ id: String(f._id), question: f.question, answer: f.answer })));
  } catch (err) {
    next(err);
  }
});

// GET /api/homestats — homepage countdown stats (`?section=hero|section`)
app.get('/api/homestats', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.section) filter.section = req.query.section;
    const list = await HomepageStat.find(filter).sort({ order: 1 }).lean();
    res.json(list.map((s) => ({ key: s.key, value: s.value, label: s.label, section: s.section })));
  } catch (err) {
    next(err);
  }
});

// POST /api/offers — submit an offer (guest allowed)
app.post('/api/offers', async (req, res, next) => {
  try {
    const { vehicleId, name, phone, offerPrice, message } = req.body;
    if (!vehicleId || !name || !phone || !offerPrice) {
      return res.status(400).json({ message: 'vehicleId, name, phone and offerPrice are required' });
    }
    const vehicle = await Vehicle.findOne({ id: vehicleId });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    const offer = await VehicleOffer.create({
      vehicleId,
      name,
      phone,
      offerPrice,
      askingPrice: vehicle.priceInLakh * 100000,
      message
    });
    res.status(201).json(offer);
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts — submit a contact/enquiry message
app.post('/api/contacts', async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'name, email and message are required' });
    }
    const contact = await ContactMessage.create({ name, email, phone: phone || '', subject: subject || '', message });
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
});

// Admin: dashboard summary counts
app.get('/api/admin/dashboard', async (_req, res, next) => {
  try {
    const [totalCars, totalBikes, pendingOffers, newContacts] = await Promise.all([
      Vehicle.countDocuments({ vehicleType: 'car' }),
      Vehicle.countDocuments({ vehicleType: 'bike' }),
      VehicleOffer.countDocuments({ status: 'Pending' }),
      ContactMessage.countDocuments({ status: 'New' })
    ]);
    res.json({ totalCars, totalBikes, totalVehicles: totalCars + totalBikes, pendingOffers, newContacts });
  } catch (err) {
    next(err);
  }
});

// Admin: offers list (latest first) with joined vehicle label
app.get('/api/admin/offers', async (_req, res, next) => {
  try {
    const offers = await VehicleOffer.find().sort({ createdAt: -1 }).lean();
    const ids = [...new Set(offers.map((o) => o.vehicleId).filter(Boolean))];
    const vehicles = await Vehicle.find({ id: { $in: ids } }).lean();
    const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
    res.json(offers.map((o) => {
      const v = vehicleById.get(o.vehicleId);
      return {
        id: o.id,
        vehicleId: o.vehicleId,
        vehicle: v ? `${v.brand} ${v.model} ${v.variant}`.trim() : 'Vehicle',
        customer: o.name,
        phone: o.phone,
        offerPrice: o.offerPrice,
        askingPrice: o.askingPrice,
        status: o.status,
        date: o.createdAt
      };
    }));
  } catch (err) {
    next(err);
  }
});

// Admin: update offer status (Pending / Accepted / Countered / Rejected)
app.patch('/api/admin/offers/:id', async (req, res, next) => {
  try {
    const { status, counterPrice } = req.body;
    const query = { $or: [{ id: req.params.id }] };
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) query.$or.push({ _id: req.params.id });
    const offer = await VehicleOffer.findOne(query);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    if (status) offer.status = status;
    if (counterPrice !== undefined) offer.counterPrice = Number(counterPrice);
    await offer.save();
    res.json(offer);
  } catch (err) {
    next(err);
  }
});

// Admin: contacts list (latest first)
app.get('/api/admin/contacts', async (_req, res, next) => {
  try {
    const list = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    res.json(list.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      subject: c.subject,
      message: c.message,
      status: c.status,
      date: c.createdAt
    })));
  } catch (err) {
    next(err);
  }
});

// Admin: update contact status (New / Replied)
app.patch('/api/admin/contacts/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    const query = { $or: [{ id: req.params.id }] };
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) query.$or.push({ _id: req.params.id });
    const contact = await ContactMessage.findOne(query);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    if (status) contact.status = status;
    await contact.save();
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

// Admin: create a vehicle (multipart/form-data; optional `image` file)
app.post('/api/admin/vehicles', upload.single('image'), async (req, res, next) => {
  try {
    const type = req.body.vehicleType === 'bike' ? 'bike' : 'car';
    if (!req.body.brand || !req.body.model || !req.body.year || !req.body.priceInLakh) {
      return res
        .status(400)
        .json({ message: 'vehicleType, brand, model, year and priceInLakh are required' });
    }
    const payload = buildVehiclePayload({ ...req.body, vehicleType: type });
    payload.id = req.body.id || (await nextVehicleId(type));
    if (!payload.seller) {
      payload.seller = {
        name: 'AutoMart Dealer',
        verified: false,
        hours: '9 AM – 7 PM',
        location: payload.district || '',
        phone: '',
        whatsapp: ''
      };
    }
    if (req.file) payload.image = `/uploads/${req.file.filename}`;
    const vehicle = await Vehicle.create(payload);
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
});

// Admin: update a vehicle (multipart/form-data; optional new `image` file)
app.put('/api/admin/vehicles/:id', upload.single('image'), async (req, res, next) => {
  try {
    const query = { $or: [{ id: req.params.id }] };
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) query.$or.push({ _id: req.params.id });
    const vehicle = await Vehicle.findOne(query);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const payload = buildVehiclePayload(req.body);
    delete payload.vehicleType; // type is an identity — not editable via admin form
if (req.file) {
      payload.image = `/uploads/${req.file.filename}`;
      if (vehicle.image && vehicle.image.startsWith('/uploads/')) {
        cleanUpload(vehicle.image);
      }
    }
    Object.assign(vehicle, payload);
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
});

// Admin: delete a vehicle
app.delete('/api/admin/vehicles/:id', async (req, res, next) => {
  try {
    const query = { $or: [{ id: req.params.id }] };
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) query.$or.push({ _id: req.params.id });
    const vehicle = await Vehicle.findOne(query);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.image && vehicle.image.startsWith('/uploads/')) {
      cleanUpload(vehicle.image);
    }
    await vehicle.deleteOne();
    res.json({ message: 'Vehicle deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`AutoMart API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });