import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  standalone: true,
  template: `
    <div
      class="max-w-2xl"
      [class.mx-auto]="center()"
      [class.text-center]="center()"
      [class.mx-0]="!center()"
      [class.text-left]="!center()"
    >
      @if (eyebrow()) {
        <span class="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          <span class="h-0.5 w-8 rounded-full bg-primary"></span>
          {{ eyebrow() }}
        </span>
      }
      <h2 class="mt-5 font-heading text-3xl font-extrabold leading-[1.1] tracking-tight text-text sm:text-4xl lg:text-[2.6rem]">
        {{ title() }}
      </h2>
      @if (subtitle()) {
        <p class="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          {{ subtitle() }}
        </p>
      }
    </div>
  `
})
export class SectionHeadingComponent {
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly center = input(false);
}
