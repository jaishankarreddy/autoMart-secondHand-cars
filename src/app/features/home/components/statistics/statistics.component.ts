import { Component, ElementRef, inject, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

interface StatData {
  end: number;
  suffix: string;
  label: string;
}

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

  readonly progress = signal(0);

  readonly stats: StatData[] = [
    { end: 1000, suffix: '+', label: 'Vehicles' },
    { end: 500, suffix: '+', label: 'Happy Buyers' },
    { end: 30, suffix: '+', label: 'Brands' },
    { end: 31, suffix: '', label: 'Districts' }
  ];

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
