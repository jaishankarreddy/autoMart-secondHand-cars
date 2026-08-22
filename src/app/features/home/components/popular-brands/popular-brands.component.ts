import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';

type VehicleType = 'Cars' | 'Bikes';

interface Brand {
  name: string;
  mark: string;
  color: string;
  type: VehicleType;
  logo: string;
}

const BRANDS: Brand[] = [
  { name: 'Audi', mark: '\u25C9\u25C9\u25C9\u25C9', color: '#bb2632', type: 'Cars', logo: '/vehicle_logos/audi-logo.png' },
  { name: 'BMW', mark: 'BMW', color: '#1572b8', type: 'Cars', logo: '/vehicle_logos/bmw-logo.png' },
  { name: 'Mercedes-Benz', mark: '\u2726', color: '#28343b', type: 'Cars', logo: '/vehicle_logos/mercedes-benz-logo.png' },
  { name: 'Hyundai', mark: 'H', color: '#0873a7', type: 'Cars', logo: '/vehicle_logos/hyundai-logo.png' },
  { name: 'Honda', mark: 'H', color: '#d51b29', type: 'Cars', logo: '/vehicle_logos/Honda-Logo.wine.svg' },
  { name: 'Toyota', mark: 'T', color: '#d71920', type: 'Cars', logo: '/vehicle_logos/toyota-logo.png' },
  { name: 'Volkswagen', mark: 'VW', color: '#185a99', type: 'Cars', logo: '/vehicle_logos/volkswagen-logo.png' },
  { name: 'Tata', mark: 'T', color: '#3474b9', type: 'Cars', logo: '/vehicle_logos/tata-logo.png' },
  { name: 'Mahindra', mark: 'mahindra', color: '#ee3c45', type: 'Cars', logo: '/vehicle_logos/mahindra-logo.png' },
  { name: 'Maruti Suzuki', mark: 'S', color: '#df1730', type: 'Cars', logo: '/vehicle_logos/suzuki-logo.png' },
  { name: 'Kia', mark: 'KIA', color: '#172238', type: 'Cars', logo: '/vehicle_logos/kia-logo.png' },
  { name: 'Renault', mark: 'R', color: '#f6a900', type: 'Cars', logo: '/vehicle_logos/renault-logo.png' },
  { name: 'Royal Enfield', mark: 'RE', color: '#71ae24', type: 'Bikes', logo: '/vehicle_logos/Eicher_Motors-Logo.wine.svg' },
  { name: 'KTM', mark: 'KTM', color: '#fa5d13', type: 'Bikes', logo: '/vehicle_logos/ktm-logo.png' },
  { name: 'Yamaha', mark: 'Y', color: '#202a94', type: 'Bikes', logo: '/vehicle_logos/Yamaha_Motor_Company-Logo.wine.svg' },
  { name: 'Bajaj', mark: 'B', color: '#1575a3', type: 'Bikes', logo: '' },
  { name: 'TVS', mark: 'TVS', color: '#e6252e', type: 'Bikes', logo: '/vehicle_logos/TVS_Motor_Company-Logo.wine.svg' },
  { name: 'Triumph', mark: 'T', color: '#292929', type: 'Bikes', logo: '' },
  { name: 'Ducati', mark: 'D', color: '#c51d2f', type: 'Bikes', logo: '' },
  { name: 'Harley-Davidson', mark: 'H-D', color: '#e66c1b', type: 'Bikes', logo: '' },
];

@Component({
  selector: 'app-popular-brands',
  standalone: true,
  imports: [RouterLink, LucideArrowRight],
  templateUrl: './popular-brands.component.html',
  styleUrls: ['./popular-brands.component.scss']
})
export class PopularBrandsComponent {
  readonly failedLogos = signal<Set<string>>(new Set());

  readonly repeatedMarqueeRows = computed(() => {
    const cars = BRANDS.filter((brand) => brand.type === 'Cars');
    const bikes = BRANDS.filter((brand) => brand.type === 'Bikes');
    const rows = [cars.slice(0, 8), bikes, cars.slice(3, 11)];
    return rows.map((row) => [...row, ...row, ...row]);
  });

  isRings(mark: string): boolean {
    return mark === '\u25C9\u25C9\u25C9\u25C9';
  }

  onLogoError(name: string): void {
    this.failedLogos.update((failed) => {
      const next = new Set(failed);
      next.add(name);
      return next;
    });
  }
}
