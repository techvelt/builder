import type { Classification, ContactInfo, DnsRecords, HttpResult, RegistrationStatus } from '../types.js';

const PARKED_KEYWORDS = [
  'domain is for sale',
  'this domain is for sale',
  'buy this domain',
  'domain parking',
  'parked domain',
  'parked free',
  'coming soon',
  'under construction',
  'website coming soon',
  'sedo parking',
  'hugedomains',
  'dan.com',
  'afternic',
  'bodis',
  'parkingcrew',
  'sedoparking',
  'domain has expired',
  'this webpage is not available',
  'godaddy',
  'namecheap parking',
  'register this domain',
];

const FOR_SALE_KEYWORDS = [
  'make an offer',
  'inquire about this domain',
  'domain for sale',
  'purchase this domain',
  'buy now',
  'this domain may be for sale',
  'interested in this domain',
  'make offer',
  'domain broker',
  'premium domain',
];

interface ClassifyInput {
  domain: string;
  baseName: string;
  registered: RegistrationStatus;
  dns: DnsRecords;
  http: HttpResult;
  contact: ContactInfo;
}

export function classifyDomain(input: ClassifyInput): Classification {
  const { domain, baseName, registered, dns, http, contact } = input;
  const htmlLower = (http.html || '').toLowerCase();
  const titleLower = (http.pageTitle || '').toLowerCase();
  const combined = `${titleLower} ${htmlLower} ${(http.description || '').toLowerCase()}`;

  // Not registered — no classification needed beyond UNKNOWN for website
  if (registered === 'NOT_REGISTERED') {
    return 'UNKNOWN';
  }

  // Registration unknown — classify based on observable signals only
  if (registered === 'UNKNOWN') {
    if (!dns.hasRecords && !http.httpsResponds && !http.httpResponds) {
      return 'UNKNOWN';
    }
  }

  // Registered but no DNS and no HTTP response
  if (registered === 'REGISTERED' && !dns.hasRecords && !http.httpsResponds && !http.httpResponds) {
    return 'EMPTY';
  }

  // Connection failures with DNS present
  if (dns.hasRecords && !http.httpsResponds && !http.httpResponds) {
    return 'DEAD';
  }

  // Redirect to different domain
  if (http.redirectDomain) {
    const redirectLower = http.redirectDomain.toLowerCase();
    const baseLower = baseName.toLowerCase();
    if (!redirectLower.includes(baseLower)) {
      return 'REDIRECT';
    }
  }

  // For sale detection
  if (FOR_SALE_KEYWORDS.some((k) => combined.includes(k))) {
    return 'FOR_SALE';
  }

  // Parked detection
  if (PARKED_KEYWORDS.some((k) => combined.includes(k))) {
    return 'PARKED';
  }

  // Very short or empty page
  const textContent = stripHtml(http.html || '');
  if (textContent.length < 50 && !contact.companyName) {
    if (http.httpsResponds || http.httpResponds) {
      return 'EMPTY';
    }
  }

  // Active business signals
  const businessSignals = countBusinessSignals(input);
  if (businessSignals >= 4) {
    return 'ACTIVE_BUSINESS';
  }

  if (businessSignals >= 2 || textContent.length > 500) {
    return 'ACTIVE_WEBSITE';
  }

  if (http.httpsResponds || http.httpResponds) {
    return 'ACTIVE_WEBSITE';
  }

  if (registered === 'REGISTERED' && dns.hasRecords) {
    return 'EMPTY';
  }

  return 'UNKNOWN';
}

function countBusinessSignals(input: ClassifyInput): number {
  const { http, contact, baseName } = input;
  let score = 0;

  if (contact.companyName) score++;
  if (contact.contactEmail) score++;
  if (contact.phone) score++;
  if (contact.contactUrl) score++;
  if (contact.aboutUrl) score++;
  if (contact.linkedIn) score++;

  const text = stripHtml(http.html || '');
  if (text.length > 1000) score++;
  if (text.length > 3000) score++;

  const baseLower = baseName.toLowerCase();
  const titleLower = (http.pageTitle || '').toLowerCase();
  if (titleLower.includes(baseLower)) score++;

  const businessWords = ['services', 'products', 'solutions', 'company', 'team', 'about us', 'our mission'];
  const textLower = text.toLowerCase();
  if (businessWords.some((w) => textLower.includes(w))) score++;

  return score;
}

function stripHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildReason(
  classification: Classification,
  domain: string,
  targetCom: string,
  tld: string,
  contact: ContactInfo
): string {
  const base = domain.replace(`.${tld}`, '');
  switch (classification) {
    case 'ACTIVE_BUSINESS':
      if (contact.companyName) {
        return `Active business "${contact.companyName}" operating on .${tld} — strong .com upgrade candidate`;
      }
      return `Exact-match business already operating on .${tld}`;
    case 'ACTIVE_WEBSITE':
      return `Live website on .${tld} using the ${base} brand — may want .com`;
    case 'PARKED':
      return `Domain registered on .${tld} but parked — low buyer intent`;
    case 'FOR_SALE':
      return `Domain listed for sale on .${tld} — unlikely to buy .com`;
    case 'REDIRECT':
      return `Redirects elsewhere — may not be actively using .${tld}`;
    case 'EMPTY':
      return `Registered on .${tld} but no active website — registered only, not a strong buyer`;
    case 'UNKNOWN':
      if (contact.companyName || contact.contactEmail) {
        return `Possible operator on .${tld} — registration status unconfirmed`;
      }
      return `Status unclear for .${tld} variant of ${targetCom}`;
    case 'DEAD':
      return `DNS configured but site unreachable on .${tld}`;
    default:
      return `Status unclear for .${tld} variant of ${targetCom}`;
  }
}
