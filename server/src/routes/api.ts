import { Router, type Request, type Response } from 'express';
import * as db from '../db.js';
import { scanAllComDomains, scanComDomain, rescanComDomain } from '../services/scanner.js';
import { SEED_COM_DOMAINS, TLD_LIST } from '../config/tlds.js';
import type { DomainCheckResult, ScanProgress } from '../types.js';

const router = Router();

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

// In-memory scan state for SSE
const activeScans = new Map<string, ScanProgress>();
let globalScanRunning = false;

router.get('/summaries', (_req: Request, res: Response) => {
  res.json(db.getAllSummaries());
});

router.get('/domains/:targetCom', (req: Request, res: Response) => {
  const targetCom = routeParam(req.params.targetCom);
  const results = db.getResultsForCom(targetCom);
  const scanStatus = db.getScanStatus(targetCom);
  res.json({ targetCom, scanStatus, results });
});

router.get('/prospects', (req: Request, res: Response) => {
  const minScore = parseInt(req.query.minScore as string) || 0;
  const classification = req.query.classification as string | undefined;

  let prospects = db.getAllProspects(minScore);

  if (classification) {
    prospects = prospects.filter((p) => p.classification === classification);
  }

  res.json(prospects);
});

router.get('/export/csv', (_req: Request, res: Response) => {
  const results = db.getAllResultsForExport();
  const csv = buildCsv(results);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="com-buyer-prospects.csv"');
  res.send(csv);
});

router.post('/scan', async (_req: Request, res: Response) => {
  if (globalScanRunning) {
    res.status(409).json({ error: 'Scan already in progress' });
    return;
  }

  globalScanRunning = true;
  res.json({ message: 'Scan started', domains: SEED_COM_DOMAINS });

  scanAllComDomains(SEED_COM_DOMAINS, (progress) => {
    activeScans.set(progress.targetCom, progress);
  })
    .then(() => {
      globalScanRunning = false;
      activeScans.clear();
    })
    .catch((err) => {
      console.error('Scan failed:', err);
      globalScanRunning = false;
    });
});

router.post('/scan/:targetCom', async (req: Request, res: Response) => {
  const targetCom = routeParam(req.params.targetCom);

  if (!(SEED_COM_DOMAINS as readonly string[]).includes(targetCom)) {
    res.status(404).json({ error: 'Domain not in seed list' });
    return;
  }

  res.json({ message: `Rescan started for ${targetCom}` });

  rescanComDomain(targetCom, (progress) => {
    activeScans.set(targetCom, progress);
  })
    .then(() => activeScans.delete(targetCom))
    .catch((err) => console.error(`Rescan failed for ${targetCom}:`, err));
});

router.get('/scan/status', (_req: Request, res: Response) => {
  const statuses: Record<string, ScanProgress | string> = {};
  for (const com of SEED_COM_DOMAINS) {
    statuses[com] = activeScans.get(com) ?? db.getScanStatus(com);
  }
  res.json({ globalScanRunning, statuses });
});

router.get('/tlds', (_req: Request, res: Response) => {
  res.json(TLD_LIST);
});

function buildCsv(results: DomainCheckResult[]): string {
  const headers = [
    'target_com',
    'alternate_domain',
    'tld',
    'registered',
    'dns',
    'website_live',
    'http_status',
    'final_url',
    'page_title',
    'description',
    'classification',
    'company',
    'contact_email',
    'contact_url',
    'opportunity_score',
    'reason',
    'checked_at',
  ];

  const rows = results.map((r) =>
    [
      r.targetCom,
      r.domain,
      r.tld,
      r.registered,
      r.dnsStatus,
      r.websiteLive,
      r.httpStatus ?? '',
      r.finalUrl ?? '',
      csvEscape(r.pageTitle ?? ''),
      csvEscape(r.description ?? ''),
      r.classification,
      csvEscape(r.company ?? ''),
      r.contact.contactEmail ?? '',
      r.contact.contactUrl ?? '',
      r.opportunityScore,
      csvEscape(r.reason),
      r.checkedAt,
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default router;
