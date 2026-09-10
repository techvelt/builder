export type RegistrationStatus = 'REGISTERED' | 'NOT_REGISTERED' | 'UNKNOWN';
export type LiveStatus = 'LIVE' | 'NOT_LIVE' | 'UNKNOWN';

export type Classification =
  | 'ACTIVE_BUSINESS'
  | 'ACTIVE_WEBSITE'
  | 'PARKED'
  | 'FOR_SALE'
  | 'REDIRECT'
  | 'EMPTY'
  | 'DEAD'
  | 'UNKNOWN';

export interface DnsRecords {
  A: string[];
  AAAA: string[];
  CNAME: string[];
  MX: string[];
  NS: string[];
  hasRecords: boolean;
}

export interface ContactInfo {
  companyName: string | null;
  contactUrl: string | null;
  contactEmail: string | null;
  phone: string | null;
  aboutUrl: string | null;
  linkedIn: string | null;
  twitter: string | null;
  facebook: string | null;
}

export interface HttpResult {
  httpResponds: boolean;
  httpsResponds: boolean;
  httpStatus: number | null;
  finalUrl: string | null;
  pageTitle: string | null;
  description: string | null;
  html: string | null;
  redirectDomain: string | null;
  error: string | null;
}

export interface DomainCheckResult {
  targetCom: string;
  baseName: string;
  tld: string;
  domain: string;
  registered: RegistrationStatus;
  dns: DnsRecords;
  dnsStatus: LiveStatus;
  websiteLive: LiveStatus;
  httpResponds: boolean;
  httpsResponds: boolean;
  httpStatus: number | null;
  finalUrl: string | null;
  pageTitle: string | null;
  description: string | null;
  classification: Classification;
  company: string | null;
  contact: ContactInfo;
  opportunityScore: number;
  reason: string;
  checkedAt: string;
}

export interface ComSummary {
  targetCom: string;
  baseName: string;
  registeredAlternates: number;
  liveSites: number;
  activeBusinesses: number;
  bestProspect: string | null;
  bestProspectTld: string | null;
  opportunityScore: number;
  lastCheckedAt: string | null;
  scanStatus: 'idle' | 'scanning' | 'complete' | 'error';
}

export interface ScanProgress {
  targetCom: string;
  status: 'pending' | 'scanning' | 'complete' | 'error';
  completed: number;
  total: number;
  message?: string;
}
