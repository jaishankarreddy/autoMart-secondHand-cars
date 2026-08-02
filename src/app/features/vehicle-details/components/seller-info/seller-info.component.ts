import { Component, input } from '@angular/core';
import { LucideBadgeCheck, LucideClock, LucideMapPin, LucideMessageCircle, LucidePhoneCall, LucideStar, LucideShieldCheck } from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { SellerInfo } from '../../models/vehicle-detail.model';

@Component({
  selector: 'app-seller-info',
  standalone: true,
  imports: [LucideBadgeCheck, LucideClock, LucideMapPin, LucideMessageCircle, LucidePhoneCall, LucideStar, LucideShieldCheck, RippleDirective],
  templateUrl: './seller-info.component.html',
  styleUrl: './seller-info.component.scss'
})
export class SellerInfoComponent {
  readonly seller = input.required<SellerInfo>();
}
