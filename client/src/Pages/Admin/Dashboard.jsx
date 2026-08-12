import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../../lib/api';
import { formatPriceShort, formatDateTime, formatPhone, toInternational } from '../../lib/format';
import {
  PageHeader,
  Metric,
  Panel,
  TableWrap,
  Th,
  Td,
  CardList,
  Card,
  CardRow,
} from './AdminUI';
import { Loading, ErrorState } from '../../Components/UI/States';
import Badge from '../../Components/UI/Badge';
import { TrendChart, StatusChart, CategoryChart } from './Charts';

const STATUT_LABEL = {
  NOUVELLE: 'Nouvelle',
  CONFIRMEE: 'Confirmée',
  EN_PREPARATION: 'En préparation',
  EXPEDIEE: 'Expédiée',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
};

/**
 * The revenue subtitle: how many orders made it, and how that compares with the
 * same figure last month.
 *
 * The comparison is skipped entirely when last month was zero. "+100%" against
 * a zero base is arithmetically true and completely uninformative, and this
 * shop is new enough that the zero case is the common one.
 */
function revenueHint(d) {
  const n = d.commandesLivreesMois;
  const livrees = `${n} commande${n > 1 ? 's' : ''} livrée${n > 1 ? 's' : ''}`;

  const prev = d.revenusMoisPrecedent;
  if (!prev) return livrees;

  const delta = Math.round(((d.revenusMois - prev) / prev) * 100);
  const sign = delta > 0 ? '+' : '';
  return `${livrees} · ${sign}${delta}% vs mois dernier`;
}

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

      {/* Two-up from the narrowest screen: four stacked metrics pushed the
          orders panel a full scroll below the fold on a phone. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Commandes aujourd'hui" value={d.commandesAujourdhui} />
        <Metric
          label="Nouvelles à traiter"
          value={d.nouvellesCommandes}
          hint={d.nouvellesCommandes > 0 ? 'En attente de confirmation' : 'Rien en attente'}
        />
        <Metric
          label="Revenus ce mois"
          value={formatPriceShort(d.revenusMois)}
          hint={revenueHint(d)}
        />
        <Metric
          label="En rupture"
          value={d.enRupture.length}
          hint={d.messagesNonLus > 0 ? `${d.messagesNonLus} message(s) non lu(s)` : undefined}
        />
      </div>

      {/* Charts. The trend spans the full width because 30 days of bars need
          the room; the two breakdowns share the row below it. */}
      <div className="mt-6 grid gap-6">
        <Panel title="30 derniers jours">
          <TrendChart data={d.tendance || []} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Panel title="Commandes par statut">
          <StatusChart parStatut={d.parStatut} labels={STATUT_LABEL} />
        </Panel>

        <Panel title="Ventes par catégorie">
          <CategoryChart data={d.parCategorie || []} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Dernières commandes">
          {d.recentes.length === 0 ? (
            <p className="text-sm text-ink-muted">Aucune commande pour le moment.</p>
          ) : (
            <>
              {/* Phone: one card per order. */}
              <CardList>
                {d.recentes.map((order) => (
                  <Card key={order._id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/admin/commandes?q=${order.numero}`}
                          className="block tabular-nums text-sm text-ink underline decoration-gold underline-offset-4"
                        >
                          {order.numero}
                        </Link>
                        <span className="mt-0.5 block text-[12px] text-ink-muted">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>

                      <Badge tone={order.statut === 'ANNULEE' ? 'muted' : 'neutral'}>
                        {STATUT_LABEL[order.statut]}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-col gap-1.5 border-t border-greige pt-3">
                      <CardRow label="Client">
                        <span className="block truncate">{order.clientNom}</span>
                        <a
                          href={`tel:+${toInternational(order.clientTelephone)}`}
                          className="mt-0.5 block tabular-nums text-[12px] text-ink-muted underline decoration-gold underline-offset-4"
                        >
                          {formatPhone(order.clientTelephone)}
                        </a>
                      </CardRow>

                      <CardRow label="Wilaya">{order.wilayaNom}</CardRow>

                      <CardRow label="Total">
                        <span className="tabular-nums">{formatPriceShort(order.total)}</span>
                      </CardRow>
                    </div>
                  </Card>
                ))}
              </CardList>

              {/* Tablet and up: the table, which is better for scanning. */}
              <TableWrap className="hidden md:block">
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
            </>
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
