import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCar, LucideArrowRight } from '@lucide/angular';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [RouterLink, LucideCar, LucideArrowRight, RevealDirective],
  templateUrl: './cta.component.html'
})
export class CtaComponent {}
