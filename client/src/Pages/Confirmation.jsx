import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';

import api from '../lib/api';
import { useSettings } from '../lib/settings';
import { formatPrice, formatPhone, toInternational } from '../lib/format';
import Button from '../Components/UI/Button';
import { Field } from '../Components/UI/Field';
import { Loading, EmptyState } from '../Components/UI/States';
import SectionDivider from '../Components/Brand/SectionDivider';

/**
 * Order confirmation, and order lookup.
 *
 * The order number and the shop's phone number are the two things on this page
 * that matter. A cash-on-delivery customer has no receipt, no card statement
 * and no email: the order number spoken over the phone is the entire paper
 * trail, so it is the largest thing on the screen.
 *
 * The same page doubles as "suivre ma commande": arriving without state shows a
 * lookup form that takes an order number plus the phone it was placed with.
 */

function OrderSummary({ order, settings, justPlaced }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
      {justPlaced ? (
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">
            <Check size={26} strokeWidth={1.5} />
          </span>

          <h1 className="mt-6 font-display text-xl tracking-[0.1em] text-ink sm:text-2xl">
            Merci, votre commande est enregistrée
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
            Nous vous appelons dans les prochaines heures pour confirmer avant l&apos;expédition.
          </p>
        </div>
      ) : (
        <h1 className="font-display text-xl tracking-[0.1em] text-ink sm:text-2xl">Votre commande</h1>
      )}

      {/* The number. Deliberately the loudest thing here. */}
      <div className="mt-8 rounded-sm border border-gold/50 px-5 py-6 text-center">
        <p className="text-[12px] uppercase tracking-[0.2em] text-ink-muted">Numéro de commande</p>
        <p className="mt-2 font-display text-2xl tracking-[0.14em] text-ink sm:text-3xl">{order.numero}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Notez-le. Il nous permet de retrouver votre commande immédiatement au téléphone.
        </p>
      </div>

      <div className="mt-8 rounded-sm border border-greige p-5">
        <h2 className="font-display text-base tracking-[0.12em] text-ink">Détail</h2>

        <ul className="mt-4 flex flex-col gap-3 border-b border-greige pb-4">
          {order.items.map((item) => (
            <li key={`${item.ref}-${item.couleur}`} className="flex justify-between gap-4">
              <span className="min-w-0 flex-1">
                <span className="block text-base leading-snug text-ink">{item.nom}</span>
                <span className="text-[12px] uppercase tracking-[0.12em] text-ink-muted">
                  Réf {item.ref} · {item.quantite} x {formatPrice(item.prix)}
                  {item.couleur ? ` · ${item.couleur}` : ''}
                </span>
              </span>
              <span className="shrink-0 text-base tabular-nums text-ink">
                {formatPrice(item.prix * item.quantite)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 flex flex-col gap-2.5">
          <div className="flex justify-between">
            <dt className="text-base text-ink-muted">Sous-total</dt>
            <dd className="text-base tabular-nums text-ink">{formatPrice(order.sousTotal)}</dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-base text-ink-muted">
              Livraison ({order.modeLivraison === 'STOP_DESK' ? 'point de retrait' : 'à domicile'})
            </dt>
            <dd className="text-base tabular-nums text-ink">{formatPrice(order.fraisLivraison)}</dd>
          </div>

          <div className="flex justify-between border-t border-greige pt-3">
            <dt className="font-display text-base tracking-[0.1em] text-ink">À payer à la livraison</dt>
            <dd className="text-xl tabular-nums text-gold-deep">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 rounded-sm border border-greige p-5">
        <h2 className="font-display text-base tracking-[0.12em] text-ink">Livraison</h2>
        <address className="mt-3 not-italic text-base leading-relaxed text-ink">
          {order.clientNom}
          <br />
          <span className="tabular-nums">{formatPhone(order.clientTelephone)}</span>
          <br />
          {order.adresse ? (
            <>
              {order.adresse}
              <br />
            </>
          ) : null}
          {order.commune}, {order.wilayaNom}
        </address>
      </div>

      <SectionDivider className="mt-12" />

      <div className="mt-10 flex flex-col items-center gap-4 text-center">
        <p className="text-base text-ink-muted">Une question sur cette commande ?</p>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button href={`tel:+${toInternational(settings.telephone)}`} variant="primary" size="md">
            {formatPhone(settings.telephone)}
          </Button>
          <Button to="/catalogue" variant="secondary" size="md">
            Continuer mes achats
          </Button>
        </div>
      </div>
    </div>
  );
}

function LookupForm({ onFound }) {
  const [numero, setNumero] = useState('');
  const [telephone, setTelephone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const order = await api.lookupOrder({ numero, telephone });
      onFound(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-20 pt-12 sm:px-6">
      <h1 className="font-display text-xl tracking-[0.1em] text-ink">Suivre ma commande</h1>
      <p className="mt-3 text-base leading-relaxed text-ink-muted">
        Entrez votre numéro de commande et le téléphone utilisé lors de la commande.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <Field
          label="Numéro de commande"
          required
          placeholder="EVH-2026-0001"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />

        <Field
          label="Téléphone"
          required
          type="tel"
          inputMode="tel"
          placeholder="0X XX XX XX XX"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          error={error}
        />

        <Button type="submit" variant="primary" size="lg" full disabled={loading}>
          {loading ? 'Recherche' : 'Retrouver ma commande'}
        </Button>
      </form>
    </div>
  );
}

export default function Confirmation() {
  const location = useLocation();
  const [params] = useSearchParams();
  const settings = useSettings();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(false);

  const justPlaced = Boolean(location.state?.order);

  // Support a shareable link: /commande/confirmation?numero=...&telephone=...
  useEffect(() => {
    const numero = params.get('numero');
    const telephone = params.get('telephone');
    if (order || !numero || !telephone) return;

    setLoading(true);
    api
      .lookupOrder({ numero, telephone })
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params, order]);

  if (loading) return <Loading label="Recherche de la commande" />;
  if (order) return <OrderSummary order={order} settings={settings} justPlaced={justPlaced} />;

  return <LookupForm onFound={setOrder} />;
}
