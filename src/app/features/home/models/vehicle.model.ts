export type VehicleType = 'car' | 'bike';
export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric';
export type Transmission = 'Manual' | 'Automatic';

export interface Vehicle {
  id: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  /** Price in full Indian Rupees (e.g. 1680000 = ₹16,80,000) */
  price: number;
  fuel: FuelType;
  transmission: Transmission;
  /** Mileage in km/l */
  mileage: number;
  /** Odometer reading in km */
  kilometers: number;
  /** District in Karnataka */
  location: string;
  image: string;
  featured?: boolean;
  owners?: number;
  rating?: number;
}
