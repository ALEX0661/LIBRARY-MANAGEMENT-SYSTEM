import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import Sidebar from './Sidebar';
import Icon from './Icon';
import { useToast, ToastContainer } from './toast';
import './LoanManagement.css';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function twoWeeksStr() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split('T')[0];
}

function IssueLoanModal({ onClose, onIssued }) {
  const [books, setBooks]     = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm]       = useState({
    book_id: '', user_id: '',
    loan_date: todayStr(), due_date: twoWeeksStr(),
  });
  const [bookSearch, setBookSearch]     = useState('');
  const [showBookDrop, setShowBookDrop] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [b, m] = await Promise.all([api.getBooks(), api.adminMembers()]);
        setBooks(b.data ?? []);
        setMembers(m.data ?? []);
      } catch {}
    }
    load();
  }, []);

  const filteredBooks = books.filter((b) =>
    (b.fld_title ?? b.title ?? '').toLowerCase().includes(bookSearch.toLowerCase())
  );

  function selectBook(b) {
    const id = b.fld_book_id ?? b.book_id;
    setForm((p) => ({ ...p, book_id: id }));
    setBookSearch(b.fld_title ?? b.title ?? '');
    setShowBookDrop(false);
  }

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.book_id || !form.user_id || !form.loan_date || !form.due_date) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.createLoan(form.user_id, form.book_id, form.loan_date, form.due_date);
      onIssued?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div>
            <p className="modal-title">Issue a Book</p>
            <p className="modal-subtitle">Fill in the details below to record a new loan.</p>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <div className="ll-error">{error}</div>}

            <div className="field">
              <label>BOOK TITLE *</label>
              <div style={{ position: 'relative' }}>
                <div className="field-input-wrap">
                  <span className="field-icon"><Icon name="search" size={14} /></span>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Search by title…"
                    value={bookSearch}
                    autoComplete="off"
                    onChange={(e) => { setBookSearch(e.target.value); setShowBookDrop(true); setForm((p) => ({ ...p, book_id: '' })); }}
                    onFocus={() => setShowBookDrop(true)}
                    onBlur={() => setTimeout(() => setShowBookDrop(false), 150)}
                  />
                </div>
                {showBookDrop && filteredBooks.length > 0 && (
                  <ul className="lm-book-dropdown">
                    {filteredBooks.slice(0, 8).map((b) => {
                      const id = b.fld_book_id ?? b.book_id;
                      return (
                        <li key={id} className="lm-dropdown-item" onMouseDown={() => selectBook(b)}>
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{b.fld_title ?? b.title}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> — {b.fld_author ?? b.author}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="field">
              <label>MEMBER *</label>
              <div className="field-input-wrap">
                <span className="field-icon"><Icon name="person" size={14} /></span>
                <select className="field-select" value={form.user_id} onChange={set('user_id')} style={{ paddingLeft: 34 }}>
                  <option value="">Select member…</option>
                  {members.map((m) => {
                    const id = m.fld_user_id ?? m.user_id;
                    const name = `${m.fld_fname ?? m.fname} ${m.fld_lname ?? m.lname}`;
                    return <option key={id} value={id}>{name}</option>;
                  })}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>LOAN DATE *</label>
                <div className="field-input-wrap">
                  <span className="field-icon"><Icon name="calendar" size={14} /></span>
                  <input type="date" className="field-input" value={form.loan_date} onChange={set('loan_date')} />
                </div>
              </div>
              <div className="field">
                <label>DUE DATE *</label>
                <div className="field-input-wrap">
                  <span className="field-icon"><Icon name="calendar" size={14} /></span>
                  <input type="date" className="field-input" value={form.due_date} onChange={set('due_date')} min={form.loan_date} />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              Issue Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoanManagement({ onLogout, onNavigate }) {
  const { user } = useAuth();
  const { toasts, toast } = useToast();

  const [loans, setLoans]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showIssue, setShowIssue]   = useState(false);

  const isAdmin = user?.role === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = isAdmin
        ? await api.adminLoans()
        : await api.getUserLoans(user.user_id);
      setLoans(res.data ?? []);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user?.user_id]);

  useEffect(() => { load(); }, [load]);

  async function handleReturn(loan) {
    const id = loan.fld_loan_id ?? loan.loan_id;
    try {
      await api.returnLoan(id);
      toast('Book returned successfully.', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  function getLoanStatus(loan) {
    if (loan.fld_return_date ?? loan.return_date) return 'returned';
    const due = new Date(loan.fld_due_date ?? loan.due_date);
    if (due < new Date()) return 'overdue';
    return 'active';
  }

  const filtered = loans.filter((l) => {
    const q = search.toLowerCase();
    return (
      (l.fld_title ?? l.book_title ?? '').toLowerCase().includes(q) ||
      ((l.fld_fname ?? l.fname ?? '') + ' ' + (l.fld_lname ?? l.lname ?? '')).toLowerCase().includes(q)
    );
  });

  const overdueCount  = loans.filter((l) => getLoanStatus(l) === 'overdue').length;
  const activeCount   = loans.filter((l) => getLoanStatus(l) === 'active').length;
  const returnedCount = loans.filter((l) => getLoanStatus(l) === 'returned').length;

  return (
    <div className="layout">
      <Sidebar active="loans" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="layout-main">
        <div className="topbar">
          <div className="topbar-search">
            <Icon name="search" size={14} />
            <input
              type="text"
              placeholder="Search by book title or member name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="topbar-right">
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => setShowIssue(true)}>
                <Icon name="plus" size={14} />
                New Loan
              </button>
            )}
          </div>
        </div>

        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Loan Management</h1>
              <p className="page-subtitle">Track and manage all book loans</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#eef2ff', color: 'var(--brand)' }}>
                <Icon name="exchange" size={22} />
              </div>
              <div>
                <p className="stat-label">Active Loans</p>
                <p className="stat-value">{activeCount}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
                <Icon name="warning" size={22} />
              </div>
              <div>
                <p className="stat-label">Overdue</p>
                <p className="stat-value" style={{ color: 'var(--red)' }}>{overdueCount}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                <Icon name="check" size={22} />
              </div>
              <div>
                <p className="stat-label">Returned</p>
                <p className="stat-value">{returnedCount}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="ad-table-head">
              <h2 className="ad-table-title">Active Loan Ledger</h2>
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
                      <th>BOOK</th>
                      {isAdmin && <th>MEMBER</th>}
                      <th>LOAN DATE</th>
                      <th>DUE DATE</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-state">No loans found.</td>
                      </tr>
                    ) : (
                      filtered.map((loan, i) => {
                        const status = getLoanStatus(loan);
                        const dueDate = loan.fld_due_date ?? loan.due_date;
                        const loanId = loan.fld_loan_id ?? loan.loan_id;
                        const isOverdue = status === 'overdue';
                        const isReturned = status === 'returned';
                        return (
                          <tr key={loanId ?? i}>
                            <td>
                              <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 13.5 }}>
                                {loan.fld_title ?? loan.book_title}
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                {loan.fld_author ?? loan.author ?? ''}
                              </div>
                            </td>
                            {isAdmin && (
                              <td>{(loan.fld_fname ?? loan.fname ?? '')} {(loan.fld_lname ?? loan.lname ?? '')}</td>
                            )}
                            <td>{loan.fld_loan_date ?? loan.loan_date}</td>
                            <td style={{ color: isOverdue ? 'var(--red)' : 'inherit', fontWeight: isOverdue ? 600 : 400, textDecoration: isReturned ? 'line-through' : 'none' }}>
                              {dueDate}
                            </td>
                            <td>
                              <span className={`badge badge-${status}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            </td>
                            <td>
                              {!isReturned && isAdmin && (
                                <button
                                  className="btn btn-secondary"
                                  style={{ fontSize: 12, padding: '5px 10px', height: 'auto' }}
                                  onClick={() => handleReturn(loan)}
                                >
                                  Return
                                </button>
                              )}
                              {isReturned && (
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Returned</span>
                              )}
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

      {showIssue && (
        <IssueLoanModal
          onClose={() => setShowIssue(false)}
          onIssued={() => { toast('Loan issued!', 'success'); load(); }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
