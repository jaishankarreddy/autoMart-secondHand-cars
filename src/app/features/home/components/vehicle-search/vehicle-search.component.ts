import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideSearch,
  LucideChevronDown,
  LucideCar,
  LucideBike,
  LucideMapPin,
  LucideIndianRupee,
  LucideFuel,
  LucideSlidersHorizontal
} from '@lucide/angular';
import { MagneticDirective } from '../../directives/magnetic.directive';

interface SearchOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-vehicle-search',
  standalone: true,
  imports: [
    LucideSearch,
    LucideChevronDown,
    LucideCar,
    LucideBike,
    LucideMapPin,
    LucideIndianRupee,
    LucideFuel,
    LucideSlidersHorizontal,
    MagneticDirective
  ],
  templateUrl: './vehicle-search.component.html',
  styleUrl: './vehicle-search.component.scss'
})
export class VehicleSearchComponent {
  private readonly router = inject(Router);

  readonly vehicleType = signal('');
  readonly brand = signal('');
  readonly model = signal('');
  readonly budget = signal('');
  readonly fuel = signal('');
  readonly location = signal('');

  readonly vehicleTypes: SearchOption[] = [
    { value: 'car', label: 'Car' },
    { value: 'bike', label: 'Bike' }
  ];

  readonly brands: SearchOption[] = [
    { value: '', label: 'Any brand' },
    { value: 'hyundai', label: 'Hyundai' },
    { value: 'toyota', label: 'Toyota' },
    { value: 'mahindra', label: 'Mahindra' },
    { value: 'tata', label: 'Tata' },
    { value: 'honda', label: 'Honda' },
    { value: 'maruti', label: 'Maruti Suzuki' },
    { value: 'royal-enfield', label: 'Royal Enfield' },
    { value: 'tvs', label: 'TVS' },
    { value: 'hero', label: 'Hero' }
  ];

  readonly budgets: SearchOption[] = [
    { value: '', label: 'Any budget' },
    { value: '0-5', label: 'Under ₹5 Lakh' },
    { value: '5-10', label: '₹5 – ₹10 Lakh' },
    { value: '10-15', label: '₹10 – ₹15 Lakh' },
    { value: '15-25', label: '₹15 – ₹25 Lakh' },
    { value: '25+', label: '₹25 Lakh+ (Cars only)' }
  ];

  readonly fuels: SearchOption[] = [
    { value: '', label: 'Any fuel' },
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Electric' }
  ];

  readonly locations: SearchOption[] = [
    { value: '', label: 'All locations' },
    { value: 'bengaluru', label: 'Bengaluru' },
    { value: 'mysuru', label: 'Mysuru' },
    { value: 'hubballi', label: 'Hubballi' },
    { value: 'mangaluru', label: 'Mangaluru' },
    { value: 'belagavi', label: 'Belagavi' },
    { value: 'kalaburagi', label: 'Kalaburagi' }
  ];

  search(): void {
    const params: Record<string, string> = {};
    if (this.vehicleType()) params['type'] = this.vehicleType();
    if (this.brand()) params['brand'] = this.brand();
    if (this.model().trim()) params['q'] = this.model().trim();
    if (this.budget()) params['budget'] = this.budget();
    if (this.fuel()) params['fuel'] = this.fuel();
    if (this.location()) params['location'] = this.location();
    this.router.navigate(['/search'], { queryParams: params });
  }
}
