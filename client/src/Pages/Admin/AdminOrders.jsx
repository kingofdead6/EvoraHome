import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Printer, X } from 'lucide-react';

import api from '../../lib/api';
import { formatPrice, formatPriceShort, formatDateTime, formatPhone } from '../../lib/format';
import { useSettings } from '../../lib/settings';

import { PageHeader, Panel, TableWrap, Th, Td, AdminTextArea, StatusLine } from './AdminUI';
import Button from '../../Components/UI/Button';
import Badge from '../../Components/UI/Badge';
import { Loading, ErrorState, EmptyState } from '../../Components/UI/States';

/**
 * Orders.
 *
 * The status buttons only ever offer legal transitions, mirroring the same
 * table the server enforces. Offering "Livrée" on a cancelled order and then
 * rejecting the click is worse than not offering it.
 */

const STATUTS = ['NOUVELLE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE'];

const STATUT_LABEL = {
  NOUVELLE: 'Nouvelle',
  CONFIRMEE: 'Confirmée',
  EN_PREPARATION: 'En préparation',
  EXPEDIEE: 'Expédiée',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
};

const TRANSITIONS = {
  NOUVELLE: ['CONFIRMEE', 'ANNULEE'],
  CONFIRMEE: ['EN_PREPARATION', 'ANNULEE'],
  EN_PREPARATION: ['EXPEDIEE', 'ANNULEE'],
  EXPEDIEE: ['LIVREE', 'ANNULEE'],
  LIVREE: [],
  ANNULEE: [],
};

/**
 * The delivery slip. Rendered into a new window and printed.
 *
 * Built as a standalone document rather than with a print stylesheet on the
 * app, because the driver's copy needs nothing from this page and a print
 * stylesheet that hides everything else is a stylesheet nobody maintains.
 */
function printSlip(order, settings) {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td>${item.ref}</td>
          <td>${item.nom}${item.couleur ? ` (${item.couleur})` : ''}</td>
          <td class="num">${item.quantite}</td>
          <td class="num">${formatPrice(item.prix)}</td>
          <td class="num">${formatPrice(item.prix * item.quantite)}</td>
        </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<title>Bon de livraison ${order.numero}</title>
<style>
  @page { size: A5; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1F2320; margin: 0; font-size: 12px; line-height: 1.5; }
  h1 { font-size: 15px; letter-spacing: .16em; text-transform: uppercase; margin: 0; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #C0A062; padding-bottom: 10px; }
  .num-box { text-align: right; }
  .num-box strong { font-size: 17px; letter-spacing: .1em; display: block; }
  .muted { color: #6B7065; font-size: 11px; }
  section { margin-top: 14px; }
  h2 { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: #6B7065; margin: 0 0 5px; font-weight: normal; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { text-align: left; padding: 5px 4px; border-bottom: 1px solid #D8D1C5; }
  th { font-size: 9px; letter-spacing: .1em; text-transform: uppercase; color: #6B7065; font-weight: normal; }
  .num { text-align: right; white-space: nowrap; }
  .totals { margin-top: 10px; margin-left: auto; width: 58%; }
  .totals td { border: 0; padding: 3px 4px; }
  .totals tr:last-child td { border-top: 1px solid #C0A062; font-size: 14px; padding-top: 6px; }
  .sign { margin-top: 26px; display: flex; justify-content: space-between; gap: 24px; }
  .sign div { flex: 1; border-top: 1px solid #D8D1C5; padding-top: 5px; font-size: 10px; color: #6B7065; }
</style></head>
<body>
  <div class="head">
    <div>
      <h1>Evora Home</h1>
      <p class="muted" style="margin:4px 0 0">${settings.adresse || ''}<br>${formatPhone(settings.telephone) || ''}</p>
    </div>
    <div class="num-box">
      <span class="muted">Bon de livraison</span>
      <strong>${order.numero}</strong>
      <span class="muted">${formatDateTime(order.createdAt)}</span>
    </div>
  </div>

  <section>
    <h2>Destinataire</h2>
    <p style="margin:0">
      <strong>${order.clientNom}</strong><br>
      ${formatPhone(order.clientTelephone)}<br>
      ${order.adresse ? `${order.adresse}<br>` : ''}
      ${order.commune}, ${order.wilayaNom}<br>
      <span class="muted">${order.modeLivraison === 'STOP_DESK' ? 'Point de retrait' : 'Livraison à domicile'}</span>
    </p>
  </section>

  <section>
    <h2>Articles</h2>
    <table>
      <thead><tr><th>Réf</th><th>Désignation</th><th class="num">Qté</th><th class="num">Prix</th><th class="num">Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <table class="totals">
      <tr><td>Sous-total</td><td class="num">${formatPrice(order.sousTotal)}</td></tr>
      <tr><td>Livraison</td><td class="num">${formatPrice(order.fraisLivraison)}</td></tr>
      <tr><td><strong>À encaisser</strong></td><td class="num"><strong>${formatPrice(order.total)}</strong></td></tr>
    </table>
  </section>

  ${order.noteClient ? `<section><h2>Note du client</h2><p style="margin:0">${order.noteClient}</p></section>` : ''}

  <div class="sign">
    <div>Signature du livreur</div>
    <div>Signature du client</div>
  </div>
</body></html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) {
    // Popup blocked. Say so rather than failing silently.
    return false;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  // Give the document a tick to lay out before the print dialog measures it.
  setTimeout(() => win.print(), 250);
  return true;
}

function OrderDetail({ order, onClose, onStatusChange, settings }) {
  const [note, setNote] = useState(order.noteInterne || '');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const transitions = TRANSITIONS[order.statut] || [];

  async function changeStatus(statut) {
    setBusy(true);
    setStatus(null);
    try {
      const updated = await api.admin.setOrderStatus(order._id, statut);
      onStatusChange(updated);
      setStatus({ ok: true, message: `Statut : ${STATUT_LABEL[statut]}` });
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function saveNote() {
    setBusy(true);
    setStatus(null);
    try {
      const updated = await api.admin.setOrderNote(order._id, note);
      onStatusChange(updated);
      setStatus({ ok: true, message: 'Note enregistrée' });
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-forest/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Commande ${order.numero}`}
        className="flex w-full max-w-lg flex-col overflow-y-auto bg-cream"
      >
        <header className="sticky top-0 flex items-start justify-between gap-3 border-b border-greige bg-cream px-4 py-4">
          <div>
            <h2 className="font-display text-base tracking-[0.12em] text-ink">{order.numero}</h2>
            <p className="mt-1 text-[12px] text-ink-muted">{formatDateTime(order.createdAt)}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-ink-muted hover:text-ink"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex flex-col gap-5 px-4 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={order.statut === 'ANNULEE' ? 'muted' : 'neutral'}>
              {STATUT_LABEL[order.statut]}
            </Badge>
            <Badge tone="gold">
              {order.modeLivraison === 'STOP_DESK' ? 'Point de retrait' : 'À domicile'}
            </Badge>
          </div>

          {/* Client */}
          <section>
            <h3 className="text-[12px] uppercase tracking-[0.15em] text-ink-muted">Client</h3>
            <p className="mt-2 text-base leading-relaxed text-ink">
              {order.clientNom}
              <br />
              <a
                href={`tel:${order.clientTelephone}`}
                className="tabular-nums underline decoration-gold underline-offset-4"
              >
                {formatPhone(order.clientTelephone)}
              </a>
              {order.clientEmail ? (
                <>
                  <br />
                  {order.clientEmail}
                </>
              ) : null}
              <br />
              {order.adresse ? (
                <>
                  {order.adresse}
                  <br />
                </>
              ) : null}
              {order.commune}, {order.wilayaNom}
            </p>
          </section>

          {/* Items */}
          <section>
            <h3 className="text-[12px] uppercase tracking-[0.15em] text-ink-muted">Articles</h3>
            <ul className="mt-2 divide-y divide-greige border-y border-greige">
              {order.items.map((item) => (
                <li key={`${item.ref}-${item.couleur}`} className="flex justify-between gap-3 py-2.5">
                  <span className="min-w-0 flex-1 text-sm text-ink">
                    {item.quantite} x {item.nom}
                    <span className="mt-0.5 block text-[12px] uppercase tracking-[0.12em] text-ink-muted">
                      Réf {item.ref}
                      {item.couleur ? ` · ${item.couleur}` : ''}
                    </span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-sm tabular-nums text-ink">
                    {formatPrice(item.prix * item.quantite)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-3 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Sous-total</dt>
                <dd className="tabular-nums text-ink">{formatPrice(order.sousTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Livraison</dt>
                <dd className="tabular-nums text-ink">{formatPrice(order.fraisLivraison)}</dd>
              </div>
              <div className="flex justify-between border-t border-greige pt-2">
                <dt className="text-ink">À encaisser</dt>
                <dd className="text-base tabular-nums text-gold-deep">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          {order.noteClient ? (
            <section>
              <h3 className="text-[12px] uppercase tracking-[0.15em] text-ink-muted">Note du client</h3>
              <p className="mt-2 rounded-sm border border-greige bg-greige/25 px-3 py-2 text-sm text-ink">
                {order.noteClient}
              </p>
            </section>
          ) : null}

          {/* Status transitions */}
          <section>
            <h3 className="text-[12px] uppercase tracking-[0.15em] text-ink-muted">Statut</h3>

            {transitions.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                Cette commande est {STATUT_LABEL[order.statut].toLowerCase()}. Aucun changement possible.
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {transitions.map((statut) => (
                  <Button
                    key={statut}
                    onClick={() => changeStatus(statut)}
                    disabled={busy}
                    variant={statut === 'ANNULEE' ? 'danger' : 'primary'}
                    size="sm"
                  >
                    {STATUT_LABEL[statut]}
                  </Button>
                ))}
              </div>
            )}
          </section>

          {/* Internal note */}
          <section className="flex flex-col gap-2">
            <AdminTextArea
              label="Note interne"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Client rappelé, livraison reportée..."
            />
            <Button onClick={saveNote} disabled={busy} variant="secondary" size="sm" className="self-start">
              Enregistrer la note
            </Button>
          </section>

          <StatusLine status={status} />

          <Button
            onClick={() => {
              if (!printSlip(order, settings)) {
                setStatus({
                  ok: false,
                  message: "Le navigateur a bloqué la fenêtre d'impression. Autorisez les popups.",
                });
              }
            }}
            variant="secondary"
            size="md"
          >
            <Printer size={16} strokeWidth={1.5} />
            Imprimer le bon de livraison
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const settings = useSettings();

  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [selected, setSelected] = useState(null);

  const statut = params.get('statut') || 'TOUTES';
  const q = params.get('q') || '';

  const load = useCallback(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true }));

    api
      .admin.orders({ statut, q }, controller.signal)
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ loading: false, error: err.message, data: null });
      });

    return () => controller.abort();
  }, [statut, q]);

  useEffect(() => load(), [load]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'TOUTES') next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const onStatusChange = (updated) => {
    setSelected(updated);
    setState((s) => ({
      ...s,
      data: s.data
        ? { ...s.data, orders: s.data.orders.map((o) => (o._id === updated._id ? updated : o)) }
        : s.data,
    }));
  };

  if (state.loading && !state.data) return <Loading />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const { orders, total, counts } = state.data;

  return (
    <>
      <PageHeader title="Commandes" description={`${total} commande${total > 1 ? 's' : ''}`} />

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex w-max gap-1.5">
            {['TOUTES', ...STATUTS].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setParam('statut', value)}
                className={`flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-sm border px-3 text-[12px] uppercase tracking-[0.1em] transition-colors ${
                  statut === value ? 'border-gold bg-olive text-cream' : 'border-greige text-ink hover:border-sand'
                }`}
              >
                {value === 'TOUTES' ? 'Toutes' : STATUT_LABEL[value]}
                {value !== 'TOUTES' && counts?.[value] ? (
                  <span className="tabular-nums opacity-70">{counts[value]}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <input
          type="search"
          value={q}
          onChange={(e) => setParam('q', e.target.value)}
          placeholder="Numéro, nom ou téléphone"
          aria-label="Rechercher une commande"
          className="min-h-[44px] w-full max-w-sm rounded-sm border border-greige bg-cream px-3 text-base text-ink focus:border-gold focus:outline-none"
        />
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Aucune commande"
          message={q || statut !== 'TOUTES' ? 'Aucun résultat pour ce filtre.' : 'Les commandes apparaîtront ici.'}
        />
      ) : (
        <Panel>
          <TableWrap>
            <thead>
              <tr>
                <Th>Numéro</Th>
                <Th>Client</Th>
                <Th>Livraison</Th>
                <Th className="text-right">Total</Th>
                <Th>Statut</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <Td>
                    <span className="tabular-nums">{order.numero}</span>
                    <span className="mt-0.5 block text-[12px] text-ink-muted">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </Td>
                  <Td>
                    {order.clientNom}
                    <span className="mt-0.5 block tabular-nums text-[12px] text-ink-muted">
                      {formatPhone(order.clientTelephone)}
                    </span>
                  </Td>
                  <Td>
                    {order.wilayaNom}
                    <span className="mt-0.5 block text-[12px] text-ink-muted">
                      {order.commune} · {order.modeLivraison === 'STOP_DESK' ? 'Retrait' : 'Domicile'}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-right tabular-nums">
                    {formatPriceShort(order.total)}
                  </Td>
                  <Td>
                    <Badge tone={order.statut === 'ANNULEE' ? 'muted' : 'neutral'}>
                      {STATUT_LABEL[order.statut]}
                    </Badge>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => setSelected(order)}
                      className="min-h-[36px] whitespace-nowrap text-sm underline decoration-gold underline-offset-4"
                    >
                      Ouvrir
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Panel>
      )}

      {selected ? (
        <OrderDetail
          order={selected}
          settings={settings}
          onClose={() => setSelected(null)}
          onStatusChange={onStatusChange}
        />
      ) : null}
    </>
  );
}
