const BASE = import.meta.env.VITE_API_URL || 'http://localhost/api';

function getToken() {
  return localStorage.getItem('session_id');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (payload) => request('POST', '/auth/register', payload),
  logout: () => request('POST', '/auth/logout'),

  // Books
  getBooks: (search, category) => {
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (category) q.set('category', category);
    const qs = q.toString();
    return request('GET', `/books${qs ? '?' + qs : ''}`);
  },
  getBook: (id) => request('GET', `/books/${id}`),
  addBook: (book) => request('POST', '/books', book),
  updateBook: (id, book) => request('PUT', `/books/${id}`, book),
  deleteBook: (id) => request('DELETE', `/books/${id}`),

  // Users
  getProfile: () => request('GET', '/users/profile'),
  updateProfile: (data) => request('PUT', '/users/profile', data),
  changePassword: (current, next) => request('PUT', '/users/change-password', {
    current_password: current,
    new_password: next,
  }),

  // Loans
  createLoan: (userId, bookId, loanDate, dueDate) =>
    request('POST', '/loans', { user_id: userId, book_id: bookId, loan_date: loanDate, due_date: dueDate }),
  getLoan: (id) => request('GET', `/loans/${id}`),
  getUserLoans: (userId) => request('GET', `/loans/user/${userId}`),
  returnLoan: (id) => request('PUT', `/loans/${id}/return`),

  // Admin
  adminBooks: () => request('GET', '/admin/books'),
  adminMembers: () => request('GET', '/admin/members'),
  adminLoans: () => request('GET', '/admin/loans'),
  toggleMemberStatus: (userId) => request('PUT', `/admin/members/${userId}/status`),

  // Reports
  stats: () => request('GET', '/reports/stats'),
  recentLoans: () => request('GET', '/reports/recent-loans'),
  allLoans: () => request('GET', '/reports/all-loans'),
  borrowedBooks: () => request('GET', '/reports/borrowed-books'),
  overdueBooks: () => request('GET', '/reports/overdue-books'),
};
