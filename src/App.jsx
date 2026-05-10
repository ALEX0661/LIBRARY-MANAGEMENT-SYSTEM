import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import LibraryLogin     from './LibraryLogin';
import AdminDashboard   from './AdminDashboard';
import BookCatalog      from './BookCatalog';
import LoanManagement   from './LoanManagement';
import MemberManagement from './MemberManagement';
import MemberProfile    from './MemberProfile';
import { api } from './api';

function Router() {
  const { user, logout } = useAuth();
  const [page, setPage]  = useState('dashboard');

  if (!user) return <LibraryLogin />;

  async function handleLogout() {
    try { await api.logout(); } catch {}
    logout();
  }

  function navigate(id) {
    const valid = ['dashboard', 'catalog', 'loans', 'members', 'memberProfile', 'prefs'];
    if (valid.includes(id)) setPage(id);
  }

  const props = { onLogout: handleLogout, onNavigate: navigate };

  if (page === 'catalog')       return <BookCatalog      {...props} />;
  if (page === 'loans')         return <LoanManagement   {...props} />;
  if (page === 'members')       return <MemberManagement {...props} />;
  if (page === 'memberProfile') return <MemberProfile    {...props} />;

  return <AdminDashboard {...props} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
