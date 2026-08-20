import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCheck,
  LucideCar,
  LucideShieldCheck,
  LucideHandshake
} from '@lucide/angular';
import { FooterComponent } from '../../home/components/footer/footer.component';
import { WhyChooseUsComponent } from '../../home/components/why-choose-us/why-choose-us.component';
import { StatisticsComponent } from '../../home/components/statistics/statistics.component';
import { TestimonialsComponent } from '../../home/components/testimonials/testimonials.component';
import { CtaComponent } from '../../home/components/cta/cta.component';
import { RevealDirective } from '../../home/directives/reveal.directive';
import { RippleDirective } from '../../cars/directives/ripple.directive';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    WhyChooseUsComponent,
    StatisticsComponent,
    TestimonialsComponent,
    CtaComponent,
    RevealDirective,
    RippleDirective,
    LucideCheck,
    LucideCar,
    LucideShieldCheck,
    LucideHandshake
  ],
  templateUrl: './about.page.html'
})
export class AboutPageComponent {
  readonly checklist = [
    '200-point certified inspection on every vehicle',
    'Transparent pricing with zero hidden charges',
    'Paperwork, insurance and RC transfer handled for you',
    '7-day money-back guarantee on eligible vehicles'
  ];
}
