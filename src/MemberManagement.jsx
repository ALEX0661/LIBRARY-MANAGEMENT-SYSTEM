import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import Sidebar from './Sidebar';
import Icon from './Icon';
import { useToast, ToastContainer } from './toast';
import './MemberManagement.css';

const AVATAR_COLORS = [
  '#818cf8', '#34d399', '#f472b6', '#fb923c', '#60a5fa',
  '#a78bfa', '#4ade80', '#f87171', '#facc15',
];

function avatarColor(userId) {
  return AVATAR_COLORS[(userId ?? 0) % AVATAR_COLORS.length];
}

function initials(member) {
  const f = member.fld_fname ?? member.fname ?? '';
  const l = member.fld_lname ?? member.lname ?? '';
  return (f[0] ?? '') + (l[0] ?? '');
}

export default function MemberManagement({ onLogout, onNavigate }) {
  const { user } = useAuth();
  const { toasts, toast } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminMembers();
      setMembers(res.data ?? []);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggleStatus(member) {
    const id = member.fld_user_id ?? member.user_id;
    const name = `${member.fld_fname ?? member.fname} ${member.fld_lname ?? member.lname}`;
    const isActive = (member.fld_status ?? member.status) === 'active';
    try {
      await api.toggleMemberStatus(id);
      toast(`${name} is now ${isActive ? 'inactive' : 'active'}.`, 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const name = ((m.fld_fname ?? m.fname) + ' ' + (m.fld_lname ?? m.lname)).toLowerCase();
    const email = (m.fld_email ?? m.email ?? '').toLowerCase();
    const username = (m.fld_username ?? m.username ?? '').toLowerCase();
    return name.includes(q) || email.includes(q) || username.includes(q);
  });

  const activeCount   = members.filter((m) => (m.fld_status ?? m.status) === 'active').length;
  const inactiveCount = members.length - activeCount;

  return (
    <div className="layout">
      <Sidebar active="members" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="layout-main">
        <div className="topbar">
          <div className="topbar-search">
            <Icon name="search" size={14} />
            <input
              type="text"
              placeholder="Search by name, email, or username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn" title="Export">
              <Icon name="download" size={15} />
            </button>
          </div>
        </div>

        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Member Management</h1>
              <p className="page-subtitle">Manage and monitor library members</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#eef2ff', color: 'var(--brand)' }}>
                <Icon name="people" size={22} />
              </div>
              <div>
                <p className="stat-label">Total Members</p>
                <p className="stat-value">{members.length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
                <Icon name="check" size={22} />
              </div>
              <div>
                <p className="stat-label">Active</p>
                <p className="stat-value">{activeCount}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}>
                <Icon name="person" size={22} />
              </div>
              <div>
                <p className="stat-label">Inactive</p>
                <p className="stat-value">{inactiveCount}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="ad-table-head">
              <h2 className="ad-table-title">Member Registry</h2>
            </div>
            {loading ? (
              <div className="empty-state">
                <span className="spinner spinner-dark" style={{ margin: '0 auto' }} />
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>MEMBER</th>
                      <th>USERNAME</th>
                      <th>EMAIL</th>
                      <th>ROLE</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-state">No members found.</td>
                      </tr>
                    ) : (
                      filtered.map((member) => {
                        const id     = member.fld_user_id ?? member.user_id;
                        const fname  = member.fld_fname ?? member.fname ?? '';
                        const lname  = member.fld_lname ?? member.lname ?? '';
                        const email  = member.fld_email ?? member.email ?? '';
                        const role   = member.fld_role ?? member.role ?? 'member';
                        const status = member.fld_status ?? member.status ?? 'active';
                        const color  = avatarColor(id);

                        return (
                          <tr key={id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div
                                  style={{
                                    width: 34, height: 34, borderRadius: '50%',
                                    background: color + '33', color,
                                    display: 'grid', placeItems: 'center',
                                    fontWeight: 600, fontSize: 12, flexShrink: 0,
                                  }}
                                >
                                  {initials(member).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 13.5 }}>
                                    {fname} {lname}
                                  </div>
                                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    Joined {member.fld_date_created?.slice(0,10) ?? member.date_created?.slice(0,10) ?? '—'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                              {member.fld_username ?? member.username}
                            </td>
                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{email}</td>
                            <td>
                              <span className="bc-category-badge" style={{ textTransform: 'capitalize' }}>
                                {role}
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-${status}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            </td>
                            <td>
                              <button
                                className={`btn ${status === 'active' ? 'btn-danger' : 'btn-secondary'}`}
                                style={{ fontSize: 12, padding: '5px 10px', height: 'auto' }}
                                onClick={() => handleToggleStatus(member)}
                              >
                                {status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
