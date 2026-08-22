import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-sell-banner',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, RevealDirective],
  templateUrl: './sell-banner.component.html',
  styleUrl: './sell-banner.component.scss'
})
export class SellBannerComponent {}
