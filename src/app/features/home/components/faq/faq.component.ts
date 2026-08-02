import { Component, signal } from '@angular/core';
import { LucidePlus, LucideMinus } from '@lucide/angular';
import { FAQS } from '../../data/home.data';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [LucidePlus, LucideMinus, SectionHeadingComponent, RevealDirective],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  readonly faqs = FAQS;
  readonly openIndex = signal(0);

  toggle(index: number): void {
    this.openIndex.set(this.openIndex() === index ? -1 : index);
  }
}
