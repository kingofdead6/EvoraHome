import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../../lib/api';
import { formatPriceShort, formatDateTime, formatPhone } from '../../lib/format';
import { PageHeader, Metric, Panel, TableWrap, Th, Td } from './AdminUI';
import { Loading, ErrorState } from '../../Components/UI/States';
import Badge from '../../Components/UI/Badge';

const STATUT_LABEL = {
  NOUVELLE: 'Nouvelle',
  CONFIRMEE: 'Confirmée',
  EN_PREPARATION: 'En préparation',
  EXPEDIEE: 'Expédiée',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
};

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    const controller = new AbortController();
    api
      .admin.dashboard(controller.signal)
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ loading: false, error: err.message, data: null });
      });
    return () => controller.abort();
  }, []);

  if (state.loading) return <Loading />;
  if (state.error) return <ErrorState message={state.error} />;

  const d = state.data;

  return (
    <>
      <PageHeader title="Tableau de bord" description={formatDateTime(new Date())} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Commandes aujourd'hui" value={d.commandesAujourdhui} />
        <Metric
          label="Nouvelles à traiter"
          value={d.nouvellesCommandes}
          hint={d.nouvellesCommandes > 0 ? 'En attente de confirmation' : 'Rien en attente'}
        />
        <Metric
          label="Revenus ce mois"
          value={formatPriceShort(d.revenusMois)}
          hint={`${d.commandesLivreesMois} commande${d.commandesLivreesMois > 1 ? 's' : ''} livrée${
            d.commandesLivreesMois > 1 ? 's' : ''
          }`}
        />
        <Metric
          label="En rupture"
          value={d.enRupture.length}
          hint={d.messagesNonLus > 0 ? `${d.messagesNonLus} message(s) non lu(s)` : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Dernières commandes">
          {d.recentes.length === 0 ? (
            <p className="text-sm text-ink-muted">Aucune commande pour le moment.</p>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Numéro</Th>
                  <Th>Client</Th>
                  <Th>Wilaya</Th>
                  <Th className="text-right">Total</Th>
                  <Th>Statut</Th>
                </tr>
              </thead>
              <tbody>
                {d.recentes.map((order) => (
                  <tr key={order._id}>
                    <Td>
                      <Link
                        to={`/admin/commandes?q=${order.numero}`}
                        className="tabular-nums underline decoration-gold underline-offset-4"
                      >
                        {order.numero}
                      </Link>
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
                    <Td>{order.wilayaNom}</Td>
                    <Td className="whitespace-nowrap text-right tabular-nums">
                      {formatPriceShort(order.total)}
                    </Td>
                    <Td>
                      <Badge tone={order.statut === 'ANNULEE' ? 'muted' : 'neutral'}>
                        {STATUT_LABEL[order.statut]}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>

        <Panel title="Ruptures de stock">
          {d.enRupture.length === 0 ? (
            <p className="text-sm text-ink-muted">Aucun produit en rupture.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-greige">
              {d.enRupture.map((product) => (
                <li key={product._id} className="flex items-start justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-sm leading-snug text-ink">{product.nom}</span>
                    <span className="text-[12px] uppercase tracking-[0.12em] text-ink-muted">
                      Réf {product.ref}
                    </span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-sm tabular-nums text-ink-muted">
                    {formatPriceShort(product.prix)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <Link
            to="/admin/produits?disponibilite=RUPTURE"
            className="mt-4 inline-flex min-h-[36px] items-center text-sm underline decoration-gold underline-offset-4"
          >
            Gérer les produits
          </Link>
        </Panel>
      </div>
    </>
  );
}
