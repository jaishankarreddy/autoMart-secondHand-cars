import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
  `,
  styles: `
    :host { display: block; }
  `
})
export class PublicLayoutComponent {}
