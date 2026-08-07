import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { RevealDirective } from '../../directives/reveal.directive';

interface ApiBrand {
  name: string;
  code: string;
  color: string;
  logo?: string;
}

@Component({
  selector: 'app-popular-brands',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, SectionHeadingComponent, RevealDirective],
  templateUrl: './popular-brands.component.html'
})
export class PopularBrandsComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly brands = signal<ApiBrand[]>([]);
  readonly failedLogos = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.http.get<ApiBrand[]>('/api/brands').subscribe({
      next: (list) => this.brands.set(list.filter((b) => b.logo || b.code)),
      error: () => this.brands.set([])
    });
  }

  onLogoError(name: string): void {
    this.failedLogos.update((failed) => {
      const next = new Set(failed);
      next.add(name);
      return next;
    });
  }
}
