import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LucidePlus, LucideMinus } from '@lucide/angular';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { RevealDirective } from '../../directives/reveal.directive';

interface ApiFaq {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [LucidePlus, LucideMinus, SectionHeadingComponent, RevealDirective],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly faqs = signal<ApiFaq[]>([]);
  readonly openIndex = signal(0);

  ngOnInit(): void {
    this.http.get<ApiFaq[]>('/api/faqs').subscribe({
      next: (list) => this.faqs.set(list),
      error: () => this.faqs.set([])
    });
  }

  toggle(index: number): void {
    this.openIndex.set(this.openIndex() === index ? -1 : index);
  }
}
