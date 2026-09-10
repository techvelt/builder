/**
 * TLDs to check for each .com target.
 * Add new entries to expand coverage — no other code changes required.
 */
export const TLD_LIST: string[] = [
  'com',
  'net',
  'org',
  'us',
  'co',
  'io',
  'ai',
  'app',
  'dev',
  'xyz',
  'online',
  'site',
  'tech',
  'biz',
  'info',
  'me',
  'tv',
  'shop',
  'store',
  'pro',
  'live',
  'cloud',
  'website',
  'ca',
  'uk',
  'de',
  'fr',
  'es',
  'it',
  'nl',
  'au',
  'nz',
  'in',
  'co.uk',
  'com.au',
];

export const SEED_COM_DOMAINS: string[] = [
  'dravionex.com',
  'qarnivo.com',
  'xelmorix.com',
  'ulveria.com',
  'nuvemzi.com',
  'cezonixpro.com',
  'soluttilabs.com',
  'mediavendo.com',
  'gtplatforms.com',
  'arrivacell.com',
];

export function extractBaseName(comDomain: string): string {
  const normalized = comDomain.toLowerCase().replace(/^www\./, '');
  if (!normalized.endsWith('.com')) {
    throw new Error(`Expected .com domain, got: ${comDomain}`);
  }
  return normalized.slice(0, -4);
}

export function buildDomain(baseName: string, tld: string): string {
  return `${baseName.toLowerCase()}.${tld}`;
}
