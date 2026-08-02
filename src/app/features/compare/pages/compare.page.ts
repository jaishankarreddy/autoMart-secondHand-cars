import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucidePlus,
  LucideCheck,
  LucideX,
  LucideSearch,
  LucideScale,
  LucideCar,
  LucideBike,
  LucideStar
} from '@lucide/angular';
import { NavbarComponent } from '../../home/components/navbar/navbar.component';
import { FooterComponent } from '../../home/components/footer/footer.component';
import { PricePipe } from '../../home/pipes/price.pipe';
import { RippleDirective } from '../../cars/directives/ripple.directive';
import { RevealDirective } from '../../home/directives/reveal.directive';
import { CompareService, ComparableVehicle } from '../services/compare.service';

@Component({
  selector: 'app-compare-page',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    PricePipe,
    RippleDirective,
    RevealDirective,
    LucidePlus,
    LucideCheck,
    LucideX,
    LucideSearch,
    LucideScale,
    LucideCar,
    LucideBike,
    LucideStar
  ],
  templateUrl: './compare.page.html',
  styleUrl: './compare.page.scss'
})
export class ComparePageComponent {
  readonly service = inject(CompareService);
  readonly pickerKeyword = signal('');

  readonly pickerList = computed(() => {
    const kw = this.pickerKeyword().trim().toLowerCase();
    const list = this.service.catalog();
    if (!kw) return list;
    return list.filter((v) =>
      `${v.brand} ${v.model} ${v.variant} ${v.type}`.toLowerCase().includes(kw)
    );
  });

  selected(id: string): boolean {
    return this.service.ids().includes(id);
  }

  isBest(v: ComparableVehicle): boolean {
    return this.service.vehicles().length > 1 && v.priceInLakh === this.service.bestPrice();
  }
}
