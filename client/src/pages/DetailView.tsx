import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDomainDetail, rescanDomain } from '../api';
import type { DomainCheckResult } from '../types';
import { RegBadge, LiveBadge, ClassBadge, ScoreDisplay } from '../components/Badges';

type Filter = 'all' | 'ACTIVE_BUSINESS' | 'ACTIVE_WEBSITE' | 'PARKED' | 'FOR_SALE' | 'REGISTERED_ONLY' | 'HIGH_SCORE';

export default function DetailView() {
  const { targetCom } = useParams<{ targetCom: string }>();
  const [results, setResults] = useState<DomainCheckResult[]>([]);
  const [scanStatus, setScanStatus] = useState('idle');
  const [filter, setFilter] = useState<Filter>('all');
  const [rescanning, setRescanning] = useState(false);

  const load = useCallback(async () => {
    if (!targetCom) return;
    const data = await fetchDomainDetail(targetCom);
    setResults(data.results);
    setScanStatus(data.scanStatus);
  }, [targetCom]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const handleRescan = async () => {
    if (!targetCom) return;
    setRescanning(true);
    await rescanDomain(targetCom);
    setTimeout(() => {
      setRescanning(false);
      load();
    }, 3000);
  };

  const filtered = results.filter((r) => {
    if (r.tld === 'com') return false;
    switch (filter) {
      case 'ACTIVE_BUSINESS':
        return r.classification === 'ACTIVE_BUSINESS';
      case 'ACTIVE_WEBSITE':
        return r.classification === 'ACTIVE_WEBSITE';
      case 'PARKED':
        return r.classification === 'PARKED';
      case 'FOR_SALE':
        return r.classification === 'FOR_SALE';
      case 'REGISTERED_ONLY':
        return r.registered === 'REGISTERED';
      case 'HIGH_SCORE':
        return r.opportunityScore >= 50;
      default:
        return true;
    }
  });

  if (!targetCom) return null;

  return (
    <div>
      <Link to="/" className="back-link">← Back to dashboard</Link>
      <div className="detail-header">
        <div>
          <h2>{targetCom}</h2>
          <p className="meta-text">
            Alternate TLD analysis — find who may want to upgrade to this .com
          </p>
        </div>
        <button
          className="btn-secondary btn-sm"
          onClick={handleRescan}
          disabled={rescanning || scanStatus === 'scanning'}
        >
          {rescanning || scanStatus === 'scanning' ? 'Scanning…' : 'Rescan'}
        </button>
      </div>

      <div className="toolbar">
        <div className="filter-chips">
          {([
            ['all', 'All'],
            ['ACTIVE_BUSINESS', 'Active Business'],
            ['ACTIVE_WEBSITE', 'Active Website'],
            ['PARKED', 'Parked'],
            ['FOR_SALE', 'For Sale'],
            ['REGISTERED_ONLY', 'Registered Only'],
            ['HIGH_SCORE', 'High Score (50+)'],
          ] as [Filter, string][]).map(([key, label]) => (
            <button
              key={key}
              className={`chip ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No results yet</h3>
          <p>Run a scan from the dashboard to analyze alternate TLDs for this domain.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>TLD</th>
                  <th>Domain</th>
                  <th>Registered</th>
                  <th>DNS</th>
                  <th>Live</th>
                  <th>Status</th>
                  <th>Title</th>
                  <th>Organization</th>
                  <th>Score</th>
                  <th>Checked</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.tld}>
                    <td><code>.{r.tld}</code></td>
                    <td>
                      {r.websiteLive === 'LIVE' && r.finalUrl ? (
                        <a href={r.finalUrl} target="_blank" rel="noopener noreferrer">
                          {r.domain}
                        </a>
                      ) : (
                        r.domain
                      )}
                    </td>
                    <td><RegBadge status={r.registered} /></td>
                    <td><LiveBadge status={r.dnsStatus} /></td>
                    <td><LiveBadge status={r.websiteLive} /></td>
                    <td><ClassBadge classification={r.classification} /></td>
                    <td className="truncate" title={r.pageTitle || ''}>
                      {r.pageTitle || '—'}
                    </td>
                    <td className="truncate" title={r.company || ''}>
                      {r.company || '—'}
                    </td>
                    <td><ScoreDisplay score={r.opportunityScore} /></td>
                    <td className="meta-text">
                      {new Date(r.checkedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.some((r) => r.contact.contactEmail || r.contact.contactUrl) && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Contact Information</h3>
          {filtered
            .filter((r) => r.opportunityScore >= 30)
            .map((r) => (
              <div key={r.tld} className="prospect-card">
                <div className="prospect-card-header">
                  <span className="prospect-arrow">
                    {r.domain} → {r.targetCom}
                  </span>
                  <ScoreDisplay score={r.opportunityScore} />
                </div>
                <div className="contact-links">
                  {r.company && <span>Company: <strong>{r.company}</strong></span>}
                  {r.contact.contactEmail && (
                    <a href={`mailto:${r.contact.contactEmail}`}>{r.contact.contactEmail}</a>
                  )}
                  {r.contact.contactUrl && (
                    <a href={r.contact.contactUrl} target="_blank" rel="noopener noreferrer">
                      Contact page
                    </a>
                  )}
                  {r.contact.phone && (
                    <a href={`tel:${r.contact.phone}`}>{r.contact.phone}</a>
                  )}
                  {r.contact.aboutUrl && (
                    <a href={r.contact.aboutUrl} target="_blank" rel="noopener noreferrer">
                      About
                    </a>
                  )}
                  {r.contact.linkedIn && (
                    <a href={r.contact.linkedIn} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                </div>
                <p className="prospect-reason">{r.reason}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
