import { Directive, ElementRef, inject, OnDestroy } from '@angular/core';

/** 3D tilt + cursor spotlight for cards.
 *  Updates `--tilt-rx` / `--tilt-ry` (degrees) and `--mx` / `--my` (percent)
 *  on the host so stylesheet can compose the tilt with its own transform.
 *  Automatically disabled when the user prefers reduced motion. */
@Directive({
  selector: '[appTilt]',
  standalone: true
})
export class TiltDirective implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);

  private readonly reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly maxTilt = 6;

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
  }

  private readonly onMove = (e: MouseEvent) => {
    const target = this.el.nativeElement;
    const rect = target.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    target.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    target.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    target.style.setProperty('--tilt-rx', `${((py - 0.5) * -1 * this.maxTilt).toFixed(2)}deg`);
    target.style.setProperty('--tilt-ry', `${((px - 0.5) * this.maxTilt).toFixed(2)}deg`);
  };

  private readonly onLeave = () => {
    const target = this.el.nativeElement;
    target.style.setProperty('--tilt-rx', '0deg');
    target.style.setProperty('--tilt-ry', '0deg');
  };
}
