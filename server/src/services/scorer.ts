import type { Classification, ContactInfo, DnsRecords, HttpResult, RegistrationStatus } from '../types.js';

interface ScoreInput {
  baseName: string;
  domain: string;
  tld: string;
  registered: RegistrationStatus;
  dns: DnsRecords;
  http: HttpResult;
  classification: Classification;
  contact: ContactInfo;
}

export function computeOpportunityScore(input: ScoreInput): number {
  const { classification, registered, contact, http, baseName, tld } = input;

  // .com itself is not a buyer prospect
  if (tld === 'com') return 0;

  if (registered === 'NOT_REGISTERED') return 0;

  let score = 0;

  // Unknown registration reduces confidence but live business signals still matter
  const regPenalty = registered === 'UNKNOWN' ? 15 : 0;

  switch (classification) {
    case 'ACTIVE_BUSINESS':
      score = 75 - regPenalty;
      break;
    case 'ACTIVE_WEBSITE':
      score = 55 - regPenalty;
      break;
    case 'REDIRECT':
      score = 30;
      break;
    case 'EMPTY':
      score = 15;
      break;
    case 'DEAD':
      score = 10;
      break;
    case 'PARKED':
      score = 8;
      break;
    case 'FOR_SALE':
      score = 5;
      break;
    default:
      score = 12;
  }

  // Brand match bonus
  const baseLower = baseName.toLowerCase();
  const titleLower = (http.pageTitle || '').toLowerCase();
  const companyLower = (contact.companyName || '').toLowerCase();

  if (titleLower.includes(baseLower)) score += 8;
  if (companyLower.includes(baseLower)) score += 10;

  // Contact info bonuses — actionable prospects
  if (contact.contactEmail) score += 7;
  if (contact.phone) score += 5;
  if (contact.contactUrl) score += 3;
  if (contact.linkedIn) score += 4;
  if (contact.aboutUrl) score += 2;

  // TLD preference — businesses on .net/.io/.co are stronger buyers
  const premiumTlds = ['net', 'io', 'co', 'ai', 'app', 'org', 'us'];
  if (premiumTlds.includes(tld) && classification === 'ACTIVE_BUSINESS') {
    score += 5;
  }

  // Penalties
  if (classification === 'PARKED' || classification === 'FOR_SALE') {
    score = Math.min(score, 15);
  }

  if (!http.httpsResponds && !http.httpResponds && registered === 'REGISTERED') {
    score = Math.min(score, 20);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
