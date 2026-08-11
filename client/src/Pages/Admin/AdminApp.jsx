import { NavLink, Route, Routes, Link } from 'react-router-dom';
import { LayoutGrid, Package, Tags, Truck, ShoppingCart, MessageSquare, Settings as SettingsIcon, ExternalLink } from 'lucide-react';

import { useAuth } from '../../lib/auth';
import Dashboard from './Dashboard';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminWilayas from './AdminWilayas';
import AdminMessages from './AdminMessages';
import AdminSettings from './AdminSettings';

/**
 * The admin.
 *
 * Same brand as the storefront (olive, cream, Cinzel headings) but denser and
 * quieter. There is deliberately no decorative animation anywhere in this tree:
 * the client works through orders here every day and motion that is charming
 * once is friction on the hundredth pass.
 *
 * Everything is optimised for speed of data entry: tables over cards, visible
 * labels, no confirmation modals except where something is destroyed.
 */

const NAV = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutGrid, end: true },
  { to: '/admin/commandes', label: 'Commandes', icon: ShoppingCart },
  { to: '/admin/produits', label: 'Produits', icon: Package },
  { to: '/admin/categories', label: 'Catégories', icon: Tags },
  { to: '/admin/wilayas', label: 'Livraison', icon: Truck },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/reglages', label: 'Réglages', icon: SettingsIcon },
];

function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="flex shrink-0 flex-col border-b border-gold/20 bg-olive lg:h-screen lg:w-56 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-4 py-4 lg:block lg:py-6">
        <Link to="/admin" className="font-display text-sm tracking-[0.18em] text-cream">
          Evora Home
        </Link>
        <p className="hidden text-[11px] uppercase tracking-[0.15em] text-sand/70 lg:mt-1 lg:block">
          Administration
        </p>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-[12px] text-sand transition-colors hover:text-cream lg:hidden"
        >
          Boutique
          <ExternalLink size={13} strokeWidth={1.5} />
        </Link>
      </div>

      <nav aria-label="Administration" className="flex-1 overflow-x-auto px-2 pb-2 lg:px-2 lg:pb-0">
        <ul className="flex w-max gap-1 lg:w-auto lg:flex-col">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center gap-2.5 whitespace-nowrap rounded-sm px-3 text-[13px] transition-colors duration-150 ${
                    isActive ? 'bg-forest text-cream' : 'text-sand hover:bg-forest/60 hover:text-cream'
                  }`
                }
              >
                <Icon size={16} strokeWidth={1.5} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="hidden border-t border-sand/15 px-3 py-4 lg:block">
        <Link
          to="/"
          className="flex min-h-[36px] items-center gap-1.5 text-[12px] text-sand transition-colors hover:text-cream"
        >
          Voir la boutique
          <ExternalLink size={13} strokeWidth={1.5} />
        </Link>

        <p className="mt-3 truncate text-[12px] text-sand/60">{user?.nom}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-1 text-[12px] text-sand underline decoration-gold/60 underline-offset-4 transition-colors hover:text-cream"
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

export default function AdminApp() {
  return (
    <div className="flex min-h-screen flex-col bg-cream lg:flex-row">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:h-screen lg:overflow-y-auto lg:px-8 lg:py-8">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="commandes" element={<AdminOrders />} />
          <Route path="commandes/:id" element={<AdminOrders />} />
          <Route path="produits" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="wilayas" element={<AdminWilayas />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="reglages" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
}
