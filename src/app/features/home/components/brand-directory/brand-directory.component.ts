import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
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
  'Honda': '/vehicle_logos/Honda-Logo.wine.svg',
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
  'Royal Enfield': '/vehicle_logos/Eicher_Motors-Logo.wine.svg',
  'TVS': '/vehicle_logos/TVS_Motor_Company-Logo.wine.svg',
  'Hero': '/vehicle_logos/Hero_MotoCorp-Logo.wine.svg',
  'Yamaha': '/vehicle_logos/Yamaha_Motor_Company-Logo.wine.svg',
  'Bajaj': '/vehicle_logos/bajaj-logo.png',
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
export class BrandDirectoryComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly brands = signal<BrandDirectoryEntry[]>([]);
  readonly showAll = signal(false);
  readonly failedLogos = signal<Set<string>>(new Set());
  readonly initialCount = 12;

  readonly visibleBrands = computed(() =>
    this.showAll() ? this.brands() : this.brands().slice(0, this.initialCount)
  );

  readonly totalCount = computed(() =>
    this.brands().reduce((sum, b) => sum + b.count, 0)
  );

  ngOnInit(): void {
    this.http.get<BrandDirectoryEntry[]>(`${API_BASE}/brands/directory`).subscribe({
      next: (list) => {
        const enriched = list.map((b) => ({
          ...b,
          logo: LOGO_MAP[b.name] || b.logo || ''
        }));
        this.brands.set(enriched);
      },
      error: () => this.brands.set([])
    });
  }

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

  brandLink(brand: BrandDirectoryEntry): string {
    const param = brand.type === 'bike' ? '/bikes' : '/cars';
    return param + '?brand=' + encodeURIComponent(brand.name);
  }
}
