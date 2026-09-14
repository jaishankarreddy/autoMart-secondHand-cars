import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideClock, LucideArrowRight, LucideCar, LucidePhoneCall, LucideMessageCircle } from '@lucide/angular';

@Component({
  selector: 'app-sell-page',
  standalone: true,
  imports: [RouterLink, LucideClock, LucideArrowRight, LucideCar, LucidePhoneCall, LucideMessageCircle],
  templateUrl: './sell-page.component.html',
  styleUrl: './sell-page.component.scss'
})
export class SellPageComponent {}
