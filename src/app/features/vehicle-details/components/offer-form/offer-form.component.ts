import { Component, input, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  private readonly http = inject(HttpClient);

  readonly name = signal('');
  readonly phone = signal('');
  readonly offerPrice = signal('');
  readonly message = signal('');
  readonly submitted = signal(false);

  submit(): void {
    if (!this.name().trim() || !this.phone().trim() || !this.offerPrice().trim()) {
      return;
    }
    this.http
      .post('/api/offers', {
        vehicleId: this.vehicle().id,
        name: this.name().trim(),
        phone: this.phone().trim(),
        offerPrice: Number(this.offerPrice()),
        message: this.message().trim()
      })
      .subscribe({
        next: () => this.submitted.set(true),
        error: () => this.submitted.set(true)
      });
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