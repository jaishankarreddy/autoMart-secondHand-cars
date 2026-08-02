import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronRight, LucideShieldCheck } from '@lucide/angular';

@Component({
  selector: 'app-bike-page-header',
  standalone: true,
  imports: [RouterLink, LucideChevronRight, LucideShieldCheck],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class BikePageHeaderComponent {}
