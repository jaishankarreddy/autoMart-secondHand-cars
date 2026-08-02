import { Directive, ElementRef, inject, OnDestroy } from '@angular/core';

/** Adds a material-style ripple to the host element on click. */
@Directive({
  selector: '[appRipple]',
  standalone: true
})
export class RippleDirective implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly listeners: (() => void)[] = [];

  constructor() {
    const host = this.el.nativeElement;
    host.style.position = host.style.position || 'relative';
    host.style.overflow = host.style.overflow || 'hidden';

    const onPointer = (e: MouseEvent) => this.spawn(e);
    host.addEventListener('click', onPointer);
    this.listeners.push(() => host.removeEventListener('click', onPointer));
  }

  ngOnDestroy(): void {
    this.listeners.forEach((off) => off());
  }

  private spawn(e: MouseEvent): void {
    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'am-ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    host.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }
}
