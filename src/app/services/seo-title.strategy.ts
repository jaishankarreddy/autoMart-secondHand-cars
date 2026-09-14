import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

interface SeoData {
  title: string;
  description: string;
  keywords: string;
}

const DEFAULT_SEO: SeoData = {
  title: 'Ayra Cars | Buy and Sell Used Cars and Bikes in Bangalore',
  description:
    'Buy and sell verified used cars and bikes in Bangalore and across Karnataka with transparent prices, trusted listings and easy support from Ayra Cars.',
  keywords:
    'used cars Bangalore, second hand cars Bangalore, used bikes Bangalore, second hand bikes Karnataka, buy used car Karnataka, sell used car Bangalore, pre owned cars Karnataka, Ayra Cars'
};

@Injectable()
export class SeoTitleStrategy extends TitleStrategy {
  constructor(
    private readonly title: Title,
    private readonly meta: Meta
  ) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const seo = this.findSeo(snapshot.root) ?? DEFAULT_SEO;
    const canonicalUrl = `${window.location.origin}${snapshot.url === '/' ? '/' : snapshot.url}`;

    this.title.setTitle(seo.title);
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ name: 'keywords', content: seo.keywords });
    this.meta.updateTag({ property: 'og:title', content: seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ name: 'twitter:title', content: seo.title });
    this.meta.updateTag({ name: 'twitter:description', content: seo.description });

    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;
  }

  private findSeo(route: ActivatedRouteSnapshot): SeoData | undefined {
    let current: ActivatedRouteSnapshot | null = route;
    let seo: SeoData | undefined;

    while (current) {
      seo = current.data['seo'] as SeoData | undefined ?? seo;
      current = current.firstChild;
    }

    return seo;
  }
}
