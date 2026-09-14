import { Component } from '@angular/core';
import {
  LucideBadgeCheck,
  LucideBanknote,
  LucideShieldCheck,
  LucideMessageCircle,
  LucideHandCoins,
  LucideTruck
} from '@lucide/angular';
import { WHY_CHOOSE_US } from '../../data/home.data';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-why-choose-us',
  standalone: true,
  imports: [
    LucideBadgeCheck,
    LucideBanknote,
    LucideShieldCheck,
    LucideMessageCircle,
    LucideHandCoins,
    LucideTruck,
    SectionHeadingComponent,
    RevealDirective
  ],
  templateUrl: './why-choose-us.component.html',
  styleUrl: './why-choose-us.component.scss'
})
export class WhyChooseUsComponent {
  readonly features = WHY_CHOOSE_US;

  bentoClass(index: number): string {
    switch (index) {
      case 0: return 'lg:col-span-2';
      case 5: return 'lg:col-span-3';
      default: return '';
    }
  }

  cardClass(index: number): string {
    const base =
      'group relative overflow-hidden rounded-xl border p-6 shadow-sm am-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ';
    const dark = index === 5
      ? 'card-dark border-transparent bg-[#14272c] hover:border-[#2f454d] '
      : 'border-[#e5e2da] bg-white hover:border-[#cfd8d4] ';
    return base + dark + this.bentoClass(index);
  }
}
