import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: 'space_dashboard', end: true },
  { to: '/admin/reports', label: 'Reports', icon: 'monitoring' },
  { to: '/admin/orders', label: 'Orders', icon: 'receipt_long' },
  { to: '/admin/inventory', label: 'Inventory', icon: 'inventory_2' },
  { to: '/admin/customers', label: 'Customers', icon: 'group' },
  { to: '/admin/staff', label: 'Staff', icon: 'manage_accounts' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
];

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-surface-container-low">
      <aside className="w-64 hidden md:flex flex-col bg-espresso text-cream shrink-0">
        <div className="flex items-center gap-2 px-6 h-20 border-b border-cream/10">
          <span className="material-symbols-outlined icon-fill text-gold text-3xl">local_pizza</span>
          <span className="font-display text-xl font-bold">Pizzania</span>
        </div>
        <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-cream/70 hover:bg-white/5 hover:text-cream'
                }`
              }
            >
              <span className="material-symbols-outlined text-xl">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-6 border-t border-cream/10">
          <p className="text-xs text-cream/50 mb-2">Signed in as</p>
          <p className="text-sm font-semibold mb-3">{user?.name}</p>
          <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-gold hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-base">logout</span> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-background border-b border-outline-variant flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <h1 className="font-display text-xl md:text-2xl font-bold text-on-surface">{title}</h1>
          <NavLink to="/" className="text-sm font-semibold text-primary hover:underline">View Storefront →</NavLink>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
