import { Component, computed, inject, input, output, signal } from '@angular/core';
import {
  LucideX,
  LucideImagePlus,
  LucideSparkles,
  LucideLoaderCircle,
  LucideCar,
  LucideBike
} from '@lucide/angular';
import { RippleDirective } from '@features/cars/directives/ripple.directive';
import { CatalogService } from '../../../../../services/catalog.service';
import { AdminService, VehicleFormPayload } from '../../../services/admin.service';
import { compressImage } from '../../../utils/image-compress.util';
import { AdminVehicle } from '../../../utils/vehicle.util';

export interface VehicleFormModel {
  brand: string;
  model: string;
  variant: string;
  year: string;
  priceInLakh: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  district: string;
  location: string;
  mileage: string;
  kilometers: string;
  owners: string;
  engineCC: string;
  abs: string;
  engine: string;
  power: string;
  registration: string;
  insurance: string;
  rating: string;
  featured: string;
  availability: string;
  description: string;
}

const EMPTY_FORM: VehicleFormModel = {
  brand: '', model: '', variant: '', year: '', priceInLakh: '', fuel: 'Petrol',
  transmission: 'Manual', bodyType: '', color: 'White', district: 'Bengaluru', location: '',
  mileage: '', kilometers: '', owners: '1', engineCC: '', abs: 'false', engine: '',
  power: '', registration: '', insurance: '', rating: '4', featured: 'false',
  availability: 'available', description: ''
};

const CAR_BODY_TYPES = ['SUV', 'Sedan', 'Hatchback', 'MPV', 'Crossover'];
const BIKE_BODY_TYPES = [
  'Commuter', 'Scooter', 'Sport', 'Street', 'Cruiser',
  'Adventure', 'Streetfighter', 'Tourer', 'Electric Scooter'
];
const DISTRICTS = [
  'Bengaluru', 'Mysuru', 'Hubballi', 'Belagavi', 'Mangaluru', 'Udupi',
  'Davanagere', 'Tumakuru', 'Kalaburagi', 'Shivamogga', 'Ballari', 'Dakshina Kannada'
];
const COLORS = ['White', 'Black', 'Grey', 'Silver', 'Red', 'Blue', 'Green', 'Orange', 'Yellow'];
const FUELS = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

@Component({
  selector: 'app-vehicle-form-modal',
  standalone: true,
  imports: [
    RippleDirective,
    LucideX,
    LucideImagePlus,
    LucideSparkles,
    LucideLoaderCircle,
    LucideCar,
    LucideBike
  ],
  templateUrl: './vehicle-form-modal.html',
  styleUrl: './vehicle-form-modal.scss'
})
export class VehicleFormModalComponent {
  private readonly service = inject(AdminService);
  private readonly catalog = inject(CatalogService);

  readonly model = input<AdminVehicle | null>(null);
  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly form = signal<VehicleFormModel>({ ...EMPTY_FORM });
  readonly type = signal<'car' | 'bike'>('car');
  readonly photo = signal<File | null>(null);
  readonly photoPreview = signal<string | null>(null);
  readonly existingImage = signal<string>('');
  readonly saving = signal(false);
  readonly error = signal('');

  readonly isEdit = computed(() => !!this.model());
  readonly bodyTypes = computed(() =>
    this.type() === 'car' ? CAR_BODY_TYPES : BIKE_BODY_TYPES
  );
  readonly districts = DISTRICTS;
  readonly colors = COLORS;
  readonly fuels = FUELS;
  readonly transmissions = ['Manual', 'Automatic', 'Electric'];
  readonly availabilityOptions = ['available', 'reserved', 'sold'];
  readonly yesNo = ['false', 'true'];

  constructor() {
    const m = this.model();
    if (m) {
      this.type.set(m.type);
      this.existingImage.set(m.image);
      const f = this.form();
      this.form.set({
        ...f,
        brand: m.brand,
        model: m.model,
        variant: m.variant,
        year: String(m.year),
        priceInLakh: String(m.priceInLakh),
        fuel: m.fuel,
        transmission: m.transmission.replace(/ km\/l.*/, ''),
        bodyType: m.bodyType,
        color: m.color,
        district: m.district,
        mileage: String(parseFloat(String(m.mileage)) || 0),
        kilometers: String(m.kilometers),
        owners: String(m.owners),
        abs: m.abs === 'Yes' ? 'true' : 'false',
        rating: m.rating ? String(m.rating) : '4',
        availability: m.status === 'Sold' ? 'sold' : 'available'
      });
    }
  }

  readonly set = (key: keyof VehicleFormModel, value: string) =>
    this.form.update((f) => ({ ...f, [key]: value }));

  switchType(type: 'car' | 'bike'): void {
    this.type.set(type);
    this.form.update((f) => ({
      ...f,
      bodyType: '',
      fuel: type === 'bike' ? 'Petrol' : 'Petrol',
      abs: 'false'
    }));
  }

  onPhotoPicked(event: Event): void {
    const files = (event.target as HTMLInputElement).files as FileList | null;
    const file = files && files[0];
    if (!file) return;
    compressImage(file)
      .then((compressed) => {
        this.photo.set(compressed);
        this.photoPreview.set(URL.createObjectURL(compressed));
        this.error.set('');
      })
      .catch(() => this.error.set('Could not process that image.'));
  }

  removePhoto(): void {
    this.photo.set(null);
    this.photoPreview.set(null);
    this.existingImage.set('');
  }

  buildPayload(): VehicleFormPayload | null {
    const f = this.form();
    if (!f.brand.trim() || !f.model.trim() || !f.year || !f.priceInLakh) {
      this.error.set('Brand, Model, Year and Price are required.');
      return null;
    }
    return {
      vehicleType: this.type(),
      brand: f.brand.trim(),
      model: f.model.trim(),
      variant: f.variant.trim(),
      year: parseInt(f.year, 10) || 0,
      priceInLakh: parseFloat(f.priceInLakh) || 0,
      fuel: f.fuel,
      transmission: f.transmission,
      mileage: parseFloat(f.mileage) || 0,
      kilometers: parseInt(f.kilometers, 10) || 0,
      district: f.district.trim(),
      location: f.location.trim(),
      owners: parseInt(f.owners, 10) || 1,
      bodyType: f.bodyType,
      color: f.color.trim(),
      engineCC: parseInt(f.engineCC, 10) || 0,
      abs: f.abs === 'true',
      engine: f.engine.trim(),
      power: f.power.trim(),
      registration: f.registration.trim(),
      insurance: f.insurance.trim(),
      featured: f.featured === 'true',
      availability: f.availability as 'available' | 'reserved' | 'sold',
      rating: parseFloat(f.rating) || 0,
      description: f.description,
      image: this.photo()
    };
  }

  submit(): void {
    if (this.saving()) return;
    const payload = this.buildPayload();
    if (!payload) return;
    this.saving.set(true);
    this.error.set('');

    const m = this.model();
    const request = m && m.id
      ? this.service.update(m.id, payload)
      : this.service.create(payload);

    request.subscribe({
      next: () => {
        this.catalog.refresh();
        this.saving.set(false);
        this.saved.emit();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(err instanceof Error ? err.message : 'Failed to save vehicle.');
      }
    });
  }
}