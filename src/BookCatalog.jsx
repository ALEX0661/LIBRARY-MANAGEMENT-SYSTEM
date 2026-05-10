import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import Sidebar from './Sidebar';
import Icon from './Icon';
import { useToast, ToastContainer } from './toast';
import './BookCatalog.css';

const CATEGORIES = [
  'Science', 'Fiction', 'Non-Fiction', 'History',
  'Self-Help', 'Business', 'Technology', 'Finance',
  'Sci-Fi', 'Biography', 'Philosophy',
];

const STATUS_MAP = {
  available:   { label: 'AVAILABLE',   dot: 'var(--green)' },
  'checked-out': { label: 'CHECKED OUT', dot: 'var(--orange)' },
  reserved:    { label: 'RESERVED',    dot: 'var(--blue)' },
};

const COVER_GRADIENTS = [
  'linear-gradient(160deg,#0d4f60 0%,#1a8ca0 100%)',
  'linear-gradient(160deg,#0e6b5a 0%,#15b88a 100%)',
  'linear-gradient(160deg,#151535 0%,#2d2d6e 100%)',
  'linear-gradient(160deg,#1a5c42 0%,#2ea872 100%)',
  'linear-gradient(160deg,#5c1a1a 0%,#a83030 100%)',
  'linear-gradient(160deg,#2d2d2d 0%,#555 100%)',
  'linear-gradient(160deg,#5c480a 0%,#a88520 100%)',
  'linear-gradient(160deg,#0a305c 0%,#1a5ca8 100%)',
];

function bookGradient(id) {
  return COVER_GRADIENTS[(id - 1) % COVER_GRADIENTS.length];
}

function BookFormModal({ book, onClose, onSaved }) {
  const { toast } = useToast?.() ?? {};
  const [form, setForm] = useState({
    title:        book?.fld_title       ?? '',
    author:       book?.fld_author      ?? '',
    isbn:         book?.fld_isbn        ?? '',
    category:     book?.fld_category    ?? '',
    publisher:    book?.fld_publisher   ?? '',
    year_pub:     book?.fld_year_pub    ?? '',
    total_copies: book?.fld_total_copies ?? 1,
    description:  book?.fld_description ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const isEdit = !!book;

  const set = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title || !form.author) {
      setError('Title and author are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        year_pub: form.year_pub ? parseInt(form.year_pub) : undefined,
        total_copies: parseInt(form.total_copies) || 1,
      };
      if (isEdit) {
        await api.updateBook(book.fld_book_id, payload);
      } else {
        await api.addBook(payload);
      }
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
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div>
            <p className="modal-title">{isEdit ? 'Edit Book' : 'Add New Book'}</p>
            <p className="modal-subtitle">
              {isEdit ? 'Update the book details below.' : 'Enter the bibliographic details for the new entry.'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>

        <form onSubmit={handleSave} noValidate>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <div className="ll-error">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <label>BOOK TITLE *</label>
                <input className="field-input" type="text" placeholder="e.g. The Shadow of the Wind" value={form.title} onChange={set('title')} />
              </div>
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <label>AUTHOR *</label>
                <input className="field-input" type="text" placeholder="Full name" value={form.author} onChange={set('author')} />
              </div>
              <div className="field">
                <label>ISBN</label>
                <input className="field-input" type="text" placeholder="13-digit code" value={form.isbn} onChange={set('isbn')} />
              </div>
              <div className="field">
                <label>CATEGORY</label>
                <select className="field-select" value={form.category} onChange={set('category')}>
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>PUBLISHER</label>
                <input className="field-input" type="text" placeholder="Publisher name" value={form.publisher} onChange={set('publisher')} />
              </div>
              <div className="field">
                <label>YEAR PUBLISHED</label>
                <input className="field-input" type="number" min="1000" max={new Date().getFullYear()} placeholder="2024" value={form.year_pub} onChange={set('year_pub')} />
              </div>
              <div className="field">
                <label>TOTAL COPIES</label>
                <input className="field-input" type="number" min="1" value={form.total_copies} onChange={set('total_copies')} />
              </div>
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <label>DESCRIPTION</label>
                <textarea className="field-input" rows={3} style={{ height: 'auto', padding: '8px 12px', resize: 'vertical' }} placeholder="Short description…" value={form.description} onChange={set('description')} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {isEdit ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const PAGE_SIZE = 15;

export default function BookCatalog({ onLogout, onNavigate }) {
  const { user } = useAuth();
  const { toasts, toast } = useToast();

  const [books, setBooks]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState(null); // null | 'add' | book-obj

  const isAdmin = user?.role === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getBooks(search || undefined, category || undefined);
      setBooks(res.data ?? []);
      setTotal(res.count ?? 0);
      setPage(1);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(book) {
    if (!confirm(`Delete "${book.fld_title}"? This cannot be undone.`)) return;
    try {
      await api.deleteBook(book.fld_book_id);
      toast('Book deleted.', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const displayed  = books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getStatus(book) {
    if ((book.fld_available_copies ?? book.available_copies) <= 0) return 'checked-out';
    return 'available';
  }

  return (
    <div className="layout">
      <Sidebar active="catalog" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="layout-main">
        <div className="topbar">
          <div className="topbar-search">
            <Icon name="search" size={14} />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="topbar-right">
            <select
              className="bc-category-filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => setModal('add')}>
                <Icon name="plus" size={14} />
                Add Book
              </button>
            )}
          </div>
        </div>

        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Book Catalog</h1>
              <p className="page-subtitle">{total.toLocaleString()} titles in collection</p>
            </div>
          </div>

          <div className="card">
            {loading ? (
              <div className="empty-state">
                <span className="spinner spinner-dark" style={{ margin: '0 auto' }} />
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>BOOK DETAILS</th>
                      <th>ISBN</th>
                      <th>CATEGORY</th>
                      <th>COPIES</th>
                      <th>STATUS</th>
                      {isAdmin && <th>ACTIONS</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-state">No books found.</td>
                      </tr>
                    ) : (
                      displayed.map((book) => {
                        const status = getStatus(book);
                        const st = STATUS_MAP[status] ?? STATUS_MAP.available;
                        const id = book.fld_book_id ?? book.book_id;
                        return (
                          <tr key={id}>
                            <td>
                              <div className="bc-book-cell">
                                <div className="bc-cover" style={{ background: bookGradient(id) }}>
                                  {(book.fld_title ?? book.title)?.[0]}
                                </div>
                                <div>
                                  <div className="bc-book-title">{book.fld_title ?? book.title}</div>
                                  <div className="bc-book-author">{book.fld_author ?? book.author}</div>
                                </div>
                              </div>
                            </td>
                            <td className="bc-isbn">{book.fld_isbn ?? book.isbn ?? '—'}</td>
                            <td>
                              {(book.fld_category ?? book.category) && (
                                <span className="bc-category-badge">{book.fld_category ?? book.category}</span>
                              )}
                            </td>
                            <td>
                              {book.fld_available_copies ?? book.available_copies ?? '—'}
                              <span className="bc-total-copies"> / {book.fld_total_copies ?? book.total_copies}</span>
                            </td>
                            <td>
                              <span className={`badge badge-${status}`}>
                                <span className="status-dot" style={{ background: st.dot }} />
                                {st.label}
                              </span>
                            </td>
                            {isAdmin && (
                              <td>
                                <div className="bc-actions">
                                  <button
                                    className="bc-action-btn"
                                    title="Edit"
                                    onClick={() => setModal(book)}
                                  >
                                    <Icon name="edit" size={14} />
                                  </button>
                                  <button
                                    className="bc-action-btn bc-action-del"
                                    title="Delete"
                                    onClick={() => handleDelete(book)}
                                  >
                                    <Icon name="trash" size={14} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bc-pagination-row">
              <span className="bc-showing">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
              </span>
              <div className="pagination">
                <button className="pg-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <Icon name="chevLeft" size={14} />
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} className={`pg-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>
                      {p}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="pg-ellipsis">…</span>}
                <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  <Icon name="chevRight" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <BookFormModal
          book={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { toast(modal === 'add' ? 'Book added!' : 'Book updated!', 'success'); load(); }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
