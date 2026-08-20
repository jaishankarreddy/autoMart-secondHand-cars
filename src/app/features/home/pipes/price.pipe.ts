import { Pipe, PipeTransform } from '@angular/core';

/** Formats a full rupee price as an Indian rupee label.
 *  e.g. 1680000 -> "₹16,80,000", 62000 -> "₹62,000" */
@Pipe({ name: 'price', standalone: true })
export class PricePipe implements PipeTransform {
  transform(price: number | null | undefined): string {
    const n = Number(price);
    if (!Number.isFinite(n)) {
      return '₹ —';
    }
    const formatted = Math.round(n).toLocaleString('en-IN');
    return `₹${formatted}`;
  }
}
