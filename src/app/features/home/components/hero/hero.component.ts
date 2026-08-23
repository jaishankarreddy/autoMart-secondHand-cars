import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import { LucideCar, LucideBike, LucideShieldCheck } from '@lucide/angular';
import { MagneticDirective } from '../../directives/magnetic.directive';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1920&q=80';

interface HeroStat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, LucideCar, LucideBike, LucideShieldCheck, MagneticDirective],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly image = HERO_IMAGE;
  readonly stats = signal<HeroStat[]>([]);

  ngOnInit(): void {
    this.http.get<HeroStat[]>(`${API_BASE}/homestats?section=hero`).subscribe({
      next: (list) => this.stats.set(list),
      error: () => this.stats.set([])
    });
  }
}
