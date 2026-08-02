import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { VehicleSearchComponent } from '../../components/vehicle-search/vehicle-search.component';
import { PopularBrandsComponent } from '../../components/popular-brands/popular-brands.component';
import { FeaturedCarsComponent } from '../../components/featured-cars/featured-cars.component';
import { FeaturedBikesComponent } from '../../components/featured-bikes/featured-bikes.component';
import { WhyChooseUsComponent } from '../../components/why-choose-us/why-choose-us.component';
import { StatisticsComponent } from '../../components/statistics/statistics.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    VehicleSearchComponent,
    PopularBrandsComponent,
    FeaturedCarsComponent,
    FeaturedBikesComponent,
    WhyChooseUsComponent,
    StatisticsComponent,
    TestimonialsComponent,
    FaqComponent,
    CtaComponent,
    FooterComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {}
