import { Component, ElementRef, inject, signal, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import { RevealDirective } from '../../directives/reveal.directive';

interface StatData {
  end: number;
  suffix: string;
  label: string;
}

interface ApiStat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './statistics.component.html'
})
export class StatisticsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly http = inject(HttpClient);
  private observer?: IntersectionObserver;
  private rafId?: number;
  private animated = false;

  readonly progress = signal(0);
  readonly stats = signal<StatData[]>([]);

  ngOnInit(): void {
    this.http.get<ApiStat[]>(`${API_BASE}/homestats?section=section`).subscribe({
      next: (list) => this.stats.set(list.map((s) => this.toStat(s))),
      error: () => this.stats.set([])
    });
  }

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

  private toStat(s: ApiStat): StatData {
    const match = /^(.*?)([-+]?[\d.]+)(.*)$/.exec(s.value);
    if (match) {
      return { end: parseFloat(match[2]) ?? 0, suffix: match[3] ?? '', label: s.label };
    }
    return { end: 0, suffix: '', label: s.label };
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
