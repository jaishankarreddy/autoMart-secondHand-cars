export interface Brand {
  name: string;
  /** Monogram shown when a logo is not available */
  code: string;
  /** Accent hex used for the monogram */
  color: string;
  /** Brand logo image URL (simple-icons / iconify) */
  logo?: string;
}

export const POPULAR_BRANDS: Brand[] = [
  { name: 'Maruti Suzuki', code: 'MS', color: '#2563eb', logo: 'https://cdn.simpleicons.org/suzuki' },
  { name: 'Hyundai', code: 'H', color: '#0ea5e9', logo: 'https://cdn.simpleicons.org/hyundai' },
  { name: 'Honda', code: 'H', color: '#dc2626', logo: 'https://cdn.simpleicons.org/honda' },
  { name: 'Toyota', code: 'T', color: '#b91c1c', logo: 'https://cdn.simpleicons.org/toyota' },
  { name: 'Mahindra', code: 'M', color: '#f59e0b', logo: 'https://cdn.simpleicons.org/mahindra' },
  { name: 'Tata', code: 'T', color: '#0891b2', logo: 'https://cdn.simpleicons.org/tata' },
  { name: 'BMW', code: 'BMW', color: '#1e3a8a', logo: 'https://cdn.simpleicons.org/bmw' },
  { name: 'Mercedes', code: 'MB', color: '#7c3aed', logo: 'https://api.iconify.design/cbi/mercedes.svg' },
  { name: 'Audi', code: 'A', color: '#ea580c', logo: 'https://cdn.simpleicons.org/audi' },
  { name: 'Royal Enfield', code: 'RE', color: '#65a30d' },
  { name: 'TVS', code: 'TVS', color: '#dc2626' },
  { name: 'Hero', code: 'H', color: '#059669' }
];
