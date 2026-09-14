import { Component, ElementRef, inject, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

interface StatData {
  end: number;
  suffix: string;
  label: string;
}

const STATIC_STATS: StatData[] = [
  { end: 1000, suffix: '+', label: 'Verified vehicles' },
  { end: 31, suffix: '', label: 'Karnataka districts' },
  { end: 30, suffix: '+', label: 'Brands' },
  { end: 24, suffix: '/7', label: 'Buyer and seller support' }
];

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './statistics.component.html'
})
export class StatisticsComponent implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private rafId?: number;
  private animated = false;

  readonly progress = signal(0);
  readonly stats = signal<StatData[]>(STATIC_STATS);

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.progress.set(1);
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.animate();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  display(stat: StatData): string {
    return `${Math.round(stat.end * this.progress())}${stat.suffix}`;
  }

  private animate(): void {
    if (this.animated) return;
    this.animated = true;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      this.progress.set(eased);
      if (t < 1) {
        this.rafId = requestAnimationFrame(tick);
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }
}
