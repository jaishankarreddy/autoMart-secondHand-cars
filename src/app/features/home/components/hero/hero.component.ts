import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCar, LucideBike, LucideShieldCheck } from '@lucide/angular';
import { HERO_STATS } from '../../data/home.data';
import { MagneticDirective } from '../../directives/magnetic.directive';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1920&q=80';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, LucideCar, LucideBike, LucideShieldCheck, MagneticDirective],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  readonly image = HERO_IMAGE;
  readonly stats = HERO_STATS;
}
