import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import {
  LucideBadgeCheck,
  LucideCalendarDays,
  LucideCheck,
  LucideChevronRight,
  LucideCircleCheck,
  LucideClock3,
  LucideFuel,
  LucideGauge,
  LucideHeart,
  LucideMapPin,
  LucideMessageCircle,
  LucidePalette,
  LucidePhone,
  LucideRoute,
  LucideSend,
  LucideShare2,
  LucideShieldCheck,
  LucideSlidersHorizontal,
  LucideSparkles,
  LucideTag,
  LucideUsers,
  LucideZap
} from '@lucide/angular';
import { FooterComponent } from '../../../home/components/footer/footer.component';
import { StickyContactCardComponent } from '../../components/sticky-contact-card/sticky-contact-card.component';
import { ImageGalleryComponent } from '../../components/image-gallery/image-gallery.component';
import { VehicleDetailsService } from '../../services/vehicle-details.service';
import { WishlistService } from '../../../../services/wishlist.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-vehicle-details-page',
  standalone: true,
  imports: [
    FooterComponent,
    StickyContactCardComponent,
    ImageGalleryComponent,
    LucideBadgeCheck,
    LucideCalendarDays,
    LucideCheck,
    LucideChevronRight,
    LucideCircleCheck,
    LucideClock3,
    LucideFuel,
    LucideGauge,
    LucideHeart,
    LucideMapPin,
    LucideMessageCircle,
    LucidePalette,
    LucidePhone,
    LucideRoute,
    LucideSend,
    LucideShare2,
    LucideShieldCheck,
    LucideSlidersHorizontal,
    LucideSparkles,
    LucideTag,
    LucideUsers,
    LucideZap
  ],
  templateUrl: './vehicle-details-page.component.html',
  styleUrl: './vehicle-details-page.component.scss'
})
export class VehicleDetailsPageComponent {
  private readonly service = inject(VehicleDetailsService);
  private readonly wishlist = inject(WishlistService);
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  /** Route param bound automatically via withComponentInputBinding. */
  readonly id = input.required<string>();

  readonly vehicle = this.service.detail;
  readonly loading = this.service.loading;

  readonly saved = signal(false);
  readonly showAllPhotos = signal(false);
  readonly offerSent = signal(false);
  readonly name = signal('');
  readonly phone = signal('');
  readonly offerPrice = signal('');
  readonly message = signal('');

  readonly isBike = computed(() => this.vehicle()?.vehicleType === 'bike');
  readonly images = computed(() => {
    const images = this.vehicle()?.images ?? [];
    return images.length ? images : [this.vehicle()?.image ?? ''];
  });
  readonly photos = computed(() => this.images());
  readonly primaryImage = computed(() => this.images()[0] ?? '');

  readonly formatPrice = (price: number) =>
    `₹${Math.round(price).toLocaleString('en-IN')}`;
  readonly formatDistance = (km: number) => `${km.toLocaleString('en-IN')} km`;

  readonly phoneLink = computed(() => this.vehicle()?.seller.phone ?? '+91 98765 43210');
  readonly whatsappLink = computed(() => this.vehicle()?.seller.whatsapp ?? '919844555308');
  readonly contactPhone = this.phoneLink;
  readonly contactWhatsapp = this.whatsappLink;
  readonly contactPrice = computed(() => this.vehicle()?.price ?? 0);

  readonly specs = computed(() => {
    const v = this.vehicle();
    if (!v) return [];
    const isBike = v.vehicleType === 'bike';
    const array: { icon: string; label: string; value: string | number }[] = [
      { icon: 'calendar', label: 'Year', value: v.year },
      { icon: 'fuel', label: 'Fuel type', value: v.fuel },
      { icon: 'sliders', label: 'Transmission', value: v.transmission },
      { icon: 'route', label: 'Mileage', value: `${v.mileage} km/l` },
      { icon: 'users', label: 'Ownership', value: `${v.owners} owner${v.owners > 1 ? 's' : ''}` },
      { icon: isBike ? 'gauge' : 'zap', label: isBike ? 'Engine' : 'Powertrain', value: v.engine || 'Not provided' },
      { icon: 'palette', label: 'Color', value: v.color },
      { icon: 'shield', label: 'Safety', value: v.abs ? 'ABS equipped' : 'Standard safety' }
    ];
    return array;
  });

  readonly features = computed(() => {
    const v = this.vehicle();
    if (!v) return [];
    return v.features.flatMap((g) => g.items);
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.service.load(id);
        this.saved.set(this.wishlist.has(id));
      }
    });
  }

  toggleSaved(): void {
    const v = this.vehicle();
    if (!v) return;
    this.wishlist.toggle(v.id);
    this.saved.set(this.wishlist.has(v.id));
  }

  share(): void {
    const v = this.vehicle();
    const data = { title: `${v?.brand} ${v?.model}`, text: `Check out this ${v?.brand} ${v?.model} on Ayra Cars`, url: window.location.href };
    if (navigator.share) {
      navigator.share(data).catch(() => undefined);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() =>
        this.toast.info('Link copied', 'The vehicle link has been copied to your clipboard.')
      );
    }
  }

  scrollToOffer(): void {
    document.getElementById('offer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  submitOffer(event: Event): void {
    event.preventDefault();
    const v = this.vehicle();
    if (!v) return;
    if (!this.name().trim() || !this.phone().trim() || !this.offerPrice().trim()) {
      this.toast.error('Please complete the form', 'Your name, phone number and offer price are required.');
      return;
    }
    this.http
      .post(`${API_BASE}/offers`, {
        vehicleId: v.id,
        name: this.name().trim(),
        phone: this.phone().trim(),
        offerPrice: Number(this.offerPrice()),
        message: this.message().trim()
      })
      .subscribe({
        next: () => {
          this.offerSent.set(true);
          this.toast.success('Offer submitted!', `Our experts will contact you within 30 minutes for the ${v.brand} ${v.model}.`);
        },
        error: () => {
          this.offerSent.set(false);
          this.toast.error('Something went wrong', 'We could not submit your offer. Please try again in a moment.');
        }
      });
  }
}