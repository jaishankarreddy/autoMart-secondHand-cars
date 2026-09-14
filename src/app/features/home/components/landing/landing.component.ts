import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideCarFront,
  LucideCheck,
  LucideChevronDown,
  LucideSearch,
  LucideShieldCheck,
  LucideSparkles,
  LucideTag,
  LucideUsers,
  LucideTruck,
  LucideX
} from '@lucide/angular';
import { CatalogService } from '../../../../services/catalog.service';

const HERO_IMAGE = '/home_landing.png';
const HERO_MOBILE_IMAGE = '/home_landing_mobile.png';

interface BudgetOption {
  value: string;
  label: string;
}

const BUDGET_OPTIONS: BudgetOption[] = [
  { value: '0-5', label: 'Under ₹5,00,000' },
  { value: '5-10', label: '₹5,00,000 – ₹10,00,000' },
  { value: '10-15', label: '₹10,00,000 – ₹15,00,000' },
  { value: '15-25', label: '₹15,00,000 – ₹25,00,000' },
  { value: '25+', label: '₹25,00,000+' }
];

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterLink,
    LucideArrowRight,
    LucideCarFront,
    LucideCheck,
    LucideChevronDown,
    LucideSearch,
    LucideShieldCheck,
    LucideSparkles,
    LucideTag,
    LucideUsers,
    LucideTruck,
    LucideX
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogService);

  readonly heroImage = HERO_IMAGE;
  readonly heroMobileImage = HERO_MOBILE_IMAGE;
  readonly searchOpen = signal(false);
  readonly dropdownOpen = signal<'type' | 'brand' | 'budget' | null>(null);
  readonly searchType = signal<'car' | 'bike'>('car');
  readonly searchBrand = signal('');
  readonly searchBudget = signal('');

  readonly budgetOptions = BUDGET_OPTIONS;
  readonly brands = computed(() => {
    const vehicles = this.searchType() === 'car' ? this.catalog.cars() : this.catalog.bikes();
    return [...new Set(vehicles.map((vehicle) => vehicle.brand))].sort();
  });

  constructor() {
    this.catalog.load();
  }

  toggleDropdown(dropdown: 'type' | 'brand' | 'budget'): void {
    this.dropdownOpen.update((open) => open === dropdown ? null : dropdown);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(null);
  }

  selectType(type: 'car' | 'bike'): void {
    this.searchType.set(type);
    this.searchBrand.set('');
    this.closeDropdown();
  }

  selectBrand(brand: string): void {
    this.searchBrand.set(brand);
    this.closeDropdown();
  }

  selectBudget(budget: string): void {
    this.searchBudget.set(budget);
    this.closeDropdown();
  }

  budgetLabel(): string {
    return this.budgetOptions.find((option) => option.value === this.searchBudget())?.label ?? 'Any budget';
  }

  submitSearch(event: Event): void {
    event.preventDefault();
    const type = this.searchType();
    const queryParams: Record<string, string> = { type };
    if (this.searchBrand()) queryParams['brand'] = this.searchBrand();
    if (this.searchBudget()) queryParams['budget'] = this.searchBudget();
    this.router.navigate([`/${type === 'bike' ? 'bikes' : 'cars'}`], { queryParams });
  }
}