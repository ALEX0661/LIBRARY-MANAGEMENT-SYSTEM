import { useState, useEffect } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import Sidebar from './Sidebar';
import Icon from './Icon';
import './AdminDashboard.css';

function BarChart({ data }) {
  const MAX_H = 180;
  const maxVal = Math.max(...data.map((d) => Math.max(d.borrowed ?? 0, d.returned ?? 0)));

  if (!data.length) return null;

  return (
    <div className="ad-bar-chart">
      {data.map((item, i) => {
        const bH = maxVal ? ((item.borrowed ?? 0) / maxVal) * MAX_H : 0;
        const rH = maxVal ? ((item.returned ?? 0) / maxVal) * MAX_H : 0;
        return (
          <div key={i} className="ad-bar-group">
            <div className="ad-bar-track" style={{ height: MAX_H }}>
              <div className="ad-bar-pair" style={{ height: MAX_H, display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                <div className="ad-bar-bor" style={{ height: bH, width: 14, borderRadius: '3px 3px 0 0' }} title={`Borrowed: ${item.borrowed}`} />
                <div className="ad-bar-ret" style={{ height: rH, width: 14, borderRadius: '3px 3px 0 0' }} title={`Returned: ${item.returned}`} />
              </div>
            </div>
            <span className="ad-bar-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data }) {
  if (!data.length) return null;
  const total = data.reduce((s, d) => s + d.value, 0);
  let cum = 0;
  const stops = data
    .map((d) => {
      const pct = (d.value / total) * 100;
      const s = cum;
      cum += pct;
      return `${d.color} ${s.toFixed(1)}% ${cum.toFixed(1)}%`;
    })
    .join(', ');

  return (
    <div className="ad-donut-wrap">
      <div className="ad-donut" style={{ background: `conic-gradient(${stops})` }}>
        <div className="ad-donut-hole">
          <span className="ad-donut-total">Total</span>
          <span className="ad-donut-val">{total}</span>
        </div>
      </div>
      <div className="ad-donut-legend">
        {data.map((d, i) => (
          <div key={i} className="ad-legend-row">
            <span className="ad-legend-dot" style={{ background: d.color }} />
            <span className="ad-legend-txt">{d.label}: {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_COLORS = [
  '#4338ca', '#f97316', '#dc2626', '#eab308', '#ec4899',
  '#22c55e', '#3b82f6', '#8b5cf6',
];

export default function AdminDashboard({ onLogout, onNavigate }) {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loans, setLoans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [s, l] = await Promise.all([api.stats(), api.recentLoans()]);
        if (!mounted) return;
        setStats(s.data ?? s);
        setLoans(l.data ?? []);
      } catch {
        // stats load silently failing is fine, UI shows zeros
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const statCards = [
    {
      label: 'Books Borrowed',
      value: stats?.total_borrowed ?? '—',
      icon: 'book',
      bg: '#eef2ff',
      color: '#4338ca',
    },
    {
      label: 'Active Loans',
      value: stats?.active_loans ?? '—',
      icon: 'exchange',
      bg: '#e0e7ff',
      color: '#4338ca',
    },
    {
      label: 'Overdue Items',
      value: stats?.overdue_loans ?? '—',
      icon: 'warning',
      bg: '#fff7ed',
      color: '#f97316',
      valueColor: '#ef4444',
    },
    {
      label: 'Total Members',
      value: stats?.total_members ?? '—',
      icon: 'people',
      bg: '#dcfce7',
      color: '#16a34a',
    },
  ];

  const categoryData = (stats?.categories ?? []).map((c, i) => ({
    label: c.category || 'Other',
    value: c.count,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const monthlyData = (stats?.monthly ?? []).map((m) => ({
    label: m.month ?? m.label,
    borrowed: m.borrowed ?? 0,
    returned: m.returned ?? 0,
  }));

  const filteredLoans = loans.filter((l) => {
    const q = search.toLowerCase();
    return (
      (l.book_title ?? '').toLowerCase().includes(q) ||
      (l.member_name ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="layout">
      <Sidebar active="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="layout-main">
        <div className="topbar">
          <div className="topbar-search">
            <Icon name="search" size={14} />
            <input
              type="text"
              placeholder="Search books, members, or loan IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn" title="Notifications">
              <Icon name="bell" size={16} />
            </button>
          </div>
        </div>

        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">
                Welcome back, {user?.fname}. Here's what's happening today.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => onNavigate('loans')}>
              <Icon name="plus" size={14} />
              New Loan
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <span className="spinner spinner-dark" style={{ margin: '0 auto' }} />
            </div>
          ) : (
            <>
              <div className="stats-grid">
                {statCards.map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                      <Icon name={s.icon} size={22} />
                    </div>
                    <div>
                      <p className="stat-label">{s.label}</p>
                      <p className="stat-value" style={s.valueColor ? { color: s.valueColor } : {}}>
                        {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ad-charts-row">
                <div className="card ad-chart-bar-card">
                  <div className="ad-chart-head">
                    <h2 className="ad-chart-title">Monthly Activity</h2>
                    <div className="ad-chart-legend">
                      <span className="ad-pill ad-pill-bor" />
                      <span className="ad-pill-label">Borrowed</span>
                      <span className="ad-pill ad-pill-ret" />
                      <span className="ad-pill-label">Returned</span>
                    </div>
                  </div>
                  {monthlyData.length > 0
                    ? <BarChart data={monthlyData} />
                    : <p className="empty-state" style={{ padding: '32px' }}>No monthly data available.</p>
                  }
                </div>

                <div className="card ad-chart-donut-card">
                  <h2 className="ad-chart-title">Books by Category</h2>
                  {categoryData.length > 0
                    ? <DonutChart data={categoryData} />
                    : <p className="empty-state" style={{ padding: '32px' }}>No category data available.</p>
                  }
                </div>
              </div>

              <div className="card">
                <div className="ad-table-head">
                  <h2 className="ad-table-title">Recent Loans</h2>
                  <button className="btn btn-secondary" onClick={() => onNavigate('loans')}>
                    View All
                  </button>
                </div>

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>BOOK TITLE</th>
                        <th>MEMBER</th>
                        <th>LOAN DATE</th>
                        <th>DUE DATE</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoans.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="empty-state">No recent loans found.</td>
                        </tr>
                      ) : (
                        filteredLoans.map((loan, i) => {
                          const status = loan.status ?? (loan.return_date ? 'returned' : 'active');
                          return (
                            <tr key={loan.loan_id ?? i}>
                              <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                {loan.book_title}
                              </td>
                              <td>{loan.member_name ?? loan.fname + ' ' + loan.lname}</td>
                              <td>{loan.loan_date}</td>
                              <td>{loan.due_date}</td>
                              <td>
                                <span className={`badge badge-${status}`}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
