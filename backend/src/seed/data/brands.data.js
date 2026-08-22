// Ported from src/app/features/home/data/brands.data.ts
const BRANDS = [
  { name: 'Maruti Suzuki', code: 'MS', color: '#2563eb', logo: '/vehicle_logos/suzuki-logo.png', type: 'both' },
  { name: 'Hyundai', code: 'H', color: '#0ea5e9', logo: '/vehicle_logos/hyundai-logo.png', type: 'both' },
  { name: 'Honda', code: 'H', color: '#dc2626', logo: '/vehicle_logos/honda-logo.png', type: 'both' },
  { name: 'Toyota', code: 'T', color: '#b91c1c', logo: '/vehicle_logos/toyota-logo.png', type: 'car' },
  { name: 'Mahindra', code: 'M', color: '#f59e0b', logo: '/vehicle_logos/mahindra-logo.png', type: 'both' },
  { name: 'Tata', code: 'T', color: '#0891b2', logo: '/vehicle_logos/tata-logo.png', type: 'car' },
  { name: 'BMW', code: 'BMW', color: '#1e3a8a', logo: '/vehicle_logos/bmw-logo.png', type: 'car' },
  { name: 'Mercedes', code: 'MB', color: '#7c3aed', logo: '/vehicle_logos/mercedes-benz-logo.png', type: 'car' },
  { name: 'Audi', code: 'A', color: '#ea580c', logo: '/vehicle_logos/audi-logo.png', type: 'car' },
  { name: 'Royal Enfield', code: 'RE', color: '#65a30d', logo: '', type: 'bike' },
  { name: 'TVS', code: 'TVS', color: '#dc2626', logo: '', type: 'both' },
  { name: 'Hero', code: 'H', color: '#059669', logo: '', type: 'bike' },
  // Additional brands present in the catalogue data
  { name: 'Kia', code: 'K', color: '#111827', logo: '/vehicle_logos/kia-logo.png', type: 'car' },
  { name: 'Skoda', code: 'S', color: '#155e75', logo: '/vehicle_logos/skoda-logo.png', type: 'car' },
  { name: 'Volkswagen', code: 'VW', color: '#0b3a8a', logo: '/vehicle_logos/volkswagen-logo.png', type: 'car' },
  { name: 'Bajaj', code: 'B', color: '#b45309', logo: '', type: 'bike' },
  { name: 'Yamaha', code: 'Y', color: '#1d4ed8', logo: '', type: 'bike' },
  { name: 'KTM', code: 'KTM', color: '#ea580c', logo: '/vehicle_logos/ktm-logo.png', type: 'bike' },
  { name: 'Ather', code: 'AT', color: '#0f766e', logo: '', type: 'bike' },
  { name: 'Ola', code: 'OL', color: '#0c4a6e', logo: '', type: 'bike' }
];

module.exports = { BRANDS };
