import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { LucideArrowUp } from '@lucide/angular';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [LucideArrowUp],
  template: `
    <button
      type="button"
      (click)="scrollTop()"
      [class.opacity-0]="!visible()"
      [class.pointer-events-none]="!visible()"
      aria-label="Back to top"
      class="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-primary transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover active:scale-95"
    >
      <svg lucideArrowUp class="h-5 w-5"></svg>
    </button>
  `
})
export class BackToTopComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly visible = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      });

    if (typeof window === 'undefined') return;
    const onScroll = () => this.visible.set(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
