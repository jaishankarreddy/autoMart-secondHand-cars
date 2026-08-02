import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-thumbnail-gallery',
  standalone: true,
  templateUrl: './thumbnail-gallery.component.html',
  styleUrl: './thumbnail-gallery.component.scss'
})
export class ThumbnailGalleryComponent {
  readonly images = input.required<string[]>();
  readonly alt = input('');
  readonly activeIndex = input(0);

  readonly select = output<number>();

  selectIndex(index: number): void {
    this.select.emit(index);
  }
}
