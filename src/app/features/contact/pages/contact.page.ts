import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '@config/api';
import {
  LucidePhone,
  LucideMail,
  LucideMapPin,
  LucideMessageCircle,
  LucideSend,
  LucideCheckCircle2,
  LucideClock
} from '@lucide/angular';
import { FooterComponent } from '../../home/components/footer/footer.component';
import { FaqComponent } from '../../home/components/faq/faq.component';
import { RippleDirective } from '../../cars/directives/ripple.directive';
import { RevealDirective } from '../../home/directives/reveal.directive';
import { ToastService } from '../../../services/toast.service';

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
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

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
      value: 'aayracars@gmail.com',
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
    const email = this.email().trim();
    if (
      !this.name().trim() ||
      !email ||
      !this.phone().trim() ||
      !this.message().trim()
    ) {
      this.toast.error('Please complete the form', 'Name, email, phone and message are all required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      this.toast.error('Invalid email', 'Please enter a valid email address.');
      return;
    }
    this.http
      .post(`${API_BASE}/contacts`, {
        name: this.name().trim(),
        email,
        phone: this.phone().trim(),
        subject: this.subject().trim(),
        message: this.message().trim()
      })
      .subscribe({
        next: () => {
          this.submitted.set(true);
          this.toast.success('Message sent!', 'Thanks for reaching out — we typically reply within 24 hours.');
        },
        error: () => {
          this.submitted.set(false);
          this.toast.error('Something went wrong', 'We could not send your message. Please try again shortly.');
        }
      });
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
