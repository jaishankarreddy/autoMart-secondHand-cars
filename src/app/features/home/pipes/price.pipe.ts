import { Pipe, PipeTransform } from '@angular/core';

/** Formats a price expressed in Lakhs as an Indian rupee label.
 *  e.g. 16.8 -> "₹16.8 Lakh", 1.95 -> "₹1.95 Lakh" */
@Pipe({ name: 'price', standalone: true })
export class PricePipe implements PipeTransform {
  transform(priceInLakh: number | null | undefined): string {
    if (priceInLakh == null) {
      return '₹ —';
    }
    const formatted = Number(priceInLakh).toLocaleString('en-IN', {
      maximumFractionDigits: priceInLakh % 1 === 0 ? 0 : 2
    });
    return `₹${formatted} Lakh`;
  }
}
