import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteNavbarComponent } from '../../ui/site-navbar/site-navbar.component';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, SiteNavbarComponent],
  template: `
    <app-site-navbar />
    <router-outlet />
  `,
  styles: `
    :host { display: block; }
  `
})
export class PublicLayoutComponent {}
