import { Component, signal } from '@angular/core';
import { LucideStar, LucideQuote } from '@lucide/angular';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { RevealDirective } from '../../directives/reveal.directive';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  color: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Rahul Sharma',
    role: 'Bought a Hyundai Creta',
    quote: 'The entire process was seamless. The car was exactly as described and the inspection report gave me full confidence in my purchase.',
    rating: 5,
    color: '#152329'
  },
  {
    name: 'Priya Nair',
    role: 'Bought a Royal Enfield Classic 350',
    quote: 'I was nervous about buying a used bike online, but Ayra Cars made it hassle-free. Great quality and transparent pricing.',
    rating: 5,
    color: '#eb7138'
  },
  {
    name: 'Mohammed Farhan',
    role: 'Bought a Maruti Swift',
    quote: 'Found the perfect family car at a great price. The team was helpful throughout and the paperwork was handled professionally.',
    rating: 5,
    color: '#2563eb'
  },
  {
    name: 'Ananya Reddy',
    role: 'Sold a Honda City',
    quote: 'Sold my car within a week through Ayra Cars. They handled everything from photography to buyer negotiation. Highly recommend!',
    rating: 5,
    color: '#059669'
  },
  {
    name: 'Vikram Patel',
    role: 'Bought a Kia Seltos',
    quote: 'Excellent experience! The vehicle condition matched the listing perfectly. No hidden issues, no surprises. Will buy again.',
    rating: 4,
    color: '#7c3aed'
  },
  {
    name: 'Deepa Krishnan',
    role: 'Bought a TVS Apache RTR',
    quote: 'Quick, easy, and trustworthy. Ayra Cars is the way to go for anyone looking for a certified pre-owned vehicle in Bangalore.',
    rating: 5,
    color: '#dc2626'
  }
];

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [LucideStar, LucideQuote, SectionHeadingComponent, RevealDirective],
  templateUrl: './testimonials.component.html'
})
export class TestimonialsComponent {
  readonly testimonials = signal<Testimonial[]>(TESTIMONIALS);

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
