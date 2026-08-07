// Ported from src/app/features/home/data/home.data.ts (stats, testimonials, FAQs)
const STATS = [
  { key: 'hero_cars', value: '500+', label: 'Cars', section: 'hero', order: 1 },
  { key: 'hero_bikes', value: '300+', label: 'Bikes', section: 'hero', order: 2 },
  { key: 'hero_brands', value: '25+', label: 'Brands', section: 'hero', order: 3 },
  { key: 'hero_districts', value: '31', label: 'Districts', section: 'hero', order: 4 },
  { key: 'section_vehicles', value: '1000+', label: 'Vehicles', section: 'section', order: 1 },
  { key: 'section_buyers', value: '500+', label: 'Happy Buyers', section: 'section', order: 2 },
  { key: 'section_brands', value: '30+', label: 'Brands', section: 'section', order: 3 },
  { key: 'section_districts', value: '31', label: 'Districts', section: 'section', order: 4 }
];

const TESTIMONIALS = [
  { name: 'Ravi Kumar', role: 'Bought Hyundai Creta · Bengaluru', quote: 'The 200-point inspection report gave me total confidence. Got a spotless Creta in three days with zero hassle.', rating: 5, color: '#4f46e5' },
  { name: 'Sneha Patil', role: 'Bought Honda City · Mysuru', quote: 'Transparent pricing with no negotiation drama. The team handled all the paperwork while I relaxed at home.', rating: 5, color: '#0ea5e9' },
  { name: 'Arjun Nair', role: 'Sold Royal Enfield · Mangaluru', quote: 'I sold my Classic 350 within 24 hours. Fair offer, doorstep pickup and instant payment. Could not ask for more.', rating: 5, color: '#f59e0b' },
  { name: 'Kavya Gowda', role: 'Bought Brezza · Hubballi', quote: 'WhatsApp support is genuinely quick. They sent detailed videos before I even visited the centre.', rating: 5, color: '#16a34a' },
  { name: 'Imran Shaikh', role: 'Bought XUV700 · Kalaburagi', quote: 'Cleanest used car I have ever bought. The warranty and after-sales support feel like buying brand new.', rating: 4, color: '#7c3aed' },
  { name: 'Divya Rao', role: 'Bought Apache 200 · Belagavi', quote: 'As a first-time buyer I was nervous, but AutoMart made everything simple, safe and stress-free.', rating: 5, color: '#dc2626' }
];

const FAQS = [
  { question: 'How are vehicles inspected and verified?', answer: 'Every vehicle goes through a rigorous 200-point inspection covering the engine, body, tyres, brakes, electronics and service history. Certified reports are attached to every listing.', order: 1 },
  { question: 'Can I get a test drive before buying?', answer: 'Absolutely. You can book a doorstep test drive or visit one of our experience centres. We also arrange video calls for out-of-town buyers.', order: 2 },
  { question: 'What is included in the price?', answer: 'The displayed price is all-inclusive with transparent pricing. It covers inspection, RTO transfer, roadworthiness and a limited warranty. No hidden charges.', order: 3 },
  { question: 'How do I sell my current car or bike?', answer: 'Share a few details and get an instant fair offer. We arrange free doorstep inspection and pickup, handle the paperwork, and pay you quickly.', order: 4 },
  { question: 'Do you deliver outside my city?', answer: 'Yes, we deliver vehicles across all 31 districts of Karnataka. Select home delivery at checkout and we will manage transport.', order: 5 },
  { question: 'Is there a return or warranty policy?', answer: 'Every vehicle includes a standard warranty and buyback assurance. Our support team resolves any undisclosed issue promptly within the warranty period.', order: 6 }
];

module.exports = { STATS, TESTIMONIALS, FAQS };