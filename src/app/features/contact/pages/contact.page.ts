import { Component, signal } from '@angular/core';
import {
  LucidePhone,
  LucideMail,
  LucideMapPin,
  LucideMessageCircle,
  LucideSend,
  LucideCheckCircle2,
  LucideClock
} from '@lucide/angular';
import { NavbarComponent } from '../../home/components/navbar/navbar.component';
import { FooterComponent } from '../../home/components/footer/footer.component';
import { FaqComponent } from '../../home/components/faq/faq.component';
import { RippleDirective } from '../../cars/directives/ripple.directive';
import { RevealDirective } from '../../home/directives/reveal.directive';

interface ContactChannel {
  icon: 'phone' | 'mail' | 'mapPin' | 'messageCircle';
  title: string;
  value: string;
  detail: string;
}

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    FaqComponent,
    RippleDirective,
    RevealDirective,
    LucidePhone,
    LucideMail,
    LucideMapPin,
    LucideMessageCircle,
    LucideSend,
    LucideCheckCircle2,
    LucideClock
  ],
  templateUrl: './contact.page.html',
  styleUrl: './contact.page.scss'
})
export class ContactPageComponent {
  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly subject = signal('');
  readonly message = signal('');
  readonly submitted = signal(false);

  readonly channels: ContactChannel[] = [
    {
      icon: 'phone',
      title: 'Call us',
      value: '+91 98765 43210',
      detail: 'Mon – Sat · 9 AM – 8 PM'
    },
    {
      icon: 'mail',
      title: 'Email us',
      value: 'hello@automart.in',
      detail: 'Replies within 24 hours'
    },
    {
      icon: 'mapPin',
      title: 'Visit our hub',
      value: 'Koramangala, Bengaluru',
      detail: 'Open every day · 10 AM – 7 PM'
    },
    {
      icon: 'messageCircle',
      title: 'WhatsApp',
      value: '+91 98765 43210',
      detail: 'Chat with our experts'
    }
  ];

  onSubmit(event: Event): void {
    event.preventDefault();
    if (
      !this.name().trim() ||
      !this.email().trim() ||
      !this.phone().trim() ||
      !this.message().trim()
    ) {
      return;
    }
    this.submitted.set(true);
  }

  reset(): void {
    this.name.set('');
    this.email.set('');
    this.phone.set('');
    this.subject.set('');
    this.message.set('');
    this.submitted.set(false);
  }
}
