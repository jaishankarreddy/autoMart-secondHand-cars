import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBike,
  LucideCarFront,
  LucideChevronDown,
  LucideChevronRight,
  LucideSearch,
  LucideSparkles,
  LucideX
} from '@lucide/angular';
import { FooterComponent } from '../../../home/components/footer/footer.component';

type VehicleType = 'Cars' | 'Bikes';

interface Brand {
  name: string;
  mark: string;
  color: string;
  type: VehicleType;
  description: string;
  count: number;
  logo: string;
}

const BRANDS: Brand[] = [
  { name: 'Audi', mark: '\u25C9\u25C9\u25C9\u25C9', color: '#bb2632', type: 'Cars', description: 'Progressive luxury', count: 24, logo: '/vehicle_logos/audi-logo.png' },
  { name: 'BMW', mark: 'BMW', color: '#1572b8', type: 'Cars', description: 'Sheer driving pleasure', count: 18, logo: '/vehicle_logos/bmw-logo.png' },
  { name: 'Mercedes-Benz', mark: '\u2726', color: '#28343b', type: 'Cars', description: 'The best or nothing', count: 16, logo: '/vehicle_logos/mercedes-benz-logo.png' },
  { name: 'Hyundai', mark: 'H', color: '#0873a7', type: 'Cars', description: 'New thinking, new possibilities', count: 31, logo: '/vehicle_logos/hyundai-logo.png' },
  { name: 'Honda', mark: 'H', color: '#d51b29', type: 'Cars', description: 'The power of dreams', count: 27, logo: '/vehicle_logos/Honda-Logo.wine.svg' },
  { name: 'Toyota', mark: 'T', color: '#d71920', type: 'Cars', description: 'Let\'s go places', count: 22, logo: '/vehicle_logos/toyota-logo.png' },
  { name: 'Volkswagen', mark: 'VW', color: '#185a99', type: 'Cars', description: 'Das auto', count: 19, logo: '/vehicle_logos/volkswagen-logo.png' },
  { name: 'Tata', mark: 'T', color: '#3474b9', type: 'Cars', description: 'Connecting aspirations', count: 38, logo: '/vehicle_logos/tata-logo.png' },
  { name: 'Mahindra', mark: 'mahindra', color: '#ee3c45', type: 'Cars', description: 'Rise', count: 28, logo: '/vehicle_logos/mahindra-logo.png' },
  { name: 'Maruti Suzuki', mark: 'S', color: '#df1730', type: 'Cars', description: 'Way of life', count: 46, logo: '/vehicle_logos/suzuki-logo.png' },
  { name: 'Kia', mark: 'KIA', color: '#172238', type: 'Cars', description: 'Movement that inspires', count: 15, logo: '/vehicle_logos/kia-logo.png' },
  { name: 'Renault', mark: 'R', color: '#f6a900', type: 'Cars', description: 'Passion for life', count: 12, logo: '/vehicle_logos/renault-logo.png' },
  { name: 'Royal Enfield', mark: 'RE', color: '#71ae24', type: 'Bikes', description: 'Made like a gun', count: 17, logo: '/vehicle_logos/Eicher_Motors-Logo.wine.svg' },
  { name: 'KTM', mark: 'KTM', color: '#fa5d13', type: 'Bikes', description: 'Ready to race', count: 13, logo: '/vehicle_logos/ktm-logo.png' },
  { name: 'Yamaha', mark: 'Y', color: '#202a94', type: 'Bikes', description: 'Revs your heart', count: 18, logo: '/vehicle_logos/Yamaha_Motor_Company-Logo.wine.svg' },
  { name: 'Bajaj', mark: 'B', color: '#1575a3', type: 'Bikes', description: 'The world\'s favourite', count: 21, logo: '' },
  { name: 'TVS', mark: 'TVS', color: '#e6252e', type: 'Bikes', description: 'Inspiring confidence', count: 26, logo: '/vehicle_logos/TVS_Motor_Company-Logo.wine.svg' },
  { name: 'Triumph', mark: 'T', color: '#292929', type: 'Bikes', description: 'For the ride', count: 8, logo: '' },
  { name: 'Ducati', mark: 'D', color: '#c51d2f', type: 'Bikes', description: 'Style, sport, soul', count: 6, logo: '' },
  { name: 'Harley-Davidson', mark: 'H-D', color: '#e66c1b', type: 'Bikes', description: 'All for freedom', count: 7, logo: '' },
];

@Component({
  selector: 'app-brands-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    LucideArrowRight,
    LucideBike,
    LucideCarFront,
    LucideChevronDown,
    LucideChevronRight,
    LucideSearch,
    LucideSparkles,
    LucideX
  ],
  templateUrl: './brands-page.component.html',
  styleUrl: './brands-page.component.scss'
})
export class BrandsPageComponent {
  readonly type = signal<VehicleType>('Cars');
  readonly query = signal('');
  readonly selectedBrand = signal<Brand | null>(null);
  readonly showAll = signal(false);
  readonly failedLogos = signal<Set<string>>(new Set());

  readonly filtered = computed(() =>
    BRANDS.filter(
      (brand) =>
        brand.type === this.type() &&
        brand.name.toLowerCase().includes(this.query().toLowerCase())
    )
  );

  readonly marqueeRows = computed(() => {
    const f = this.filtered();
    return [f.slice(0, 8), f.slice(3, 11), f.slice(6, 14)];
  });

  readonly repeatedMarqueeRows = computed(() =>
    this.marqueeRows().map((row) => [...row, ...row, ...row])
  );

  readonly directoryBrands = computed(() =>
    this.showAll() ? this.filtered() : this.filtered().slice(0, 8)
  );

  readonly totalVehicles = computed(() =>
    this.filtered().reduce((sum, item) => sum + item.count, 0)
  );

  isRings(mark: string): boolean {
    return mark === '\u25C9\u25C9\u25C9\u25C9';
  }

  setType(type: VehicleType): void {
    this.type.set(type);
    this.query.set('');
    this.showAll.set(false);
  }

  onQueryChange(value: string): void {
    this.query.set(value);
  }

  clearQuery(): void {
    this.query.set('');
  }

  toggleShowAll(): void {
    this.showAll.update((v) => !v);
  }

  selectBrand(brand: Brand): void {
    this.selectedBrand.set(brand);
  }

  closeModal(): void {
    this.selectedBrand.set(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('brand-modal-backdrop')) {
      this.closeModal();
    }
  }

  onLogoError(name: string): void {
    this.failedLogos.update((failed) => {
      const next = new Set(failed);
      next.add(name);
      return next;
    });
  }
}
