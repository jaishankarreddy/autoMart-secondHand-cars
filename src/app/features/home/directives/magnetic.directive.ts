import { Directive, ElementRef, inject, OnDestroy } from '@angular/core';

/** Magnetic effect: the host element gently drifts toward the cursor
 *  while hovered and springs back to rest when the cursor leaves.
 *  Skipped automatically when the user prefers reduced motion. */
@Directive({
  selector: '[appMagnetic]',
  standalone: true
})
export class MagneticDirective implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);

  private readonly reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly strength = 0.28;
  private rafId?: number;

  constructor() {
    if (this.reduced) {
      return;
    }
    const target = this.el.nativeElement;
    target.addEventListener('mousemove', this.onMove);
    target.addEventListener('mouseleave', this.onLeave);
  }

  ngOnDestroy(): void {
    const target = this.el.nativeElement;
    target.removeEventListener('mousemove', this.onMove);
    target.removeEventListener('mouseleave', this.onLeave);
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  private readonly onMove = (e: MouseEvent) => {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) * this.strength;
    const dy = (e.clientY - rect.top - rect.height / 2) * this.strength;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(() => {
      this.el.nativeElement.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    });
  };

  private readonly onLeave = () => {
    const target = this.el.nativeElement;
    target.style.translate = '0px 0px';
  };
}
