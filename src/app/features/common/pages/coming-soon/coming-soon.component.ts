import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideClock } from '@lucide/angular';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, LucideClock],
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.scss'
})
export class ComingSoonComponent {
  readonly title = input<string>('Coming Soon');
  readonly description = input<string>('This page is under construction. We are working hard to bring it to you soon.');
}
