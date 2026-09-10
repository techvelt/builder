import * as cheerio from 'cheerio';
import type { ContactInfo } from '../types.js';

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE =
  /(?:\+?\d{1,3}[\s.\-]?)?\(?\d{2,4}\)?[\s.\-]?\d{2,4}[\s.\-]?\d{2,4}(?:[\s.\-]?\d{2,4})?/g;

const PARKING_EMAILS = [
  'abuse@',
  'hostmaster@',
  'noreply@',
  'no-reply@',
  'donotreply@',
  'postmaster@',
  'whois@',
];

export function extractContactInfo(
  html: string | null,
  finalUrl: string | null,
  pageTitle: string | null
): ContactInfo {
  const contact: ContactInfo = {
    companyName: null,
    contactUrl: null,
    contactEmail: null,
    phone: null,
    aboutUrl: null,
    linkedIn: null,
    twitter: null,
    facebook: null,
  };

  if (!html) return contact;

  const $ = cheerio.load(html);

  // Company name from og:site_name, schema.org, or title
  contact.companyName =
    $('meta[property="og:site_name"]').attr('content')?.trim() ||
    $('[itemtype*="Organization"] [itemprop="name"]').first().text().trim() ||
    null;

  if (!contact.companyName && pageTitle) {
    const cleaned = pageTitle.split(/[|\-–—]/)[0].trim();
    if (cleaned.length > 2 && cleaned.length < 80) {
      contact.companyName = cleaned;
    }
  }

  // Contact page link
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().toLowerCase();
    if (
      !contact.contactUrl &&
      (text.includes('contact') || href.toLowerCase().includes('/contact'))
    ) {
      contact.contactUrl = resolveUrl(href, finalUrl);
    }
    if (
      !contact.aboutUrl &&
      (text.includes('about') || href.toLowerCase().includes('/about'))
    ) {
      contact.aboutUrl = resolveUrl(href, finalUrl);
    }
  });

  // Social links
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (!contact.linkedIn && href.includes('linkedin.com/company')) {
      contact.linkedIn = href;
    }
    if (!contact.twitter && (href.includes('twitter.com/') || href.includes('x.com/'))) {
      contact.twitter = href;
    }
    if (!contact.facebook && href.includes('facebook.com/')) {
      contact.facebook = href;
    }
  });

  // Email from mailto links first
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const email = href.replace(/^mailto:/i, '').split('?')[0].trim();
    if (email && isPublicEmail(email) && !contact.contactEmail) {
      contact.contactEmail = email;
    }
  });

  // Email from page text
  if (!contact.contactEmail) {
    const bodyText = $('body').text();
    const emails = bodyText.match(EMAIL_RE) || [];
    for (const email of emails) {
      if (isPublicEmail(email)) {
        contact.contactEmail = email;
        break;
      }
    }
  }

  // Phone from tel: links or visible text
  $('a[href^="tel:"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const phone = href.replace(/^tel:/i, '').trim();
    if (phone && !contact.phone) {
      contact.phone = phone;
    }
  });

  if (!contact.phone) {
    const bodyText = $('body').text();
    const phones = bodyText.match(PHONE_RE) || [];
    for (const phone of phones) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length >= 10 && digits.length <= 15) {
        contact.phone = phone.trim();
        break;
      }
    }
  }

  return contact;
}

function resolveUrl(href: string, base: string | null): string {
  if (!base) return href;
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

function isPublicEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (PARKING_EMAILS.some((p) => lower.startsWith(p))) return false;
  if (lower.includes('example.com')) return false;
  if (lower.includes('sentry.io')) return false;
  if (lower.includes('wixpress.com')) return false;
  if (lower.includes('domain.com')) return false;
  return true;
}
