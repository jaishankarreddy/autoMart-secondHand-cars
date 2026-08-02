import { Component, computed, signal } from '@angular/core';
import {
  LucideSearch,
  LucideMail,
  LucidePhone,
  LucideCheck,
  LucideMailOpen
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { ADMIN_CONTACTS, AdminContact, ContactStatus } from '../../data/admin.data';

export type ContactFilter = 'all' | ContactStatus;

@Component({
  selector: 'app-contacts-page',
  standalone: true,
  imports: [
    RippleDirective,
    LucideSearch,
    LucideMail,
    LucidePhone,
    LucideCheck,
    LucideMailOpen
  ],
  templateUrl: './contacts.page.html',
  styleUrl: './contacts.page.scss'
})
export class AdminContactsPageComponent {
  readonly contacts = signal<AdminContact[]>(ADMIN_CONTACTS);
  readonly search = signal('');
  readonly statusFilter = signal<ContactFilter>('all');

  readonly counts = computed(() => {
    const list = this.contacts();
    return {
      total: list.length,
      new: list.filter((c) => c.status === 'New').length,
      replied: list.filter((c) => c.status === 'Replied').length
    };
  });

  readonly filteredContacts = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const st = this.statusFilter();
    return this.contacts().filter((c) => {
      if (st !== 'all' && c.status !== st) return false;
      if (
        kw &&
        !`${c.name} ${c.email} ${c.subject} ${c.message} ${c.id}`
          .toLowerCase()
          .includes(kw)
      ) {
        return false;
      }
      return true;
    });
  });

  readonly filterOptions: { value: ContactFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'New', label: 'New' },
    { value: 'Replied', label: 'Replied' }
  ];

  markReplied(id: string): void {
    this.contacts.update((list) =>
      list.map((c) => (c.id === id ? { ...c, status: 'Replied' } : c))
    );
  }

  markNew(id: string): void {
    this.contacts.update((list) =>
      list.map((c) => (c.id === id ? { ...c, status: 'New' } : c))
    );
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
