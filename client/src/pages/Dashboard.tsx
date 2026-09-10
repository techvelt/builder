import { useNavigate } from 'react-router-dom';
import type { ComSummary } from '../types';
import { ScoreDisplay } from '../components/Badges';

interface Props {
  summaries: ComSummary[];
}

export default function Dashboard({ summaries }: Props) {
  const navigate = useNavigate();

  const totalProspects = summaries.reduce((s, r) => s + r.registeredAlternates, 0);
  const totalLive = summaries.reduce((s, r) => s + r.liveSites, 0);
  const totalBusinesses = summaries.reduce((s, r) => s + r.activeBusinesses, 0);

  return (
    <div>
      <div className="summary-stats">
        <div className="stat-box">
          <div className="label">.com Targets</div>
          <div className="value">{summaries.length}</div>
        </div>
        <div className="stat-box">
          <div className="label">Registered Alternates</div>
          <div className="value">{totalProspects}</div>
        </div>
        <div className="stat-box">
          <div className="label">Live Sites</div>
          <div className="value">{totalLive}</div>
        </div>
        <div className="stat-box">
          <div className="label">Active Businesses</div>
          <div className="value">{totalBusinesses}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>.com Domain</th>
                <th>Registered Alternates</th>
                <th>Live Sites</th>
                <th>Active Businesses</th>
                <th>Best Prospect</th>
                <th>Opportunity Score</th>
                <th>Last Checked</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => (
                <tr
                  key={s.targetCom}
                  className="clickable"
                  onClick={() => navigate(`/domain/${encodeURIComponent(s.targetCom)}`)}
                >
                  <td>
                    <strong>{s.targetCom}</strong>
                    {s.scanStatus === 'scanning' && (
                      <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--accent)' }}>
                        scanning…
                      </span>
                    )}
                  </td>
                  <td>{s.registeredAlternates}</td>
                  <td>{s.liveSites}</td>
                  <td>{s.activeBusinesses}</td>
                  <td>
                    {s.bestProspect ? (
                      <span className="truncate" title={s.bestProspect}>
                        .{s.bestProspectTld} — {s.bestProspect}
                      </span>
                    ) : (
                      <span className="meta-text">—</span>
                    )}
                  </td>
                  <td>
                    {s.opportunityScore > 0 ? (
                      <ScoreDisplay score={s.opportunityScore} />
                    ) : (
                      <span className="meta-text">—</span>
                    )}
                  </td>
                  <td className="meta-text">
                    {s.lastCheckedAt
                      ? new Date(s.lastCheckedAt).toLocaleString()
                      : 'Not scanned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
