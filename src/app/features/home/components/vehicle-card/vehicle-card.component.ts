import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideHeart,
  LucideArrowRight,
  LucideStar,
  LucideShieldCheck
} from '@lucide/angular';
import { Vehicle } from '../../models/vehicle.model';
import { PricePipe } from '../../pipes/price.pipe';
import { TiltDirective } from '../../directives/tilt.directive';

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [
    RouterLink,
    LucideHeart,
    LucideArrowRight,
    LucideStar,
    LucideShieldCheck,
    PricePipe,
    DecimalPipe,
    TiltDirective
  ],
  templateUrl: './vehicle-card.component.html',
  styleUrl: './vehicle-card.component.scss'
})
export class VehicleCardComponent {
  readonly vehicle = input.required<Vehicle>();
  readonly wishlisted = input(false);
}
