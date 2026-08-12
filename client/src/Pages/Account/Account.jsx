import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, LogOut } from 'lucide-react';

import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatPrice, formatDate, formatPhone } from '../../lib/format';

import ProductGrid from '../../Components/Products/ProductGrid';
import Button from '../../Components/UI/Button';
import Badge from '../../Components/UI/Badge';
import { Field, Select } from '../../Components/UI/Field';
import { Loading, EmptyState, ErrorState } from '../../Components/UI/States';

/**
 * The account area. Layout plus the four sub-pages.
 *
 * Everything here is a convenience. None of it is required to buy anything, and
 * no page in this tree ever appears in a checkout flow.
 *
 * The navigation is a rail on desktop and a scrolling row of tabs on a phone.
 * A rail is what lets the four sections read as one place rather than as four
 * pages that happen to share a heading.
 */

const STATUT_LABEL = {
  NOUVELLE: 'Nouvelle',
  CONFIRMEE: 'Confirmée',
  EN_PREPARATION: 'En préparation',
  EXPEDIEE: 'Expédiée',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
};

const TABS = [
  { to: '/compte', label: 'Mon profil', short: 'Profil', Icon: User, end: true },
  { to: '/compte/commandes', label: 'Mes commandes', short: 'Commandes', Icon: Package },
  { to: '/compte/favoris', label: 'Mes favoris', short: 'Favoris', Icon: Heart },
  { to: '/compte/adresses', label: 'Mes adresses', short: 'Adresses', Icon: MapPin },
];

/** A titled panel. The only container shape used in this tree. */
export function Panel({ title, description, children, className = '' }) {
  return (
    <section className={`rounded-sm border border-greige p-5 sm:p-6 ${className}`}>
      {title ? (
        <header className="mb-5">
          <h2 className="font-display text-base tracking-[0.12em] text-ink">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

/** Feedback under a form. One line, never a toast that has already gone. */
function FormStatus({ status }) {
  if (!status) return null;
  return (
    <p
      role="status"
      className={`rounded-sm border px-3 py-2 text-sm ${
        status.ok ? 'border-greige bg-greige/25 text-ink' : 'border-[#8C2F1F]/40 bg-[#8C2F1F]/5 text-[#8C2F1F]'
      }`}
    >
      {status.message}
    </p>
  );
}

export function AccountLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.nom || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-10">
      {/* Identity card. The name and the phone number are the two things a
          customer checks before trusting that this is their account. */}
      <header className="flex flex-col gap-5 rounded-sm border border-greige bg-greige/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-gold/45 bg-cream font-display text-base tracking-[0.08em] text-gold-deep"
          >
            {initials || 'EH'}
          </span>

          <div className="min-w-0">
            <p className="text-[12px] uppercase tracking-[0.18em] text-ink-muted">Mon compte</p>
            <h1 className="mt-1 truncate font-display text-lg tracking-[0.1em] text-ink sm:text-xl">
              {user?.nom}
            </h1>
            <p className="mt-1 truncate text-sm text-ink-muted">
              <span className="tabular-nums">{formatPhone(user?.telephone)}</span>
              {user?.email ? ` · ${user.email}` : ''}
            </p>
          </div>
        </div>

        <Button
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          variant="secondary"
          size="sm"
          className="shrink-0 self-start sm:self-auto"
        >
          <LogOut size={15} strokeWidth={1.5} />
          Se déconnecter
        </Button>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        {/* Rail on desktop, scrolling tabs on a phone. */}
        <nav aria-label="Sections du compte" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <ul className="flex w-max gap-1 border-b border-greige lg:w-auto lg:flex-col lg:gap-0 lg:border-b-0 lg:border-l lg:border-greige">
            {TABS.map((tab) => (
              <li key={tab.to}>
                <NavLink
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    [
                      'flex min-h-[44px] items-center gap-2.5 whitespace-nowrap px-3 text-sm uppercase tracking-[0.1em] transition-colors duration-200',
                      'border-b-2 lg:border-b-0 lg:border-l-2 lg:-ml-px lg:min-h-[48px]',
                      isActive
                        ? 'border-gold text-ink'
                        : 'border-transparent text-ink-muted hover:border-greige hover:text-ink',
                    ].join(' ')
                  }
                >
                  <tab.Icon size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
                  <span className="lg:hidden">{tab.short}</span>
                  <span className="hidden lg:inline">{tab.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ nom: user?.nom || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [status, setStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);

  async function saveProfile(e) {
    e.preventDefault();
    setStatus(null);
    try {
      const updated = await api.updateProfile(form);
      setUser(updated);
      setStatus({ ok: true, message: 'Profil enregistré' });
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPasswordStatus(null);
    try {
      await api.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setPasswordStatus({ ok: true, message: 'Mot de passe modifié' });
    } catch (err) {
      setPasswordStatus({ ok: false, message: err.message });
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel title="Vos informations" description="Ce que nous inscrivons sur le bon de livraison.">
        <form onSubmit={saveProfile} noValidate className="flex flex-col gap-5">
          <Field
            label="Nom et prénom"
            value={form.nom}
            onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
          />

          <Field
            label="Email (facultatif)"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />

          <div className="rounded-sm border border-greige bg-greige/20 px-3 py-3">
            <span className="text-[12px] uppercase tracking-[0.14em] text-ink-muted">Téléphone</span>
            <p className="mt-1 text-base tabular-nums text-ink">{formatPhone(user?.telephone)}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              Votre identifiant de connexion. Appelez-nous pour le modifier.
            </p>
          </div>

          <Button type="submit" variant="primary" size="md" className="self-start">
            Enregistrer
          </Button>

          <FormStatus status={status} />
        </form>
      </Panel>

      <Panel title="Mot de passe">
        <form onSubmit={savePassword} noValidate className="flex flex-col gap-5">
          <Field
            label="Mot de passe actuel"
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
          />

          <Field
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            hint="6 caractères minimum."
            value={passwords.newPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
          />

          <Button type="submit" variant="secondary" size="md" className="self-start">
            Modifier le mot de passe
          </Button>

          <FormStatus status={passwordStatus} />
        </form>
      </Panel>
    </div>
  );
}

export function Orders() {
  const [state, setState] = useState({ loading: true, error: null, orders: [] });

  useEffect(() => {
    const controller = new AbortController();
    api
      .myOrders(controller.signal)
      .then((orders) => setState({ loading: false, error: null, orders }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ loading: false, error: err.message, orders: [] });
      });
    return () => controller.abort();
  }, []);

  if (state.loading) return <Loading className="min-h-[24rem]" />;
  if (state.error) return <ErrorState message={state.error} />;

  if (!state.orders.length) {
    return (
      <EmptyState
        title="Aucune commande pour le moment"
        message="Vos commandes apparaîtront ici, y compris celles passées sans compte avec ce numéro."
        actionLabel="Voir le catalogue"
        actionTo="/catalogue"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {state.orders.map((order) => (
        <li key={order._id} className="overflow-hidden rounded-sm border border-greige">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-greige bg-greige/20 px-4 py-3.5 sm:px-5">
            <div>
              <p className="font-display text-base tracking-[0.12em] text-ink">{order.numero}</p>
              <p className="mt-1 text-sm text-ink-muted">{formatDate(order.createdAt)}</p>
            </div>

            <Badge tone={order.statut === 'ANNULEE' ? 'muted' : 'gold'}>
              {STATUT_LABEL[order.statut] || order.statut}
            </Badge>
          </div>

          <ul className="flex flex-col divide-y divide-greige px-4 sm:px-5">
            {order.items.map((item) => (
              <li key={`${item.ref}-${item.couleur}`} className="flex justify-between gap-4 py-3 text-sm">
                <span className="min-w-0 flex-1 text-ink">
                  <span className="tabular-nums text-ink-muted">{item.quantite} x </span>
                  {item.nom}
                  <span className="block text-[12px] uppercase tracking-[0.12em] text-ink-muted">
                    Réf {item.ref}
                    {item.couleur ? ` · ${item.couleur}` : ''}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-ink">
                  {formatPrice(item.prix * item.quantite)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-greige px-4 py-4 sm:px-5">
            <span className="text-sm text-ink-muted">
              Total · livraison{' '}
              {order.modeLivraison === 'STOP_DESK' ? 'point de retrait' : 'à domicile'}
            </span>
            <span className="text-lg tabular-nums text-gold-deep">{formatPrice(order.total)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Favourites() {
  const [state, setState] = useState({ loading: true, error: null, products: [] });

  useEffect(() => {
    const controller = new AbortController();
    api
      .favourites(controller.signal)
      .then((products) => setState({ loading: false, error: null, products }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ loading: false, error: err.message, products: [] });
      });
    return () => controller.abort();
  }, []);

  if (state.loading) return <Loading className="min-h-[24rem]" />;
  if (state.error) return <ErrorState message={state.error} />;

  if (!state.products.length) {
    return (
      <EmptyState
        title="Aucun favori"
        message="Ajoutez des pièces à vos favoris depuis leur page produit pour les retrouver ici."
        actionLabel="Voir le catalogue"
        actionTo="/catalogue"
      />
    );
  }

  return <ProductGrid products={state.products} columns={3} />;
}

export function Addresses() {
  const { user, setUser } = useAuth();
  const [wilayas, setWilayas] = useState([]);
  const [form, setForm] = useState({ libelle: '', wilayaId: '', commune: '', adresse: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    api
      .wilayas(controller.signal)
      .then(setWilayas)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  async function addAddress(e) {
    e.preventDefault();
    setError(null);
    try {
      const updated = await api.addAddress(form);
      setUser(updated);
      setForm({ libelle: '', wilayaId: '', commune: '', adresse: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeAddress(id) {
    try {
      setUser(await api.deleteAddress(id));
    } catch (err) {
      setError(err.message);
    }
  }

  const wilayaName = (id) => wilayas.find((w) => String(w._id) === String(id))?.nom || '';

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel title="Vos adresses" description="Elles préremplissent le formulaire de commande.">
        {user?.adresses?.length ? (
          <ul className="flex flex-col gap-3">
            {user.adresses.map((address) => (
              <li key={address._id} className="rounded-sm border border-greige p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-base text-ink">
                      {address.libelle}
                      {address.isDefault ? <Badge tone="gold">Par défaut</Badge> : null}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {address.adresse ? `${address.adresse}, ` : ''}
                      {address.commune}, {wilayaName(address.wilayaId)}
                    </p>
                  </div>

                  <Button
                    onClick={() => removeAddress(address._id)}
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                  >
                    Retirer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base leading-relaxed text-ink-muted">
            Aucune adresse enregistrée. Ajoutez-en une pour préremplir vos prochaines commandes.
          </p>
        )}
      </Panel>

      <Panel title="Ajouter une adresse">
        <form onSubmit={addAddress} noValidate className="flex flex-col gap-5">
          <Field
            label="Libellé"
            placeholder="Domicile, bureau..."
            value={form.libelle}
            onChange={(e) => setForm((p) => ({ ...p, libelle: e.target.value }))}
          />

          <Select
            label="Wilaya"
            required
            value={form.wilayaId}
            onChange={(e) => setForm((p) => ({ ...p, wilayaId: e.target.value }))}
          >
            <option value="">Choisissez votre wilaya</option>
            {wilayas.map((w) => (
              <option key={w._id} value={w._id}>
                {String(w.code).padStart(2, '0')} - {w.nom}
              </option>
            ))}
          </Select>

          <Field
            label="Commune"
            required
            value={form.commune}
            onChange={(e) => setForm((p) => ({ ...p, commune: e.target.value }))}
          />

          <Field
            label="Adresse"
            value={form.adresse}
            onChange={(e) => setForm((p) => ({ ...p, adresse: e.target.value }))}
            error={error}
          />

          <Button type="submit" variant="primary" size="md" className="self-start">
            Ajouter
          </Button>
        </form>
      </Panel>
    </div>
  );
}
