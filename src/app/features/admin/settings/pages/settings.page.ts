import { Component, signal, WritableSignal } from '@angular/core';
import {
  LucideUser,
  LucideBell,
  LucideLock,
  LucideStore,
  LucideSave,
  LucideCheckCircle2,
  LucideMapPin
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';

export type SettingsTab = 'profile' | 'notifications' | 'security' | 'marketplace';

interface ToggleItem {
  key: string;
  label: string;
  detail: string;
  on: boolean;
}

interface TabOption {
  value: SettingsTab;
  label: string;
  icon: 'user' | 'bell' | 'lock' | 'store';
}

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    RippleDirective,
    LucideUser,
    LucideBell,
    LucideLock,
    LucideStore,
    LucideSave,
    LucideCheckCircle2,
    LucideMapPin
  ],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss'
})
export class AdminSettingsPageComponent {
  readonly tab = signal<SettingsTab>('profile');
  readonly saved = signal(false);

  readonly tabs: TabOption[] = [
    { value: 'profile', label: 'Profile', icon: 'user' },
    { value: 'notifications', label: 'Notifications', icon: 'bell' },
    { value: 'security', label: 'Security', icon: 'lock' },
    { value: 'marketplace', label: 'Marketplace', icon: 'store' }
  ];

  readonly name = signal('Admin User');
  readonly email = signal('admin@ayracars.in');
  readonly phone = signal('+91 98765 43210');
  readonly oldPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly securityError = signal('');

  readonly notifyToggles = signal<ToggleItem[]>([
    { key: 'offerAlerts', label: 'New offer alerts', detail: 'Get notified the moment a buyer submits an offer.', on: true },
    { key: 'contactAlerts', label: 'Contact enquiry alerts', detail: 'Get notified on new contact messages.', on: true },
    { key: 'weeklyDigest', label: 'Weekly digest', detail: 'A summary of marketplace activity every Monday.', on: false },
    { key: 'listingUpdates', label: 'Listing updates', detail: 'When listings are sold, updated or expire.', on: true }
  ]);

  readonly marketToggles = signal<ToggleItem[]>([
    { key: 'autoApprove', label: 'Auto-approve listings', detail: 'Publish new listings without manual review.', on: false },
    { key: 'showPrices', label: 'Show drive-away prices', detail: 'Display on-road price estimates to buyers.', on: true },
    { key: 'whatsappOffers', label: 'WhatsApp offer notifications', detail: 'Send offer updates to buyers on WhatsApp.', on: true }
  ]);

  readonly location = signal('Karnataka, India');
  readonly currency = signal('₹ INR');

  setTab(value: SettingsTab): void {
    this.tab.set(value);
    this.saved.set(false);
  }

  toggle(key: string, list: WritableSignal<ToggleItem[]>): void {
    list.update((items) =>
      items.map((t) => (t.key === key ? { ...t, on: !t.on } : t))
    );
  }

  toggleNotify(key: string): void {
    this.toggle(key, this.notifyToggles);
  }

  toggleMarket(key: string): void {
    this.toggle(key, this.marketToggles);
  }

  save(): void {
    this.saved.set(true);
  }

  changePassword(event: Event): void {
    event.preventDefault();
    if (this.newPassword() !== this.confirmPassword()) {
      this.securityError.set('New passwords do not match.');
      return;
    }
    if (this.newPassword().length < 6) {
      this.securityError.set('New password must be at least 6 characters.');
      return;
    }
    this.securityError.set('');
    this.oldPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.saved.set(true);
  }
}
