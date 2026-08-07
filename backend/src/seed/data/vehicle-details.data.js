// Ported from src/app/features/vehicle-details/data/vehicle-details.data.ts
const IMG = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const SELLER = {
  name: 'AutoMart Certified',
  verified: true,
  hours: '9:00 AM – 8:00 PM, all days',
  location: 'MG Road, Bengaluru',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  deals: 1200
};

// Extra detail fields are merged onto the matching base vehicle during seeding.
const VEHICLE_DETAILS = [
  {
    id: 'car-01',
    availability: 'available',
    engine: '1493 cc',
    power: '113 bhp',
    registration: 'KA 01 MK 8214',
    insurance: 'Valid till Mar 2027',
    location: 'Bangalore',
    images: [
      IMG('photo-1568605117036-5fe5e7bab0b7'),
      IMG('photo-1542362567-b07e54358753'),
      IMG('photo-1502877338535-766e1452684a'),
      IMG('photo-1552519507-da3b142c6e3d'),
      IMG('photo-1533473359331-0135ef1b58bf')
    ],
    description: [
      'This Hyundai Creta SX (O) 1.5 Turbo is a beautifully maintained, single-owner SUV finished in a showroom-fresh Polar White. Bought new from the dealership in 2023 and driven a smooth 32,000 km, it offers the perfect blend of muscular presence and everyday practicality that has made the Creta India’s favourite compact SUV.',
      'Under the bonnet sits the refined 1.5-litre diesel heart, paired with a slick 7-speed DCT automatic. It delivers punchy low-end torque for effortless city commutes and composed highway cruising, all while returning an efficient 17.4 km/l.',
      'Inside, you get a 10.25-inch touchscreen with Android Auto and Apple CarPlay, a panoramic sunroof, ventilated front seats, ambient lighting and a Bose premium sound system.',
      'This unit has passed AutoMart’s rigorous 200-point inspection, including engine diagnostics, body & paint audit, and a full paperwork & RC verification.'
    ],
    features: [
      { key: 'safety', icon: 'shieldCheck', title: 'Safety', items: ['6 Airbags', 'ABS with EBD', 'Electronic Stability Control', 'Hill-start Assist', 'ISOFIX Child Mounts', 'Rear Parking Sensors & Camera'] },
      { key: 'comfort', icon: 'armchair', title: 'Comfort', items: ['Panoramic Sunroof', 'Ventilated Front Seats', 'Dual-zone Climate Control', 'Powered Driver Seat', 'Cruise Control', 'Auto-dimming IRVM'] },
      { key: 'exterior', icon: 'carFront', title: 'Exterior', items: ['LED Headlamps & DRLs', 'LED Tail Lamps', '18-inch Alloy Wheels', 'Roof Rails', 'Auto-folding ORVMs', 'Rain-sensing Wipers'] },
      { key: 'interior', icon: 'sparkles', title: 'Interior', items: ['10.25-inch Touchscreen', 'Wireless Charging Pad', 'Ambient Lighting', 'Leatherette Upholstery', 'Height-adjustable Steering', 'Rear AC Sockets'] },
      { key: 'entertainment', icon: 'headphones', title: 'Entertainment', items: ['Bose 8-speaker Sound System', 'Android Auto & Apple CarPlay', 'Voice Commands', 'Bluetooth Connectivity', 'USB-C Fast Charging'] }
    ],
    seller: SELLER
  },
  {
    id: 'car-05',
    availability: 'available',
    engine: '2198 cc',
    power: '182 bhp',
    registration: 'KA 03 NB 4721',
    insurance: 'Valid till Jan 2027',
    location: 'Bangalore',
    images: [
      IMG('photo-1542362567-b07e54358753'),
      IMG('photo-1568615117036-5fe5e7bab0b7'),
      IMG('photo-1502877338535-766e1452684a'),
      IMG('photo-1552519507-da3b142c6e3d'),
      IMG('photo-1533473359331-0135ef1b58bf')
    ],
    description: [
      'The Mahindra XUV700 AX7 is the flagship of India’s new SUV revolution — a pristine, low-run 2023 diesel automatic. It has covered just 15,600 km under a single caring owner and is finished in Midnight Black.',
      'Powered by the muscular 2.2-litre mHawk diesel and the smooth 6-speed automatic, it combines commanding performance with a gloriously quiet and feature-packed cabin.',
      'The twin 12.3-inch displays, intelligent ADAS safety suite and panoramic roof make every drive feel truly premium. The full service history is available for inspection.'
    ],
    features: [
      { key: 'safety', icon: 'shieldCheck', title: 'Safety', items: ['Level-2 ADAS', '7 Airbags', 'ESP with Hill Hold', '360° Camera', 'TPMS', 'ISOFIX'] },
      { key: 'comfort', icon: 'armchair', title: 'Comfort', items: ['Panoramic Sunroof', 'Ventilated Seats', '3-zone Climate Control', 'Powered Front Seats', 'Cruise Control', 'Auto-dimming IRVM'] },
      { key: 'exterior', icon: 'carFront', title: 'Exterior', items: ['Full-LED Lighting', '18-inch Alloys', 'Roof Rails', 'Auto-folding ORVMs', 'Skid Plates'] },
      { key: 'interior', icon: 'sparkles', title: 'Interior', items: ['12.3-inch Dual Displays', 'Wireless Charging', 'Ambient Lighting', 'Suede Accents'] },
      { key: 'entertainment', icon: 'headphones', title: 'Entertainment', items: ['Sony 12-speaker Sound', 'Android Auto & CarPlay', 'Connectivity Suite', 'USB-C Charging'] }
    ],
    seller: SELLER
  }
];

module.exports = { VEHICLE_DETAILS };