import { Component } from '@angular/core';
import { LucideStar, LucideQuote } from '@lucide/angular';
import { TESTIMONIALS } from '../../data/home.data';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [LucideStar, LucideQuote, SectionHeadingComponent, RevealDirective],
  templateUrl: './testimonials.component.html'
})
export class TestimonialsComponent {
  readonly testimonials = TESTIMONIALS;

  stars(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
