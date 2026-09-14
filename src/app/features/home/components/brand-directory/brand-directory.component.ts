import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideChevronDown,
  LucideChevronRight
} from '@lucide/angular';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { RevealDirective } from '../../directives/reveal.directive';

interface BrandDirectoryEntry {
  name: string;
  code: string;
  color: string;
  logo: string;
  type: string;
  count: number;
}

const LOGO_MAP: Record<string, string> = {
  'Maruti Suzuki': '/vehicle_logos/suzuki-logo.png',
  'Hyundai': '/vehicle_logos/hyundai-logo.png',
  'Honda': '/vehicle_logos/honda-logo.png',
  'Toyota': '/vehicle_logos/toyota-logo.png',
  'Mahindra': '/vehicle_logos/mahindra-logo.png',
  'Tata': '/vehicle_logos/tata-logo.png',
  'BMW': '/vehicle_logos/bmw-logo.png',
  'Mercedes': '/vehicle_logos/mercedes-benz-logo.png',
  'Mercedes-Benz': '/vehicle_logos/mercedes-benz-logo.png',
  'Audi': '/vehicle_logos/audi-logo.png',
  'Kia': '/vehicle_logos/kia-logo.png',
  'Skoda': '/vehicle_logos/skoda-logo.png',
  'Volkswagen': '/vehicle_logos/volkswagen-logo.png',
  'KTM': '/vehicle_logos/ktm-logo.png',
  'Renault': '/vehicle_logos/renault-logo.png',
  'TVS': '/vehicle_logos/TVS_Motor_Company-Logo.wine.svg',
  'Hero': '/vehicle_logos/Hero_MotoCorp-Logo.wine.svg',
  'Yamaha': '/vehicle_logos/Yamaha_Motor_Company-Logo.wine.svg',
  'Ford': '/vehicle_logos/ford-logo.png',
  'Chevrolet': '/vehicle_logos/chevrolet-logo.png',
  'Nissan': '/vehicle_logos/nissan-logo.png',
  'Jeep': '/vehicle_logos/jeep-logo.png',
  'MG': '/vehicle_logos/mg-logo.png',
  'Volvo': '/vehicle_logos/volvo-logo.png',
  'Lexus': '/vehicle_logos/lexus-logo.png',
  'Subaru': '/vehicle_logos/subaru-logo.png',
  'Mazda': '/vehicle_logos/mazda-logo.png',
  'Fiat': '/vehicle_logos/fiat-logo.png',
  'Tesla': '/vehicle_logos/tesla-logo.png',
};

const STATIC_BRANDS: BrandDirectoryEntry[] = [
  { name: 'Maruti Suzuki', code: 'MS', color: '#e34b4b', logo: '', type: 'car', count: 42 },
  { name: 'Hyundai', code: 'HY', color: '#1472b8', logo: '', type: 'car', count: 36 },
  { name: 'Tata', code: 'TA', color: '#1f4e79', logo: '', type: 'car', count: 31 },
  { name: 'Mahindra', code: 'MA', color: '#c23c32', logo: '', type: 'car', count: 28 },
  { name: 'Toyota', code: 'TO', color: '#d71920', logo: '', type: 'car', count: 24 },
  { name: 'Honda', code: 'HO', color: '#cc1f2f', logo: '', type: 'car', count: 19 },
  { name: 'Kia', code: 'KI', color: '#1d1d1d', logo: '', type: 'car', count: 17 },
  { name: 'BMW', code: 'BM', color: '#1f5da8', logo: '', type: 'car', count: 12 },
  { name: 'Royal Enfield', code: 'RE', color: '#c28c36', logo: '', type: 'bike', count: 26 },
  { name: 'Yamaha', code: 'YA', color: '#1d4e9e', logo: '', type: 'bike', count: 21 },
  { name: 'Bajaj', code: 'BA', color: '#1674bb', logo: '', type: 'bike', count: 18 },
  { name: 'TVS', code: 'TV', color: '#e42d31', logo: '', type: 'bike', count: 16 },
  { name: 'Hero', code: 'HE', color: '#e1262f', logo: '', type: 'bike', count: 14 },
  { name: 'KTM', code: 'KT', color: '#f58220', logo: '', type: 'bike', count: 10 },
  { name: 'Volkswagen', code: 'VW', color: '#1c4b78', logo: '', type: 'car', count: 9 },
  { name: 'Skoda', code: 'SK', color: '#16834b', logo: '', type: 'car', count: 8 }
];

@Component({
  selector: 'app-brand-directory',
  standalone: true,
  imports: [
    RouterLink,
    LucideArrowRight,
    LucideChevronDown,
    LucideChevronRight,
    SectionHeadingComponent,
    RevealDirective
  ],
  templateUrl: './brand-directory.component.html',
  styleUrl: './brand-directory.component.scss'
})
export class BrandDirectoryComponent {
  readonly brands = signal<BrandDirectoryEntry[]>(STATIC_BRANDS);
  readonly showAll = signal(false);
  readonly failedLogos = signal<Set<string>>(new Set());
  readonly initialCount = 12;

  readonly visibleBrands = computed(() =>
    this.showAll() ? this.brands() : this.brands().slice(0, this.initialCount)
  );

  readonly totalCount = computed(() =>
    this.brands().reduce((sum, b) => sum + b.count, 0)
  );

  getLogo(brand: BrandDirectoryEntry): string {
    return LOGO_MAP[brand.name] || brand.logo || '';
  }

  toggleShowAll(): void {
    this.showAll.update((v) => !v);
  }

  onLogoError(name: string): void {
    this.failedLogos.update((failed) => {
      const next = new Set(failed);
      next.add(name);
      return next;
    });
  }

}
