import type { RegistrationStatus } from '../types.js';

const RDAP_DELAY_MS = 600;
const RDAP_HEADERS = {
  Accept: 'application/rdap+json, application/json',
  'User-Agent': 'ComBuyerProspector/1.0 (domain-research-tool; contact: research@example.com)',
};

let lastRdapCall = 0;
let bootstrapCache: [string[], string[]][] | null = null;

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const wait = RDAP_DELAY_MS - (now - lastRdapCall);
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastRdapCall = Date.now();
}

function extractTld(domain: string): string {
  const parts = domain.toLowerCase().split('.');
  if (parts.length >= 3) {
    const compound = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    if (['co.uk', 'com.au', 'co.nz', 'com.br', 'org.uk', 'net.au'].includes(compound)) {
      return compound;
    }
  }
  return parts[parts.length - 1];
}

async function loadBootstrap(): Promise<[string[], string[]][] | null> {
  if (bootstrapCache) return bootstrapCache;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch('https://data.iana.org/rdap/dns.json', {
      signal: controller.signal,
      headers: RDAP_HEADERS,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    bootstrapCache = data.services as [string[], string[]][];
    return bootstrapCache;
  } catch {
    return null;
  }
}

async function getRdapServer(domain: string): Promise<string | null> {
  const tld = extractTld(domain);
  const bootstrap = await loadBootstrap();
  if (!bootstrap) return null;

  for (const [tlds, urls] of bootstrap) {
    if (tlds.includes(tld) && urls.length > 0) {
      return urls[0].replace(/\/$/, '');
    }
  }
  return null;
}

async function queryRdapUrl(url: string): Promise<{ status: RegistrationStatus; data?: unknown }> {
  await rateLimit();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: RDAP_HEADERS,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (response.status === 200) {
      const data = await response.json();
      return { status: 'REGISTERED', data };
    }
    if (response.status === 404) {
      return { status: 'NOT_REGISTERED' };
    }
    return { status: 'UNKNOWN' };
  } catch {
    return { status: 'UNKNOWN' };
  }
}

/**
 * Query RDAP for domain registration status via IANA bootstrap servers.
 * Falls back to rdap.org aggregator when TLD-specific server is unavailable.
 */
export async function checkRegistration(domain: string): Promise<RegistrationStatus> {
  const normalized = domain.toLowerCase();

  // Prefer TLD-specific RDAP server from IANA bootstrap
  const rdapServer = await getRdapServer(normalized);
  if (rdapServer) {
    const result = await queryRdapUrl(`${rdapServer}/domain/${encodeURIComponent(normalized)}`);
    if (result.status !== 'UNKNOWN') {
      return result.status;
    }
  }

  // Fallback to rdap.org aggregator
  const aggregatorResult = await queryRdapUrl(
    `https://rdap.org/domain/${encodeURIComponent(normalized)}`
  );
  return aggregatorResult.status;
}
