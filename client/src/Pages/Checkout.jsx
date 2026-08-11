import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import api from '../lib/api';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { formatPrice } from '../lib/format';
import { isValidPhoneClient } from '../lib/validate';

import { Field, TextArea, Select, RadioCards } from '../Components/UI/Field';
import Button from '../Components/UI/Button';
import ProductImage from '../Components/UI/ProductImage';
import { EmptyState } from '../Components/UI/States';

/**
 * Checkout. One page, one column on a phone.
 *
 * Guest checkout is the default and there is no account gate anywhere on this
 * page. A logged-in customer gets their name, phone and default address
 * pre-filled, which is the only thing an account buys them here.
 *
 * Payment is cash on delivery. There is no gateway, no card field, no redirect.
 */

const EMPTY = {
  clientNom: '',
  clientTelephone: '',
  clientEmail: '',
  wilayaId: '',
  commune: '',
  adresse: '',
  modeLivraison: 'DOMICILE',
  noteClient: '',
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, sousTotal, clear } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [wilayas, setWilayas] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Set when a submit fails validation, consumed by the effect below.
  const focusFirstError = useRef(false);

  /**
   * Move focus to the first invalid field after a failed submit.
   *
   * This has to run in an effect rather than inline after setErrors:
   * `aria-invalid` does not exist in the DOM until React has re-rendered, so
   * querying for it inside the submit handler always found nothing and left
   * the customer to hunt for the red text on a long form.
   */
  useEffect(() => {
    if (!focusFirstError.current) return;
    focusFirstError.current = false;

    const field = document.querySelector('[aria-invalid="true"]');
    if (!field) return;
    field.focus();
    field.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [errors]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .wilayas(controller.signal)
      .then(setWilayas)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Pre-fill from the account, once it has loaded.
  useEffect(() => {
    if (!user) return;
    const defaultAddress = user.adresses?.find((a) => a.isDefault) || user.adresses?.[0];

    setForm((prev) => ({
      ...prev,
      clientNom: prev.clientNom || user.nom || '',
      clientTelephone: prev.clientTelephone || user.telephone || '',
      clientEmail: prev.clientEmail || user.email || '',
      wilayaId: prev.wilayaId || defaultAddress?.wilayaId || '',
      commune: prev.commune || defaultAddress?.commune || '',
      adresse: prev.adresse || defaultAddress?.adresse || '',
    }));
  }, [user]);

  const wilaya = useMemo(
    () => wilayas.find((w) => String(w._id) === String(form.wilayaId)),
    [wilayas, form.wilayaId]
  );

  const deliverable = wilaya ? wilaya.isActive : null;
  const fraisLivraison = wilaya && wilaya.isActive
    ? form.modeLivraison === 'STOP_DESK'
      ? wilaya.fraisStopDesk
      : wilaya.fraisDomicile
    : null;

  const total = fraisLivraison === null ? sousTotal : sousTotal + fraisLivraison;

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  function validate() {
    const next = {};

    if (!form.clientNom.trim()) next.clientNom = 'Votre nom est requis';
    if (!isValidPhoneClient(form.clientTelephone)) {
      next.clientTelephone = 'Numéro invalide. Format : 05, 06 ou 07 suivi de 8 chiffres';
    }
    if (!form.wilayaId) next.wilayaId = 'Choisissez votre wilaya';
    else if (wilaya && !wilaya.isActive) next.wilayaId = `Nous ne livrons pas encore à ${wilaya.nom}`;
    if (!form.commune.trim()) next.commune = 'La commune est requise';
    if (form.modeLivraison === 'DOMICILE' && !form.adresse.trim()) {
      next.adresse = 'Adresse requise pour une livraison à domicile';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      focusFirstError.current = true;
      return;
    }

    setSubmitting(true);

    try {
      const order = await api.createOrder({
        ...form,
        items: items.map((l) => ({
          productId: l.productId,
          quantite: l.quantite,
          couleur: l.couleur,
        })),
      });

      // Clear only after the server confirms. A failed request that emptied the
      // cart would leave the customer with nothing and no order.
      clear();
      navigate('/commande/confirmation', {
        state: { order },
        replace: true,
      });
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Votre panier est vide"
        message="Ajoutez au moins une pièce avant de passer commande."
        actionLabel="Voir le catalogue"
        actionTo="/catalogue"
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-10">
      <h1 className="font-display text-xl tracking-[0.12em] text-ink sm:text-2xl">Votre commande</h1>
      <p className="mt-3 max-w-lg text-base text-ink-muted">
        Paiement à la livraison. Nous vous appelons pour confirmer avant l&apos;expédition.
      </p>

      {submitError ? (
        <div
          role="alert"
          className="mt-6 rounded-sm border border-[#8C2F1F]/40 bg-[#8C2F1F]/5 px-4 py-3 text-base text-[#8C2F1F]"
        >
          {submitError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <div className="flex flex-col gap-8">
          {/* Contact */}
          <fieldset className="flex flex-col gap-5 border-0 p-0">
            <legend className="mb-1 font-display text-base tracking-[0.12em] text-ink">
              Vos coordonnées
            </legend>

            <Field
              label="Nom et prénom"
              required
              autoComplete="name"
              value={form.clientNom}
              onChange={set('clientNom')}
              error={errors.clientNom}
            />

            <Field
              label="Téléphone"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0X XX XX XX XX"
              value={form.clientTelephone}
              onChange={set('clientTelephone')}
              error={errors.clientTelephone}
              hint="C'est le numéro sur lequel nous vous appellerons pour confirmer."
            />

            <Field
              label="Email (facultatif)"
              type="email"
              autoComplete="email"
              value={form.clientEmail}
              onChange={set('clientEmail')}
              error={errors.clientEmail}
            />
          </fieldset>

          {/* Delivery */}
          <fieldset className="flex flex-col gap-5 border-0 border-t border-greige p-0 pt-8">
            <legend className="mb-1 font-display text-base tracking-[0.12em] text-ink">Livraison</legend>

            <Select
              label="Wilaya"
              required
              value={form.wilayaId}
              onChange={set('wilayaId')}
              error={errors.wilayaId}
            >
              <option value="">Choisissez votre wilaya</option>
              {wilayas.map((w) => (
                <option key={w._id} value={w._id}>
                  {String(w.code).padStart(2, '0')} - {w.nom}
                  {w.isActive ? '' : ' (livraison non disponible)'}
                </option>
              ))}
            </Select>

            <RadioCards
              label="Mode de livraison"
              name="modeLivraison"
              value={form.modeLivraison}
              onChange={(value) => setForm((prev) => ({ ...prev, modeLivraison: value }))}
              options={[
                {
                  value: 'DOMICILE',
                  label: 'À domicile',
                  hint: wilaya?.isActive ? formatPrice(wilaya.fraisDomicile) : 'Livrée chez vous',
                },
                {
                  value: 'STOP_DESK',
                  label: 'Point de retrait',
                  hint: wilaya?.isActive ? formatPrice(wilaya.fraisStopDesk) : 'À récupérer sur place',
                },
              ]}
            />

            <Field
              label="Commune"
              required
              autoComplete="address-level2"
              value={form.commune}
              onChange={set('commune')}
              error={errors.commune}
            />

            {form.modeLivraison === 'DOMICILE' ? (
              <TextArea
                label="Adresse"
                required
                rows={3}
                autoComplete="street-address"
                placeholder="Cité, bâtiment, étage, point de repère"
                value={form.adresse}
                onChange={set('adresse')}
                error={errors.adresse}
                hint="Un point de repère aide beaucoup le livreur."
              />
            ) : null}

            <TextArea
              label="Note pour nous (facultatif)"
              rows={2}
              value={form.noteClient}
              onChange={set('noteClient')}
              placeholder="Horaire de livraison souhaité, précision sur le coloris..."
            />
          </fieldset>

          {!user ? (
            <p className="text-sm text-ink-muted">
              Vous commandez sans compte, c&apos;est parfait.{' '}
              <Link to="/connexion" className="underline decoration-gold underline-offset-4">
                Vous avez déjà un compte ?
              </Link>
            </p>
          ) : null}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-sm border border-greige p-5">
            <h2 className="font-display text-base tracking-[0.12em] text-ink">Votre commande</h2>

            <ul className="mt-5 flex flex-col gap-4">
              {items.map((line) => (
                <li key={`${line.productId}-${line.couleur}`} className="flex gap-3">
                  <div className="w-14 shrink-0">
                    <ProductImage src={line.image} alt="" sizes="56px" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="line-clamp-2 text-sm leading-snug text-ink">{line.nom}</span>
                    <span className="text-[12px] uppercase tracking-[0.12em] text-ink-muted">
                      {line.quantite} x {formatPrice(line.prix)}
                      {line.couleur ? ` · ${line.couleur}` : ''}
                    </span>
                  </div>

                  <span className="shrink-0 text-sm tabular-nums text-ink">
                    {formatPrice(line.prix * line.quantite)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 flex flex-col gap-3 border-t border-greige pt-5">
              <div className="flex items-baseline justify-between">
                <dt className="text-base text-ink-muted">Sous-total</dt>
                <dd className="text-base tabular-nums text-ink">{formatPrice(sousTotal)}</dd>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-base text-ink-muted">Livraison</dt>
                <dd className="text-right text-base tabular-nums text-ink">
                  {fraisLivraison !== null ? (
                    formatPrice(fraisLivraison)
                  ) : (
                    <span className="text-sm text-ink-muted">Choisissez une wilaya</span>
                  )}
                </dd>
              </div>

              <div className="flex items-baseline justify-between border-t border-greige pt-3">
                <dt className="font-display text-base tracking-[0.1em] text-ink">Total</dt>
                <dd className="text-xl tabular-nums text-gold-deep">{formatPrice(total)}</dd>
              </div>
            </dl>

            {deliverable === false ? (
              <p
                role="alert"
                className="mt-4 rounded-sm border border-greige bg-greige/25 px-3 py-3 text-sm leading-relaxed text-ink"
              >
                Nous ne livrons pas encore à {wilaya.nom}. Appelez-nous, nous trouverons une solution.
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              full
              className="mt-5"
              disabled={submitting || deliverable === false}
            >
              {submitting ? 'Envoi en cours' : 'Confirmer la commande'}
            </Button>

            <p className="mt-4 text-center text-sm leading-relaxed text-ink-muted">
              Vous payez {formatPrice(total)} à la réception. Rien n&apos;est prélevé maintenant.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
