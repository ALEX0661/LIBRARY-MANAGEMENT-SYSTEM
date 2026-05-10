import Icon from './Icon';
import { useAuth } from './AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',    icon: 'grid',     section: 'OVERVIEW' },
  { id: 'catalog',   label: 'Book Catalog', icon: 'book',     section: 'OVERVIEW' },
  { id: 'loans',     label: 'Loans',        icon: 'exchange', section: 'OVERVIEW' },
  { id: 'members',   label: 'Members',      icon: 'people',   section: 'OVERVIEW' },
  { id: 'prefs',     label: 'Preferences',  icon: 'settings', section: 'SETTINGS' },
];

export default function Sidebar({ active, onNavigate, onLogout }) {
  const { user } = useAuth();

  const initials = user
    ? (user.fname?.[0] ?? '') + (user.lname?.[0] ?? '')
    : 'A';

  const displayName = user
    ? `${user.fname} ${user.lname}`
    : 'Librarian';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">
          <Icon name="library" size={19} />
        </span>
        <span className="sidebar-brand-text">Library Admin</span>
      </div>

      <nav className="sidebar-nav">
        {['OVERVIEW', 'SETTINGS'].map((section) => (
          <div key={section}>
            <p className="sidebar-section-label">{section}</p>
            {NAV_ITEMS.filter((n) => n.section === section).map((item) => (
              <button
                key={item.id}
                className={`sidebar-nav-item${active === item.id ? ' active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">{initials.toUpperCase()}</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{displayName}</span>
          <span className="sidebar-user-role">
            {user?.role === 'admin' ? 'Administrator' : 'Member'}
          </span>
        </div>
        <button
          className="sidebar-logout"
          title="Logout"
          onClick={onLogout}
        >
          <Icon name="logout" size={16} />
        </button>
      </div>
    </aside>
  );
}
