import dns from 'node:dns/promises';
import type { DnsRecords, LiveStatus } from '../types.js';

const DNS_TIMEOUT_MS = 8000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ]);
  } catch {
    return null;
  }
}

export async function checkDns(domain: string): Promise<DnsRecords> {
  const records: DnsRecords = {
    A: [],
    AAAA: [],
    CNAME: [],
    MX: [],
    NS: [],
    hasRecords: false,
  };

  const resolver = new dns.Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1']);

  const lookups: Array<Promise<void>> = [];

  lookups.push(
    withTimeout(dns.resolve4(domain), DNS_TIMEOUT_MS).then((r) => {
      if (r) records.A = r;
    })
  );

  lookups.push(
    withTimeout(dns.resolve6(domain), DNS_TIMEOUT_MS).then((r) => {
      if (r) records.AAAA = r;
    })
  );

  lookups.push(
    withTimeout(dns.resolveCname(domain), DNS_TIMEOUT_MS).then((r) => {
      if (r) records.CNAME = Array.isArray(r) ? r : [r];
    })
  );

  lookups.push(
    withTimeout(dns.resolveMx(domain), DNS_TIMEOUT_MS).then((r) => {
      if (r) records.MX = r.map((m) => `${m.priority} ${m.exchange}`);
    })
  );

  lookups.push(
    withTimeout(dns.resolveNs(domain), DNS_TIMEOUT_MS).then((r) => {
      if (r) records.NS = r;
    })
  );

  await Promise.allSettled(lookups);

  records.hasRecords =
    records.A.length > 0 ||
    records.AAAA.length > 0 ||
    records.CNAME.length > 0 ||
    records.MX.length > 0 ||
    records.NS.length > 0;

  return records;
}

export function dnsToLiveStatus(dns: DnsRecords): LiveStatus {
  if (dns.hasRecords) return 'LIVE';
  return 'NOT_LIVE';
}
