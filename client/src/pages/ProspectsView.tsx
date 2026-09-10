import { useEffect, useState } from 'react';
import { fetchProspects } from '../api';
import type { Classification, DomainCheckResult } from '../types';
import { ClassBadge, ScoreDisplay } from '../components/Badges';

type Filter = 'all' | Classification | 'REGISTERED_ONLY' | 'HIGH_SCORE';

export default function ProspectsView() {
  const [prospects, setProspects] = useState<DomainCheckResult[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetchProspects({ minScore: 1 }).then(setProspects);
    const interval = setInterval(() => fetchProspects({ minScore: 1 }).then(setProspects), 8000);
    return () => clearInterval(interval);
  }, []);

  const filtered = prospects.filter((p) => {
    switch (filter) {
      case 'ACTIVE_BUSINESS':
      case 'ACTIVE_WEBSITE':
      case 'PARKED':
      case 'FOR_SALE':
        return p.classification === filter;
      case 'REGISTERED_ONLY':
        return p.registered === 'REGISTERED';
      case 'HIGH_SCORE':
        return p.opportunityScore >= 50;
      default:
        return true;
    }
  });

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem', fontSize: '1.375rem' }}>Best .com Buyers</h2>
      <p className="meta-text" style={{ marginBottom: '1.25rem' }}>
        Alternate-domain owners ranked by likelihood to purchase the matching .com
      </p>

      <div className="toolbar">
        <div className="filter-chips">
          {([
            ['all', 'All Prospects'],
            ['ACTIVE_BUSINESS', 'Active Business'],
            ['ACTIVE_WEBSITE', 'Active Website'],
            ['PARKED', 'Parked'],
            ['FOR_SALE', 'For Sale'],
            ['REGISTERED_ONLY', 'Registered Only'],
            ['HIGH_SCORE', 'Highest Score (50+)'],
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
          <h3>No prospects found</h3>
          <p>Run a scan to discover alternate-TLD owners who may want your .com domains.</p>
        </div>
      ) : (
        filtered.map((p) => (
          <div key={`${p.targetCom}-${p.tld}`} className="prospect-card">
            <div className="prospect-card-header">
              <div>
                <div className="prospect-arrow">
                  {p.domain} → {p.targetCom}
                </div>
                <div style={{ marginTop: '0.375rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <ClassBadge classification={p.classification} />
                  <span className="meta-text">.{p.tld}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="meta-text" style={{ fontSize: '0.75rem' }}>Opportunity</div>
                <ScoreDisplay score={p.opportunityScore} />
              </div>
            </div>

            {(p.pageTitle || p.company) && (
              <div style={{ marginBottom: '0.5rem' }}>
                {p.pageTitle && <div><strong>{p.pageTitle}</strong></div>}
                {p.company && p.company !== p.pageTitle && (
                  <div className="meta-text">{p.company}</div>
                )}
              </div>
            )}

            <div className="contact-links">
              {p.finalUrl && (
                <a href={p.finalUrl} target="_blank" rel="noopener noreferrer">
                  Visit site
                </a>
              )}
              {p.contact.contactEmail && (
                <a href={`mailto:${p.contact.contactEmail}`}>{p.contact.contactEmail}</a>
              )}
              {p.contact.contactUrl && (
                <a href={p.contact.contactUrl} target="_blank" rel="noopener noreferrer">
                  Contact page
                </a>
              )}
              {p.contact.phone && (
                <a href={`tel:${p.contact.phone}`}>{p.contact.phone}</a>
              )}
              {p.contact.linkedIn && (
                <a href={p.contact.linkedIn} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              )}
            </div>

            <p className="prospect-reason">{p.reason}</p>
          </div>
        ))
      )}
    </div>
  );
}
