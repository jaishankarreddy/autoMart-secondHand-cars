import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { POPULAR_BRANDS } from '../../data/brands.data';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-popular-brands',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, SectionHeadingComponent, RevealDirective],
  templateUrl: './popular-brands.component.html'
})
export class PopularBrandsComponent {
  readonly brands = POPULAR_BRANDS;
  readonly failedLogos = signal<Set<string>>(new Set());

  onLogoError(name: string): void {
    this.failedLogos.update((failed) => {
      const next = new Set(failed);
      next.add(name);
      return next;
    });
  }
}
