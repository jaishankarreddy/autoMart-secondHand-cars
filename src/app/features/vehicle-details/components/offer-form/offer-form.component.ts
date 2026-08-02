import { Component, input, signal } from '@angular/core';
import { LucideSend, LucideCheckCircle2, LucideShieldCheck } from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { VehicleDetail } from '../../models/vehicle-detail.model';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [LucideSend, LucideCheckCircle2, LucideShieldCheck, RippleDirective],
  templateUrl: './offer-form.component.html',
  styleUrl: './offer-form.component.scss'
})
export class OfferFormComponent {
  readonly vehicle = input.required<VehicleDetail>();

  readonly name = signal('');
  readonly phone = signal('');
  readonly offerPrice = signal('');
  readonly message = signal('');
  readonly submitted = signal(false);

  submit(): void {
    if (!this.name().trim() || !this.phone().trim() || !this.offerPrice().trim()) {
      return;
    }
    this.submitted.set(true);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  reset(): void {
    this.name.set('');
    this.phone.set('');
    this.offerPrice.set('');
    this.message.set('');
    this.submitted.set(false);
  }
}
