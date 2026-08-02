import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight, LucideMaximize2, LucideX, LucideZoomIn } from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { ThumbnailGalleryComponent } from '../thumbnail-gallery/thumbnail-gallery.component';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [ThumbnailGalleryComponent, RippleDirective, LucideChevronLeft, LucideChevronRight, LucideMaximize2, LucideX, LucideZoomIn],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss'
})
export class ImageGalleryComponent {
  readonly images = input.required<string[]>();
  readonly alt = input('');

  readonly activeIndex = signal(0);
  readonly fullscreen = signal(false);
  readonly zoomed = signal(false);

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => {
      document.body.style.overflow = '';
    });
  }

  readonly activeImage = () => this.images()[this.activeIndex()];

  prev(): void {
    this.activeIndex.update((i) => (i - 1 + this.images().length) % this.images().length);
  }

  next(): void {
    this.activeIndex.update((i) => (i + 1) % this.images().length);
  }

  selectIndex(index: number): void {
    this.activeIndex.set(index);
  }

  openFullscreen(): void {
    this.fullscreen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeFullscreen(): void {
    this.fullscreen.set(false);
    this.zoomed.set(false);
    document.body.style.overflow = '';
  }
}
