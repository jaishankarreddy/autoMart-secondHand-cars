// AutoMart backend — minimal Express server
// Demonstrates the DB design with a few core endpoints.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

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

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'automart-api' }));

// GET /api/vehicles — catalogue listing with filters + pagination
app.get('/api/vehicles', async (req, res, next) => {
  try {
    const {
      type, brand, q, minPrice, maxPrice, fuel, transmission, bodyType,
      district, color, minYear, maxYear, owners, abs, engineCc,
      featured, sortBy, page = 1, limit = 12
    } = req.query;

    const filter = {};
    if (type) filter.vehicleType = type;
    if (brand) filter.brand = brand;
    if (fuel) filter.fuel = fuel;
    if (transmission) filter.transmission = transmission;
    if (bodyType) filter.bodyType = bodyType;
    if (district) filter.district = district;
    if (color) filter.color = color;
    if (owners) filter.owners = Number(owners);
    if (abs !== undefined) filter.abs = abs === 'true';
    if (engineCc) filter.engineCC = Number(engineCc);
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
    else sort.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Vehicle.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
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