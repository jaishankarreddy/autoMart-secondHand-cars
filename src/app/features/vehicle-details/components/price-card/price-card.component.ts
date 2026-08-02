import { Component, input } from '@angular/core';
import { LucideBadgeIndianRupee, LucidePhoneCall, LucideMessageCircle, LucideCalendarCheck, LucideShieldCheck } from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';

@Component({
  selector: 'app-price-card',
  standalone: true,
  imports: [LucideBadgeIndianRupee, LucidePhoneCall, LucideMessageCircle, LucideCalendarCheck, LucideShieldCheck, RippleDirective],
  templateUrl: './price-card.component.html',
  styleUrl: './price-card.component.scss'
})
export class PriceCardComponent {
  readonly priceInLakh = input.required<number>();
  readonly phone = input('+91 98765 43210');
  readonly whatsapp = input('919876543210');

  get priceInRupees(): string {
    return (this.priceInLakh() * 100000).toLocaleString('en-IN');
  }
}
