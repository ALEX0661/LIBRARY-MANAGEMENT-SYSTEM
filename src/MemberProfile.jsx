import { useState, useEffect } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import Sidebar from './Sidebar';
import Icon from './Icon';
import { useToast, ToastContainer } from './toast';
import './MemberProfile.css';

function AvatarIllustration() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path d="M15 100 c0-25 15-40 35-40 s35 15 35 40 Z" fill="#69aeb0" />
      <path d="M42 62 h16 v10 q-8 5 -16 0 Z" fill="#eaba9f" />
      <path d="M42 62 l8 14 l8 -14 l6 4 l-14 20 l-14 -20 Z" fill="#589799" />
      <circle cx="50" cy="40" r="18" fill="#fcd2b5" />
      <circle cx="43" cy="38" r="1.5" fill="#2d3748" />
      <circle cx="57" cy="38" r="1.5" fill="#2d3748" />
      <path d="M49 39 v5 h2" fill="none" stroke="#d59c7a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M46 50 q4 3 8 0" fill="none" stroke="#c48a6a" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 45 c0-30 36-30 36 0 c0 -15 -36 -15 -36 0" fill="#29303b"/>
      <path d="M 33 45 Q 30 20 50 18 Q 70 20 67 45 Q 60 25 50 25 Q 40 25 33 45 Z" fill="#29303b" />
    </svg>
  );
}

function EditProfileModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    fname:   profile.fname ?? '',
    mname:   profile.mname ?? '',
    lname:   profile.lname ?? '',
    phone:   profile.phone ?? '',
    address: profile.address ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    if (!form.fname || !form.lname) {
      setError('First and last name are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.updateProfile(form);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <div>
            <p className="modal-title">Edit Profile</p>
            <p className="modal-subtitle">Update your personal information</p>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>
        <form onSubmit={handleSave} noValidate>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {error && <div className="ll-error">{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div className="field">
                <label>FIRST NAME *</label>
                <input className="field-input" type="text" value={form.fname} onChange={set('fname')} />
              </div>
              <div className="field">
                <label>MIDDLE NAME</label>
                <input className="field-input" type="text" value={form.mname} onChange={set('mname')} />
              </div>
              <div className="field">
                <label>LAST NAME *</label>
                <input className="field-input" type="text" value={form.lname} onChange={set('lname')} />
              </div>
            </div>
            <div className="field">
              <label>PHONE NUMBER</label>
              <input className="field-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="09XXXXXXXXX" />
            </div>
            <div className="field">
              <label>ADDRESS</label>
              <input className="field-input" type="text" value={form.address} onChange={set('address')} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    if (!form.current || !form.next || !form.confirm) {
      setError('All fields are required.'); return;
    }
    if (form.next !== form.confirm) {
      setError('New passwords do not match.'); return;
    }
    if (form.next.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    setError('');
    setLoading(true);
    try {
      await api.changePassword(form.current, form.next);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div>
            <p className="modal-title">Change Password</p>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>
        <form onSubmit={handleSave} noValidate>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {error && <div className="ll-error">{error}</div>}
            {success && <div className="ll-success-banner"><Icon name="check" size={14}/>Password changed!</div>}
            <div className="field">
              <label>CURRENT PASSWORD</label>
              <input className="field-input" type="password" value={form.current} onChange={set('current')} />
            </div>
            <div className="field">
              <label>NEW PASSWORD</label>
              <input className="field-input" type="password" value={form.next} onChange={set('next')} />
            </div>
            <div className="field">
              <label>CONFIRM NEW PASSWORD</label>
              <input className="field-input" type="password" value={form.confirm} onChange={set('confirm')} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MemberProfile({ onLogout, onNavigate }) {
  const { user, updateUser } = useAuth();
  const { toasts, toast }    = useToast();

  const [profile, setProfile]   = useState(null);
  const [loans, setLoans]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [p, l] = await Promise.all([
          api.getProfile(),
          api.getUserLoans(user?.user_id),
        ]);
        if (!mounted) return;
        setProfile(p.data);
        setLoans(l.data ?? []);
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (user?.user_id) load();
    return () => { mounted = false; };
  }, [user?.user_id]);

  const totalBorrowed  = loans.length;
  const currentlyOnLoan = loans.filter((l) => !l.fld_return_date && !l.return_date).length;
  const overdue = loans.filter((l) => {
    if (l.fld_return_date || l.return_date) return false;
    return new Date(l.fld_due_date ?? l.due_date) < new Date();
  }).length;

  const recentLoans = [...loans]
    .sort((a, b) => new Date(b.fld_loan_date ?? b.loan_date) - new Date(a.fld_loan_date ?? a.loan_date))
    .slice(0, 4);

  return (
    <div className="layout">
      <Sidebar active="members" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="layout-main">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
            <button className="mp-breadcrumb-btn" onClick={() => onNavigate('members')}>Members</button>
            <Icon name="chevRight" size={13} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {profile ? `${profile.fname} ${profile.lname}` : 'Profile'}
            </span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-secondary" onClick={() => setModal('edit')}>Edit Profile</button>
            <button className="btn btn-secondary" onClick={() => setModal('pw')}>Change Password</button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state" style={{ marginTop: 80 }}>
            <span className="spinner spinner-dark" style={{ margin: '0 auto' }} />
          </div>
        ) : !profile ? null : (
          <div className="page-content">
            <div className="mp-profile-grid">
              <div className="mp-col-left">
                <div className="card mp-profile-card">
                  <div className="mp-avatar-wrap">
                    <div className="mp-avatar-inner"><AvatarIllustration /></div>
                    <div className="mp-active-dot" />
                  </div>
                  <h2 className="mp-name">{profile.fname} {profile.lname}</h2>
                  <p className="mp-username">@{profile.username}</p>
                  <span className={`badge badge-${profile.status ?? 'active'} mp-status-badge`}>
                    {(profile.status ?? 'active').toUpperCase()} MEMBER
                  </span>

                  <div className="mp-meta-list">
                    {[
                      { icon: 'calendar', label: 'JOINED', val: profile.date_created?.slice(0,10) ?? '—' },
                      { icon: 'mail',     label: 'EMAIL',   val: profile.email },
                      { icon: 'phone',    label: 'PHONE',   val: profile.phone ?? 'Not provided' },
                      { icon: 'person',   label: 'ROLE',    val: profile.role?.toUpperCase() ?? '—' },
                    ].map((item) => (
                      <div key={item.label} className="mp-meta-item">
                        <div className="mp-meta-icon"><Icon name={item.icon} size={16} /></div>
                        <div>
                          <p className="mp-meta-lbl">{item.label}</p>
                          <p className="mp-meta-val">{item.val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {profile.address && (
                  <div className="card mp-address-card">
                    <h3 className="mp-section-title">Address</h3>
                    <p className="mp-address-txt">{profile.address}</p>
                  </div>
                )}
              </div>

              <div className="mp-col-right">
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#eef2ff', color: 'var(--brand)' }}>
                      <Icon name="book" size={20} />
                    </div>
                    <div>
                      <p className="stat-label">Total Borrowed</p>
                      <p className="stat-value">{totalBorrowed}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                      <Icon name="exchange" size={20} />
                    </div>
                    <div>
                      <p className="stat-label">On Loan</p>
                      <p className="stat-value">{currentlyOnLoan}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
                      <Icon name="warning" size={20} />
                    </div>
                    <div>
                      <p className="stat-label">Overdue</p>
                      <p className="stat-value" style={overdue > 0 ? { color: 'var(--red)' } : {}}>
                        {overdue}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="ad-table-head">
                    <h2 className="ad-table-title">Loan History</h2>
                  </div>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>BOOK TITLE</th>
                          <th>LOAN DATE</th>
                          <th>DUE DATE</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentLoans.length === 0 ? (
                          <tr><td colSpan={4} className="empty-state">No loans yet.</td></tr>
                        ) : (
                          recentLoans.map((loan, i) => {
                            const returned  = !!(loan.fld_return_date || loan.return_date);
                            const isOverdue = !returned && new Date(loan.fld_due_date ?? loan.due_date) < new Date();
                            const status    = returned ? 'returned' : isOverdue ? 'overdue' : 'active';
                            return (
                              <tr key={loan.fld_loan_id ?? loan.loan_id ?? i}>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                  {loan.fld_title ?? loan.book_title}
                                </td>
                                <td>{loan.fld_loan_date ?? loan.loan_date}</td>
                                <td>{loan.fld_due_date ?? loan.due_date}</td>
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
              </div>
            </div>
          </div>
        )}
      </div>

      {modal === 'edit' && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setModal(null)}
          onSaved={() => {
            toast('Profile updated!', 'success');
            setModal(null);
            api.getProfile().then((r) => { setProfile(r.data); updateUser(r.data); }).catch(() => {});
          }}
        />
      )}

      {modal === 'pw' && (
        <ChangePasswordModal
          onClose={() => setModal(null)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
