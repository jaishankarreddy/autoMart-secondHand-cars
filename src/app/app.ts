import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHostComponent } from './ui/toast-host/toast-host.component';
import { BackToTopComponent } from './ui/back-to-top/back-to-top.component';
import { CompareBarComponent } from './ui/compare-bar/compare-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent, BackToTopComponent, CompareBarComponent],
  template: `
    <router-outlet />
    <app-toast-host />
    <app-back-to-top />
    <app-compare-bar />
  `
})
export class App {}
