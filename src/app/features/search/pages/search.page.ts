import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideSearch,
  LucideX,
  LucideChevronDown,
  LucideSearchX,
  LucideCar,
  LucideBike,
  LucideSlidersHorizontal
} from '@lucide/angular';
import { NavbarComponent } from '../../home/components/navbar/navbar.component';
import { FooterComponent } from '../../home/components/footer/footer.component';
import { CarCardComponent } from '../../cars/components/car-card/car-card.component';
import { BikeCardComponent } from '../../bikes/components/bike-card/bike-card.component';
import { RippleDirective } from '../../cars/directives/ripple.directive';
import { RevealDirective } from '../../home/directives/reveal.directive';
import { SearchService, SearchVehicleType } from '../services/search.service';

interface Option {
  value: string;
  label: string;
}

const BUDGET_OPTIONS: Option[] = [
  { value: '', label: 'Any budget' },
  { value: '0-5', label: 'Under ₹5 Lakh' },
  { value: '5-10', label: '₹5 – ₹10 Lakh' },
  { value: '10-15', label: '₹10 – ₹15 Lakh' },
  { value: '15-25', label: '₹15 – ₹25 Lakh' },
  { value: '25+', label: '₹25 Lakh+' }
];

const TYPE_OPTIONS: { value: SearchVehicleType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'car', label: 'Cars' },
  { value: 'bike', label: 'Bikes' }
];

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    RouterLink,
    NavbarComponent,
    FooterComponent,
    CarCardComponent,
    BikeCardComponent,
    RippleDirective,
    RevealDirective,
    LucideSearch,
    LucideX,
    LucideChevronDown,
    LucideSearchX,
    LucideCar,
    LucideBike,
    LucideSlidersHorizontal
  ],
  templateUrl: './search.page.html',
  styleUrl: './search.page.scss'
})
export class SearchPageComponent {
  readonly service = inject(SearchService);
  readonly budgetOptions = BUDGET_OPTIONS;
  readonly typeOptions = TYPE_OPTIONS;

  constructor() {
    const q = inject(ActivatedRoute).snapshot.queryParamMap.get('q');
    if (q) {
      this.service.keyword.set(q);
    }
  }
}
