import { Component, input } from '@angular/core';
import { LucideShieldCheck, LucideArmchair, LucideCarFront, LucideSparkles, LucideHeadphones, LucideCheck } from '@lucide/angular';
import { FeatureGroup } from '../../models/vehicle-detail.model';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [LucideShieldCheck, LucideArmchair, LucideCarFront, LucideSparkles, LucideHeadphones, LucideCheck],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss'
})
export class FeaturesComponent {
  readonly features = input.required<FeatureGroup[]>();
}
