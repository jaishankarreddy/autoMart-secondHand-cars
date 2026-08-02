import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronRight, LucideHome } from '@lucide/angular';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, LucideChevronRight, LucideHome],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();
}
