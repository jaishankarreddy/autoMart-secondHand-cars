export type VehicleAvailability = 'available' | 'reserved' | 'sold';

export interface SellerInfo {
  name: string;
  verified: boolean;
  hours: string;
  location: string;
  phone: string;
  whatsapp: string;
  deals: number;
}

export interface FeatureGroup {
  key: 'safety' | 'comfort' | 'exterior' | 'interior' | 'entertainment';
  icon: string;
  title: string;
  items: string[];
}

export interface VehicleDetail {
  id: string;
  vehicleType?: 'car' | 'bike';
  brand: string;
  model: string;
  variant: string;
  year: number;
  /** Price in full Indian Rupees (e.g. 1785000 = ₹17,85,000) */
  price: number;
  fuel: string;
  transmission: string;
  /** Mileage in km/l */
  mileage: number;
  /** Odometer reading in km */
  kilometers: number;
  location: string;
  district: string;
  owners: number;
  bodyType: string;
  color: string;
  abs?: boolean;
  image?: string;
  availability: VehicleAvailability;
  featured: boolean;
  rating: number;
  engine: string;
  power: string;
  registration: string;
  insurance: string;
  images: string[];
  description: string[];
  features: FeatureGroup[];
  seller: SellerInfo;
}
