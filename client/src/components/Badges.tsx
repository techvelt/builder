import type { Classification, LiveStatus, RegistrationStatus } from '../types';

export function RegBadge({ status }: { status: RegistrationStatus }) {
  const cls =
    status === 'REGISTERED'
      ? 'badge-registered'
      : status === 'NOT_REGISTERED'
        ? 'badge-not-registered'
        : 'badge-unknown';
  return <span className={`badge ${cls}`}>{status.replace('_', ' ')}</span>;
}

export function LiveBadge({ status }: { status: LiveStatus }) {
  const cls =
    status === 'LIVE' ? 'badge-live' : status === 'NOT_LIVE' ? 'badge-not-live' : 'badge-unknown';
  return <span className={`badge ${cls}`}>{status.replace('_', ' ')}</span>;
}

export function ClassBadge({ classification }: { classification: Classification }) {
  const cls = `status-${classification.toLowerCase().replace(/_/g, '-')}`;
  const label = classification.replace(/_/g, ' ');
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function ScoreDisplay({ score }: { score: number }) {
  const cls = score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low';
  return <span className={`score ${cls}`}>{score}</span>;
}
