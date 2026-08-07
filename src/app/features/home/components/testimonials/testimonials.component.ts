import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LucideStar, LucideQuote } from '@lucide/angular';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { RevealDirective } from '../../directives/reveal.directive';

interface ApiTestimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  color: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [LucideStar, LucideQuote, SectionHeadingComponent, RevealDirective],
  templateUrl: './testimonials.component.html'
})
export class TestimonialsComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly testimonials = signal<ApiTestimonial[]>([]);

  ngOnInit(): void {
    this.http.get<ApiTestimonial[]>('/api/testimonials').subscribe({
      next: (list) => this.testimonials.set(list),
      error: () => this.testimonials.set([])
    });
  }

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
