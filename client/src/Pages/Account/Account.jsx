import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatPrice, formatDate, formatPhone } from '../../lib/format';
import { EASE_OUT, gridContainer, gridItem, useReducedMotion } from '../../lib/motion';

import ProductGrid from '../../Components/Products/ProductGrid';
import Button from '../../Components/UI/Button';
import Badge from '../../Components/UI/Badge';
import { Field, Select } from '../../Components/UI/Field';
import { Loading, EmptyState, ErrorState } from '../../Components/UI/States';
import OrderTracker from '../../Components/Orders/OrderTracker';

/**
 * The account area. Layout plus the four sub-pages.
 *
 * Everything here is a convenience. None of it is required to buy anything, and
 * no page in this tree ever appears in a checkout flow.
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
  { to: '/compte', label: 'Mon profil', end: true },
  { to: '/compte/commandes', label: 'Mes commandes' },
  { to: '/compte/favoris', label: 'Mes favoris' },
  { to: '/compte/adresses', label: 'Mes adresses' },
];

export function AccountLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const reduced = useReducedMotion();

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl tracking-[0.1em] text-ink sm:text-2xl">Mon compte</h1>
          <p className="mt-2 text-base text-ink-muted">
            {user?.nom} · <span className="tabular-nums">{formatPhone(user?.telephone)}</span>
            {user?.email ? ` · ${user.email}` : ''}
          </p>
        </div>

        <Button
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          variant="secondary"
          size="sm"
        >
          Se déconnecter
        </Button>
      </header>

      <nav aria-label="Sections du compte" className="-mx-4 mt-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2 border-b border-greige pb-0">
          {TABS.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center whitespace-nowrap border-b-2 px-3 text-sm uppercase tracking-[0.1em] transition-colors duration-200 ${
                    isActive ? 'border-gold text-ink' : 'border-transparent text-ink-muted hover:text-ink'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/*
        Only the panel animates. The header and the tab bar above it are part of
        the frame, not the content: re-running their entrance on every tab click
        would make the whole page twitch each time somebody looks at a second
        thing, which is exactly the kind of motion that stops reading as polish.

        Keyed on the pathname so switching tabs is what triggers the swap. `mode
        ="wait"` lets the outgoing panel finish before the incoming one starts,
        so the two never overlap and the column height only settles once.
      */}
      <div className="mt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={reduced ? false : { opacity: 0, transform: 'translateY(10px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={reduced ? undefined : { opacity: 0, transform: 'translateY(-6px)' }}
            transition={{ duration: 0.26, ease: EASE_OUT }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * A save confirmation or error.
 *
 * Fades and slides rather than appearing, because the message often lands
 * below the fold of the customer's attention: movement is what tells them the
 * button did anything at all.
 */
function StatusMessage({ status }) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {status ? (
        <motion.p
          key={status.message}
          role="status"
          initial={reduced ? false : { opacity: 0, transform: 'translateY(-4px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.24, ease: EASE_OUT }}
          className={`text-sm ${status.ok ? 'text-gold-deep' : 'text-[#8C2F1F]'}`}
        >
          {status.message}
        </motion.p>
      ) : null}
    </AnimatePresence>
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
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <form onSubmit={saveProfile} noValidate className="flex max-w-md flex-col gap-5">
        <h2 className="font-display text-base tracking-[0.12em] text-ink">Vos informations</h2>

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

        <div className="flex flex-col gap-2">
          <span className="text-sm uppercase tracking-[0.12em] text-ink-muted">Téléphone</span>
          <p className="text-base tabular-nums text-ink">{formatPhone(user?.telephone)}</p>
          <p className="text-sm text-ink-muted">
            Votre identifiant de connexion. Appelez-nous pour le modifier.
          </p>
        </div>

        <Button type="submit" variant="primary" size="md" className="self-start">
          Enregistrer
        </Button>

        <StatusMessage status={status} />
      </form>

      <form onSubmit={savePassword} noValidate className="flex max-w-md flex-col gap-5">
        <h2 className="font-display text-base tracking-[0.12em] text-ink">Mot de passe</h2>

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

        <StatusMessage status={passwordStatus} />
      </form>
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

  if (state.loading) return <Loading />;
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
    // Staggered so a long order history arrives as a list being dealt out
    // rather than as a wall appearing at once.
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={gridContainer}
      className="flex flex-col gap-4"
    >
      {state.orders.map((order) => (
        <motion.li
          key={order._id}
          variants={gridItem}
          className="rounded-sm border border-greige p-4 transition-colors duration-300 hover:border-sand sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-base tracking-[0.12em] text-ink">{order.numero}</p>
              <p className="mt-1 text-sm text-ink-muted">{formatDate(order.createdAt)}</p>
            </div>

            <Badge tone={order.statut === 'ANNULEE' ? 'muted' : 'neutral'}>
              {STATUT_LABEL[order.statut] || order.statut}
            </Badge>
          </div>

          {/* Where the order is now. The single most common reason a customer
              opens this page at all. */}
          <OrderTracker
            statut={order.statut}
            historique={order.historique}
            className="mt-4 border-t border-greige pt-4"
          />

          <ul className="mt-4 flex flex-col gap-2 border-t border-greige pt-4">
            {order.items.map((item) => (
              <li key={`${item.ref}-${item.couleur}`} className="flex justify-between gap-4 text-sm">
                <span className="min-w-0 flex-1 text-ink">
                  {item.quantite} x {item.nom}
                  <span className="text-ink-muted"> · Réf {item.ref}</span>
                </span>
                <span className="shrink-0 tabular-nums text-ink">
                  {formatPrice(item.prix * item.quantite)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-baseline justify-between border-t border-greige pt-4">
            <span className="text-base text-ink-muted">
              Total · livraison {order.modeLivraison === 'STOP_DESK' ? 'point de retrait' : 'à domicile'}
            </span>
            <span className="text-lg tabular-nums text-gold-deep">{formatPrice(order.total)}</span>
          </div>
        </motion.li>
      ))}
    </motion.ul>
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

  if (state.loading) return <Loading />;
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

  return <ProductGrid products={state.products} />;
}

export function Addresses() {
  const { user, setUser } = useAuth();
  const reduced = useReducedMotion();
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
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <h2 className="font-display text-base tracking-[0.12em] text-ink">Vos adresses</h2>

        {user?.adresses?.length ? (
          // AnimatePresence so a removed address collapses out instead of
          // vanishing between two paints, which otherwise leaves the customer
          // unsure whether the right one was deleted.
          <ul className="mt-5 flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {user.adresses.map((address) => (
                <motion.li
                  key={address._id}
                  layout
                  initial={reduced ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={reduced ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3 rounded-sm border border-greige p-4">
                    <div>
                      <p className="text-base text-ink">
                        {address.libelle}
                        {address.isDefault ? (
                          <Badge tone="gold" className="ml-2">
                            Par défaut
                          </Badge>
                        ) : null}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                        {address.adresse ? `${address.adresse}, ` : ''}
                        {address.commune}, {wilayaName(address.wilayaId)}
                      </p>
                    </div>

                    <Button onClick={() => removeAddress(address._id)} variant="ghost" size="sm">
                      Retirer
                    </Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <p className="mt-5 text-base text-ink-muted">
            Aucune adresse enregistrée. Ajoutez-en une pour préremplir vos prochaines commandes.
          </p>
        )}
      </div>

      <form onSubmit={addAddress} noValidate className="flex max-w-md flex-col gap-5">
        <h2 className="font-display text-base tracking-[0.12em] text-ink">Ajouter une adresse</h2>

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
    </div>
  );
}
