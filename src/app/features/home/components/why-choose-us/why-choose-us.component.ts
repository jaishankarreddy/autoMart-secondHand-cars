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
}
