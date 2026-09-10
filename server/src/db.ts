import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Classification, ComSummary, DomainCheckResult } from './types.js';
import { SEED_COM_DOMAINS } from './config/tlds.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'prospector.db');

let db: Database.Database;

export function initDb(): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS domain_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_com TEXT NOT NULL,
      base_name TEXT NOT NULL,
      tld TEXT NOT NULL,
      domain TEXT NOT NULL,
      registered TEXT NOT NULL,
      dns_has_records INTEGER NOT NULL,
      dns_a TEXT,
      dns_aaaa TEXT,
      dns_cname TEXT,
      dns_mx TEXT,
      dns_ns TEXT,
      dns_status TEXT NOT NULL,
      website_live TEXT NOT NULL,
      http_responds INTEGER NOT NULL,
      https_responds INTEGER NOT NULL,
      http_status INTEGER,
      final_url TEXT,
      page_title TEXT,
      description TEXT,
      classification TEXT NOT NULL,
      company TEXT,
      contact_email TEXT,
      contact_url TEXT,
      contact_phone TEXT,
      about_url TEXT,
      linkedin TEXT,
      twitter TEXT,
      facebook TEXT,
      opportunity_score INTEGER NOT NULL,
      reason TEXT NOT NULL,
      checked_at TEXT NOT NULL,
      UNIQUE(target_com, tld)
    );

    CREATE TABLE IF NOT EXISTS com_targets (
      target_com TEXT PRIMARY KEY,
      base_name TEXT NOT NULL,
      scan_status TEXT NOT NULL DEFAULT 'idle',
      last_checked_at TEXT
    );
  `);

  // Seed targets
  const insert = db.prepare(
    'INSERT OR IGNORE INTO com_targets (target_com, base_name, scan_status) VALUES (?, ?, ?)'
  );
  for (const com of SEED_COM_DOMAINS) {
    const base = com.replace('.com', '');
    insert.run(com, base, 'idle');
  }
}

export function saveDomainResult(result: DomainCheckResult): void {
  const stmt = db.prepare(`
    INSERT INTO domain_results (
      target_com, base_name, tld, domain, registered,
      dns_has_records, dns_a, dns_aaaa, dns_cname, dns_mx, dns_ns,
      dns_status, website_live, http_responds, https_responds,
      http_status, final_url, page_title, description,
      classification, company, contact_email, contact_url, contact_phone,
      about_url, linkedin, twitter, facebook,
      opportunity_score, reason, checked_at
    ) VALUES (
      @targetCom, @baseName, @tld, @domain, @registered,
      @dnsHasRecords, @dnsA, @dnsAaaa, @dnsCname, @dnsMx, @dnsNs,
      @dnsStatus, @websiteLive, @httpResponds, @httpsResponds,
      @httpStatus, @finalUrl, @pageTitle, @description,
      @classification, @company, @contactEmail, @contactUrl, @contactPhone,
      @aboutUrl, @linkedIn, @twitter, @facebook,
      @opportunityScore, @reason, @checkedAt
    )
    ON CONFLICT(target_com, tld) DO UPDATE SET
      domain = excluded.domain,
      registered = excluded.registered,
      dns_has_records = excluded.dns_has_records,
      dns_a = excluded.dns_a,
      dns_aaaa = excluded.dns_aaaa,
      dns_cname = excluded.dns_cname,
      dns_mx = excluded.dns_mx,
      dns_ns = excluded.dns_ns,
      dns_status = excluded.dns_status,
      website_live = excluded.website_live,
      http_responds = excluded.http_responds,
      https_responds = excluded.https_responds,
      http_status = excluded.http_status,
      final_url = excluded.final_url,
      page_title = excluded.page_title,
      description = excluded.description,
      classification = excluded.classification,
      company = excluded.company,
      contact_email = excluded.contact_email,
      contact_url = excluded.contact_url,
      contact_phone = excluded.contact_phone,
      about_url = excluded.about_url,
      linkedin = excluded.linkedin,
      twitter = excluded.twitter,
      facebook = excluded.facebook,
      opportunity_score = excluded.opportunity_score,
      reason = excluded.reason,
      checked_at = excluded.checked_at
  `);

  stmt.run({
    targetCom: result.targetCom,
    baseName: result.baseName,
    tld: result.tld,
    domain: result.domain,
    registered: result.registered,
    dnsHasRecords: result.dns.hasRecords ? 1 : 0,
    dnsA: JSON.stringify(result.dns.A),
    dnsAaaa: JSON.stringify(result.dns.AAAA),
    dnsCname: JSON.stringify(result.dns.CNAME),
    dnsMx: JSON.stringify(result.dns.MX),
    dnsNs: JSON.stringify(result.dns.NS),
    dnsStatus: result.dnsStatus,
    websiteLive: result.websiteLive,
    httpResponds: result.httpResponds ? 1 : 0,
    httpsResponds: result.httpsResponds ? 1 : 0,
    httpStatus: result.httpStatus,
    finalUrl: result.finalUrl,
    pageTitle: result.pageTitle,
    description: result.description,
    classification: result.classification,
    company: result.company,
    contactEmail: result.contact.contactEmail,
    contactUrl: result.contact.contactUrl,
    contactPhone: result.contact.phone,
    aboutUrl: result.contact.aboutUrl,
    linkedIn: result.contact.linkedIn,
    twitter: result.contact.twitter,
    facebook: result.contact.facebook,
    opportunityScore: result.opportunityScore,
    reason: result.reason,
    checkedAt: result.checkedAt,
  });
}

export function setScanStatus(targetCom: string, status: string): void {
  db.prepare('UPDATE com_targets SET scan_status = ? WHERE target_com = ?').run(status, targetCom);
}

export function updateComSummary(targetCom: string): void {
  const now = new Date().toISOString();
  db.prepare('UPDATE com_targets SET last_checked_at = ? WHERE target_com = ?').run(now, targetCom);
}

export function deleteResultsForCom(targetCom: string): void {
  db.prepare('DELETE FROM domain_results WHERE target_com = ?').run(targetCom);
}

interface DbRow {
  target_com: string;
  base_name: string;
  tld: string;
  domain: string;
  registered: string;
  dns_has_records: number;
  dns_a: string;
  dns_aaaa: string;
  dns_cname: string;
  dns_mx: string;
  dns_ns: string;
  dns_status: string;
  website_live: string;
  http_responds: number;
  https_responds: number;
  http_status: number | null;
  final_url: string | null;
  page_title: string | null;
  description: string | null;
  classification: string;
  company: string | null;
  contact_email: string | null;
  contact_url: string | null;
  contact_phone: string | null;
  about_url: string | null;
  linkedin: string | null;
  twitter: string | null;
  facebook: string | null;
  opportunity_score: number;
  reason: string;
  checked_at: string;
  scan_status?: string;
  last_checked_at?: string | null;
}

function rowToResult(row: DbRow): DomainCheckResult {
  return {
    targetCom: row.target_com,
    baseName: row.base_name,
    tld: row.tld,
    domain: row.domain,
    registered: row.registered as DomainCheckResult['registered'],
    dns: {
      A: JSON.parse(row.dns_a || '[]'),
      AAAA: JSON.parse(row.dns_aaaa || '[]'),
      CNAME: JSON.parse(row.dns_cname || '[]'),
      MX: JSON.parse(row.dns_mx || '[]'),
      NS: JSON.parse(row.dns_ns || '[]'),
      hasRecords: row.dns_has_records === 1,
    },
    dnsStatus: row.dns_status as DomainCheckResult['dnsStatus'],
    websiteLive: row.website_live as DomainCheckResult['websiteLive'],
    httpResponds: row.http_responds === 1,
    httpsResponds: row.https_responds === 1,
    httpStatus: row.http_status,
    finalUrl: row.final_url,
    pageTitle: row.page_title,
    description: row.description,
    classification: row.classification as Classification,
    company: row.company,
    contact: {
      companyName: row.company,
      contactUrl: row.contact_url,
      contactEmail: row.contact_email,
      phone: row.contact_phone,
      aboutUrl: row.about_url,
      linkedIn: row.linkedin,
      twitter: row.twitter,
      facebook: row.facebook,
    },
    opportunityScore: row.opportunity_score,
    reason: row.reason,
    checkedAt: row.checked_at,
  };
}

export function getResultsForCom(targetCom: string): DomainCheckResult[] {
  const rows = db
    .prepare('SELECT * FROM domain_results WHERE target_com = ? ORDER BY opportunity_score DESC, tld')
    .all(targetCom) as DbRow[];
  return rows.map(rowToResult);
}

export function getAllSummaries(): ComSummary[] {
  const targets = db.prepare('SELECT * FROM com_targets ORDER BY target_com').all() as Array<{
    target_com: string;
    base_name: string;
    scan_status: string;
    last_checked_at: string | null;
  }>;

  return targets.map((t) => {
    const rows = db
      .prepare(
        `SELECT * FROM domain_results WHERE target_com = ? AND tld != 'com' ORDER BY opportunity_score DESC`
      )
      .all(t.target_com) as DbRow[];

    const registeredAlternates = rows.filter((r) => r.registered === 'REGISTERED').length;
    const liveSites = rows.filter((r) => r.website_live === 'LIVE').length;
    const activeBusinesses = rows.filter(
      (r) => r.classification === 'ACTIVE_BUSINESS'
    ).length;

    const best = rows.find((r) => r.tld !== 'com' && r.opportunity_score > 0);

    return {
      targetCom: t.target_com,
      baseName: t.base_name,
      registeredAlternates,
      liveSites,
      activeBusinesses,
      bestProspect: best?.domain ?? null,
      bestProspectTld: best?.tld ?? null,
      opportunityScore: best?.opportunity_score ?? 0,
      lastCheckedAt: t.last_checked_at,
      scanStatus: t.scan_status as ComSummary['scanStatus'],
    };
  });
}

export function getAllProspects(minScore = 0): DomainCheckResult[] {
  const rows = db
    .prepare(
      `SELECT * FROM domain_results
       WHERE tld != 'com' AND opportunity_score >= ?
       ORDER BY opportunity_score DESC`
    )
    .all(minScore) as DbRow[];
  return rows.map(rowToResult);
}

export function getAllResultsForExport(): DomainCheckResult[] {
  const rows = db
    .prepare('SELECT * FROM domain_results WHERE tld != ? ORDER BY target_com, opportunity_score DESC')
    .all('com') as DbRow[];
  return rows.map(rowToResult);
}

export function getScanStatus(targetCom: string): string {
  const row = db
    .prepare('SELECT scan_status FROM com_targets WHERE target_com = ?')
    .get(targetCom) as { scan_status: string } | undefined;
  return row?.scan_status ?? 'idle';
}
