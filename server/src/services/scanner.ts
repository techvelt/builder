import { TLD_LIST, buildDomain, extractBaseName } from '../config/tlds.js';
import type { DomainCheckResult, LiveStatus, ScanProgress } from '../types.js';
import { checkRegistration } from './rdap.js';
import { checkDns, dnsToLiveStatus } from './dns.js';
import { probeWebsite } from './http.js';
import { extractContactInfo } from './contact.js';
import { classifyDomain, buildReason } from './classifier.js';
import { computeOpportunityScore } from './scorer.js';
import * as db from '../db.js';

const SCAN_DELAY_MS = 400;

type ProgressCallback = (progress: ScanProgress) => void;

export async function scanComDomain(
  targetCom: string,
  onProgress?: ProgressCallback
): Promise<DomainCheckResult[]> {
  const baseName = extractBaseName(targetCom);
  const results: DomainCheckResult[] = [];
  const total = TLD_LIST.length;

  db.setScanStatus(targetCom, 'scanning');

  for (let i = 0; i < TLD_LIST.length; i++) {
    const tld = TLD_LIST[i];
    const domain = buildDomain(baseName, tld);

    onProgress?.({
      targetCom,
      status: 'scanning',
      completed: i,
      total,
      message: `Checking ${domain}`,
    });

    try {
      const result = await checkSingleDomain(targetCom, baseName, tld, domain);
      results.push(result);
      db.saveDomainResult(result);
    } catch (err) {
      console.error(`Error checking ${domain}:`, err);
    }

    if (i < TLD_LIST.length - 1) {
      await new Promise((r) => setTimeout(r, SCAN_DELAY_MS));
    }
  }

  db.setScanStatus(targetCom, 'complete');
  db.updateComSummary(targetCom);

  onProgress?.({
    targetCom,
    status: 'complete',
    completed: total,
    total,
  });

  return results;
}

export async function scanAllComDomains(
  comDomains: string[],
  onProgress?: ProgressCallback
): Promise<void> {
  for (const com of comDomains) {
    await scanComDomain(com, onProgress);
  }
}

export async function rescanComDomain(
  targetCom: string,
  onProgress?: ProgressCallback
): Promise<DomainCheckResult[]> {
  db.deleteResultsForCom(targetCom);
  return scanComDomain(targetCom, onProgress);
}

async function checkSingleDomain(
  targetCom: string,
  baseName: string,
  tld: string,
  domain: string
): Promise<DomainCheckResult> {
  const checkedAt = new Date().toISOString();

  let registered = await checkRegistration(domain);
  const dns = await checkDns(domain);
  const dnsStatus: LiveStatus = dnsToLiveStatus(dns);

  // NS delegation is a reliable DNS signal when RDAP is inconclusive
  if (registered === 'UNKNOWN' && dns.NS.length > 0) {
    registered = 'REGISTERED';
  }

  let http = {
    httpResponds: false,
    httpsResponds: false,
    httpStatus: null as number | null,
    finalUrl: null as string | null,
    pageTitle: null as string | null,
    description: null as string | null,
    html: null as string | null,
    redirectDomain: null as string | null,
    error: null as string | null,
  };

  let websiteLive: LiveStatus = 'NOT_LIVE';

  // Only probe website if registered or has DNS (don't infer registration from HTTP)
  if (registered === 'REGISTERED' || dns.hasRecords) {
    http = await probeWebsite(domain);
    if (http.httpsResponds || http.httpResponds) {
      websiteLive = 'LIVE';
    } else if (registered === 'REGISTERED' || dns.hasRecords) {
      websiteLive = 'NOT_LIVE';
    } else {
      websiteLive = 'UNKNOWN';
    }
  }

  const contact = extractContactInfo(http.html, http.finalUrl, http.pageTitle);

  const classification = classifyDomain({
    domain,
    baseName,
    registered,
    dns,
    http,
    contact,
  });

  const opportunityScore = computeOpportunityScore({
    baseName,
    domain,
    tld,
    registered,
    dns,
    http,
    classification,
    contact,
  });

  const reason = buildReason(classification, domain, targetCom, tld, contact);

  return {
    targetCom,
    baseName,
    tld,
    domain,
    registered,
    dns,
    dnsStatus,
    websiteLive,
    httpResponds: http.httpResponds,
    httpsResponds: http.httpsResponds,
    httpStatus: http.httpStatus,
    finalUrl: http.finalUrl,
    pageTitle: http.pageTitle,
    description: http.description,
    classification,
    company: contact.companyName,
    contact,
    opportunityScore,
    reason,
    checkedAt,
  };
}
