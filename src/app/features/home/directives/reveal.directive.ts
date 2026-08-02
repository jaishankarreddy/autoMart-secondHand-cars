import { Directive, ElementRef, AfterViewInit, inject } from '@angular/core';

/** Adds the `is-revealed` class to its host element once it scrolls into view,
 *  triggering the CSS `reveal` transition in styles.scss. */
@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    const target = this.el.nativeElement;
    if (!('IntersectionObserver' in window)) {
      target.classList.add('is-revealed');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            target.classList.add('is-revealed');
            observer.unobserve(target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(target);
  }
}
