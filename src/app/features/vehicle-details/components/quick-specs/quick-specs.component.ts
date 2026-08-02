import { Component, input } from '@angular/core';
import { LucideCalendar, LucideFuel, LucideCog, LucideGauge, LucideUsers, LucideSettings2, LucideZap, LucidePalette, LucideFileBadge, LucideShieldCheck } from '@lucide/angular';
import { VehicleDetail } from '../../models/vehicle-detail.model';

@Component({
  selector: 'app-quick-specs',
  standalone: true,
  imports: [
    LucideCalendar,
    LucideFuel,
    LucideCog,
    LucideGauge,
    LucideUsers,
    LucideSettings2,
    LucideZap,
    LucidePalette,
    LucideFileBadge,
    LucideShieldCheck
  ],
  templateUrl: './quick-specs.component.html',
  styleUrl: './quick-specs.component.scss'
})
export class QuickSpecsComponent {
  readonly vehicle = input.required<VehicleDetail>();

  specs(v: VehicleDetail): { icon: string; label: string; value: string }[] {
    return [
      { icon: 'calendar', label: 'Year', value: String(v.year) },
      { icon: 'fuel', label: 'Fuel', value: v.fuel },
      { icon: 'cog', label: 'Transmission', value: v.transmission },
      { icon: 'gauge', label: 'Mileage', value: `${v.mileage} km/l` },
      { icon: 'users', label: 'Ownership', value: `${v.owners} owner${v.owners > 1 ? 's' : ''}` },
      { icon: 'settings', label: 'Engine', value: v.engine },
      { icon: 'zap', label: 'Power', value: v.power },
      { icon: 'palette', label: 'Color', value: v.color },
      { icon: 'fileBadge', label: 'Registration', value: v.registration },
      { icon: 'shieldCheck', label: 'Insurance', value: v.insurance }
    ];
  }
}
