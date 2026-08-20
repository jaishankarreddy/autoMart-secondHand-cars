import { Component } from '@angular/core';
import { LandingComponent } from '../../components/landing/landing.component';
import { PopularBrandsComponent } from '../../components/popular-brands/popular-brands.component';
import { FeaturedVehiclesComponent } from '../../components/featured-vehicles/featured-vehicles.component';
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
    LandingComponent,
    PopularBrandsComponent,
    FeaturedVehiclesComponent,
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
