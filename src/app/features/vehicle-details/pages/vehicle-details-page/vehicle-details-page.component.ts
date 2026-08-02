import { Component, computed, effect, inject, input } from '@angular/core';
import { NavbarComponent } from '../../../home/components/navbar/navbar.component';
import { FooterComponent } from '../../../home/components/footer/footer.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb.component';
import { ImageGalleryComponent } from '../../components/image-gallery/image-gallery.component';
import { VehicleInfoComponent } from '../../components/vehicle-info/vehicle-info.component';
import { PriceCardComponent } from '../../components/price-card/price-card.component';
import { QuickSpecsComponent } from '../../components/quick-specs/quick-specs.component';
import { FeaturesComponent } from '../../components/features/features.component';
import { SellerInfoComponent } from '../../components/seller-info/seller-info.component';
import { OfferFormComponent } from '../../components/offer-form/offer-form.component';
import { SimilarVehiclesComponent } from '../../components/similar-vehicles/similar-vehicles.component';
import { StickyContactCardComponent } from '../../components/sticky-contact-card/sticky-contact-card.component';
import { VehicleDetailsService } from '../../services/vehicle-details.service';

@Component({
  selector: 'app-vehicle-details-page',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    BreadcrumbComponent,
    ImageGalleryComponent,
    VehicleInfoComponent,
    PriceCardComponent,
    QuickSpecsComponent,
    FeaturesComponent,
    SellerInfoComponent,
    OfferFormComponent,
    SimilarVehiclesComponent,
    StickyContactCardComponent
  ],
  templateUrl: './vehicle-details-page.component.html',
  styleUrl: './vehicle-details-page.component.scss'
})
export class VehicleDetailsPageComponent {
  private readonly service = inject(VehicleDetailsService);

  /** Route param bound automatically via withComponentInputBinding. */
  readonly id = input.required<string>();

  readonly vehicle = this.service.detail;
  readonly similar = this.service.similar;
  readonly loading = this.service.loading;

  readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    { label: 'Cars', path: '/cars' },
    { label: this.vehicle() ? `${this.vehicle()!.brand} ${this.vehicle()!.model}` : 'Vehicle' }
  ]);

  readonly contactPhone = computed(
    () => this.vehicle()?.seller.phone ?? '+91 98765 43210'
  );
  readonly contactWhatsapp = computed(
    () => this.vehicle()?.seller.whatsapp ?? '919876543210'
  );
  readonly contactPrice = computed(() => this.vehicle()?.priceInLakh ?? 0);

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.service.load(id);
      }
    });
  }
}
