import { useCallback, useEffect, useMemo, useState } from 'react';

import api from '../../lib/api';
import { formatPriceShort } from '../../lib/format';
import { PageHeader, Panel, TableWrap, Th, Td, StatusLine } from './AdminUI';
import Button from '../../Components/UI/Button';
import { Loading, ErrorState } from '../../Components/UI/States';

/**
 * Delivery fees, one row per wilaya.
 *
 * Edited in place across the whole table and saved in a single request, because
 * the realistic job here is "raise every fee by 500 DA after a fuel increase",
 * not "change one wilaya". Unsaved rows are marked so nothing is lost silently.
 */
export default function AdminWilayas() {
  const [state, setState] = useState({ loading: true, error: null, wilayas: [] });
  const [edits, setEdits] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  const load = useCallback(() => {
    const controller = new AbortController();
    api
      .wilayas(controller.signal)
      .then((wilayas) => {
        setState({ loading: false, error: null, wilayas });
        setEdits({});
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ loading: false, error: err.message, wilayas: [] });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => load(), [load]);

  const setField = (id, key, value) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));

  const valueFor = (wilaya, key) => edits[wilaya._id]?.[key] ?? wilaya[key];
  const isDirty = (wilaya) => Boolean(edits[wilaya._id]);
  const dirtyCount = Object.keys(edits).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.wilayas;
    return state.wilayas.filter(
      (w) => w.nom.toLowerCase().includes(q) || String(w.code).padStart(2, '0').includes(q)
    );
  }, [state.wilayas, query]);

  async function save() {
    setSaving(true);
    setStatus(null);

    const payload = Object.entries(edits).map(([id, changes]) => ({ id, ...changes }));

    try {
      const updated = await api.admin.updateWilayas(payload);
      setState((s) => ({ ...s, wilayas: updated }));
      setEdits({});
      setStatus({ ok: true, message: `${payload.length} wilaya(s) enregistrée(s)` });
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (state.loading) return <Loading />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  return (
    <>
      <PageHeader
        title="Livraison"
        description="Frais par wilaya. Le client voit ces montants avant de confirmer sa commande."
      >
        <Button onClick={save} variant="primary" size="sm" disabled={saving || dirtyCount === 0}>
          {saving ? 'Enregistrement' : dirtyCount ? `Enregistrer (${dirtyCount})` : 'Enregistrer'}
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrer par nom ou code"
          aria-label="Filtrer les wilayas"
          className="min-h-[44px] w-full max-w-xs rounded-sm border border-greige bg-cream px-3 text-base text-ink focus:border-gold focus:outline-none"
        />
        <StatusLine status={status} />
      </div>

      <Panel>
        <TableWrap>
          <thead>
            <tr>
              <Th>Wilaya</Th>
              <Th className="text-right">Domicile (DA)</Th>
              <Th className="text-right">Point de retrait (DA)</Th>
              <Th>Livrée</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((wilaya) => (
              <tr key={wilaya._id} className={isDirty(wilaya) ? 'bg-greige/25' : undefined}>
                <Td className="whitespace-nowrap">
                  <span className="tabular-nums text-ink-muted">
                    {String(wilaya.code).padStart(2, '0')}
                  </span>{' '}
                  {wilaya.nom}
                  {isDirty(wilaya) ? (
                    <span className="ml-2 text-[11px] uppercase tracking-[0.1em] text-gold-deep">
                      modifiée
                    </span>
                  ) : null}
                </Td>

                <Td className="text-right">
                  <label>
                    <span className="sr-only">Frais à domicile pour {wilaya.nom}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={valueFor(wilaya, 'fraisDomicile')}
                      onChange={(e) => setField(wilaya._id, 'fraisDomicile', Number(e.target.value))}
                      className="min-h-[40px] w-28 rounded-sm border border-greige bg-cream px-2 text-right text-base tabular-nums text-ink focus:border-gold focus:outline-none"
                    />
                  </label>
                </Td>

                <Td className="text-right">
                  <label>
                    <span className="sr-only">Frais point de retrait pour {wilaya.nom}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={valueFor(wilaya, 'fraisStopDesk')}
                      onChange={(e) => setField(wilaya._id, 'fraisStopDesk', Number(e.target.value))}
                      className="min-h-[40px] w-28 rounded-sm border border-greige bg-cream px-2 text-right text-base tabular-nums text-ink focus:border-gold focus:outline-none"
                    />
                  </label>
                </Td>

                <Td>
                  <label className="flex min-h-[40px] items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(valueFor(wilaya, 'isActive'))}
                      onChange={(e) => setField(wilaya._id, 'isActive', e.target.checked)}
                      className="h-4 w-4 accent-[#3E4638]"
                    />
                    <span className="sr-only">Livrer à {wilaya.nom}</span>
                  </label>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Panel>

      <p className="mt-4 max-w-prose text-[13px] leading-relaxed text-ink-muted">
        Décocher une wilaya la laisse visible au moment de la commande, avec un message invitant le
        client à vous appeler. C&apos;est volontaire : retirer sa wilaya de la liste donne au client
        l&apos;impression que le site est cassé.
      </p>
    </>
  );
}
