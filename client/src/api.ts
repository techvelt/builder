import type { ComSummary, DomainCheckResult, ScanStatusResponse } from './types';

const BASE = '/api';

export async function fetchSummaries(): Promise<ComSummary[]> {
  const res = await fetch(`${BASE}/summaries`);
  return res.json();
}

export async function fetchDomainDetail(targetCom: string): Promise<{
  targetCom: string;
  scanStatus: string;
  results: DomainCheckResult[];
}> {
  const res = await fetch(`${BASE}/domains/${encodeURIComponent(targetCom)}`);
  return res.json();
}

export async function fetchProspects(params?: {
  minScore?: number;
  classification?: string;
}): Promise<DomainCheckResult[]> {
  const qs = new URLSearchParams();
  if (params?.minScore) qs.set('minScore', String(params.minScore));
  if (params?.classification) qs.set('classification', params.classification);
  const res = await fetch(`${BASE}/prospects?${qs}`);
  return res.json();
}

export async function startScan(): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/scan`, { method: 'POST' });
  return res.json();
}

export async function rescanDomain(targetCom: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/scan/${encodeURIComponent(targetCom)}`, { method: 'POST' });
  return res.json();
}

export async function fetchScanStatus(): Promise<ScanStatusResponse> {
  const res = await fetch(`${BASE}/scan/status`);
  return res.json();
}

export function exportCsvUrl(): string {
  return `${BASE}/export/csv`;
}
