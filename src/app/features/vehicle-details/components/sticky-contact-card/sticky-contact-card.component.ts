import { Component, input } from '@angular/core';
import { LucidePhoneCall, LucideMessageCircle, LucideBadgeIndianRupee } from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';

@Component({
  selector: 'app-sticky-contact-card',
  standalone: true,
  imports: [LucidePhoneCall, LucideMessageCircle, LucideBadgeIndianRupee, RippleDirective],
  templateUrl: './sticky-contact-card.component.html',
  styleUrl: './sticky-contact-card.component.scss'
})
export class StickyContactCardComponent {
  readonly price = input.required<number>();
  readonly phone = input('+91 98765 43210');
  readonly whatsapp = input('919844555308');
}
