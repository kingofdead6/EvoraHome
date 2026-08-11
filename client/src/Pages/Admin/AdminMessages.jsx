import { useCallback, useEffect, useState } from 'react';

import api from '../../lib/api';
import { formatDateTime, formatPhone } from '../../lib/format';
import { PageHeader, Panel, StatusLine } from './AdminUI';
import Button from '../../Components/UI/Button';
import Badge from '../../Components/UI/Badge';
import { Loading, ErrorState, EmptyState } from '../../Components/UI/States';

const STATUT_LABEL = { NOUVEAU: 'Nouveau', LU: 'Lu', TRAITE: 'Traité' };

export default function AdminMessages() {
  const [state, setState] = useState({ loading: true, error: null, messages: [] });
  const [filter, setFilter] = useState('TOUS');
  const [status, setStatus] = useState(null);

  const load = useCallback(() => {
    const controller = new AbortController();
    api
      .admin.messages({ statut: filter }, controller.signal)
      .then((messages) => setState({ loading: false, error: null, messages }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ loading: false, error: err.message, messages: [] });
      });
    return () => controller.abort();
  }, [filter]);

  useEffect(() => load(), [load]);

  async function setMessageStatus(message, statut) {
    try {
      const updated = await api.admin.setMessageStatus(message._id, statut);
      setState((s) => ({
        ...s,
        messages: s.messages.map((m) => (m._id === updated._id ? updated : m)),
      }));
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    }
  }

  async function remove(message) {
    try {
      await api.admin.deleteMessage(message._id);
      load();
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    }
  }

  if (state.loading) return <Loading />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  return (
    <>
      <PageHeader title="Messages" description="Formulaire de contact de la boutique." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {['TOUS', 'NOUVEAU', 'LU', 'TRAITE'].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`flex min-h-[40px] items-center rounded-sm border px-3 text-[12px] uppercase tracking-[0.1em] transition-colors ${
              filter === value ? 'border-gold bg-olive text-cream' : 'border-greige text-ink hover:border-sand'
            }`}
          >
            {value === 'TOUS' ? 'Tous' : STATUT_LABEL[value]}
          </button>
        ))}
      </div>

      <StatusLine status={status} />

      {state.messages.length === 0 ? (
        <EmptyState title="Aucun message" message="Les messages du formulaire de contact arrivent ici." />
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {state.messages.map((message) => (
            <Panel key={message._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base text-ink">
                    {message.nom}
                    <a
                      href={`tel:${message.telephone}`}
                      className="ml-3 tabular-nums text-sm underline decoration-gold underline-offset-4"
                    >
                      {formatPhone(message.telephone)}
                    </a>
                  </p>
                  <p className="mt-1 text-[12px] text-ink-muted">
                    {formatDateTime(message.createdAt)}
                    {message.email ? ` · ${message.email}` : ''}
                  </p>
                </div>

                <Badge tone={message.statut === 'NOUVEAU' ? 'gold' : 'neutral'}>
                  {STATUT_LABEL[message.statut]}
                </Badge>
              </div>

              {message.sujet ? (
                <p className="mt-3 text-sm uppercase tracking-[0.1em] text-ink-muted">{message.sujet}</p>
              ) : null}

              <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-ink">{message.message}</p>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-greige pt-3">
                {message.statut !== 'LU' ? (
                  <Button onClick={() => setMessageStatus(message, 'LU')} variant="secondary" size="sm">
                    Marquer comme lu
                  </Button>
                ) : null}
                {message.statut !== 'TRAITE' ? (
                  <Button onClick={() => setMessageStatus(message, 'TRAITE')} variant="primary" size="sm">
                    Marquer comme traité
                  </Button>
                ) : null}
                <Button onClick={() => remove(message)} variant="danger" size="sm">
                  Supprimer
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
