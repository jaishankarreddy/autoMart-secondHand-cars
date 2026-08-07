import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  LucideSearch,
  LucideCheck,
  LucideX,
  LucidePhone,
  LucideTrendingUp
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { AdminOffer, OfferStatus } from '../../data/admin.data';

export type OfferFilter = 'all' | OfferStatus;

@Component({
  selector: 'app-offers-page',
  standalone: true,
  imports: [
    RippleDirective,
    LucideSearch,
    LucideCheck,
    LucideX,
    LucidePhone,
    LucideTrendingUp
  ],
  templateUrl: './offers.page.html',
  styleUrl: './offers.page.scss'
})
export class AdminOffersPageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly offers = signal<AdminOffer[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<OfferFilter>('all');

  ngOnInit(): void {
    this.http.get<AdminOffer[]>('/api/admin/offers').subscribe({
      next: (list) => this.offers.set(list.map((o) => ({ ...o, date: this.formatDate(o.date) }))),
      error: () => this.offers.set([])
    });
  }

  readonly counts = computed(() => {
    const list = this.offers();
    return {
      total: list.length,
      pending: list.filter((o) => o.status === 'Pending').length,
      accepted: list.filter((o) => o.status === 'Accepted').length,
      countered: list.filter((o) => o.status === 'Countered').length,
      rejected: list.filter((o) => o.status === 'Rejected').length
    };
  });

  readonly filteredOffers = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const st = this.statusFilter();
    return this.offers().filter((o) => {
      if (st !== 'all' && o.status !== st) return false;
      if (
        kw &&
        !`${o.vehicle} ${o.customer} ${o.id} ${o.phone}`
          .toLowerCase()
          .includes(kw)
      ) {
        return false;
      }
      return true;
    });
  });

  readonly filterOptions: { value: OfferFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Countered', label: 'Countered' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  setStatus(id: string, status: OfferStatus): void {
    this.offers.update((list) =>
      list.map((o) => (o.id === id ? { ...o, status } : o))
    );
    this.http.patch(`/api/admin/offers/${id}`, { status }).subscribe({
      error: () => {
        this.load();
      }
    });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  formatPrice(value: number): string {
    return `₹${(value / 100000).toFixed(1)} L`;
  }

  private load(): void {
    this.http.get<AdminOffer[]>('/api/admin/offers').subscribe({
      next: (list) => this.offers.set(list.map((o) => ({ ...o, date: this.formatDate(o.date) }))),
      error: () => this.offers.set([])
    });
  }

  private formatDate(value: unknown): string {
    if (!value) return '';
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}
