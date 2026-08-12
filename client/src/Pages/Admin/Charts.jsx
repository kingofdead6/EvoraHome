import { useId, useMemo, useState } from 'react';

/**
 * Dashboard charts, drawn as inline SVG.
 *
 * No charting library: three simple forms over at most 30 points each does not
 * justify shipping Recharts to a client checking orders on mobile data. Every
 * mark here is an SVG primitive positioned from a handful of scale functions.
 *
 * COLOUR
 * The brand palette (olive, gold, sand, greige) fails a categorical validation
 * badly — those hues are low-chroma and sit close together, so several pairs are
 * indistinguishable both to normal vision and under simulated colour blindness.
 * The palette below was checked with the dataviz validator and passes the
 * lightness band, chroma floor, CVD separation, normal-vision floor and contrast
 * against the cream surface. Brand colour still owns the page; the series colours
 * are used only inside plots, where being able to tell two marks apart wins.
 */

/** Categorical series colours, in fixed assignment order. Never cycled. */
export const SERIES = ['#B07A2E', '#2C63A8', '#8C3F2F', '#0F8A76', '#6B4E8F', '#3F7D3A'];

/** Order-state colours. Carried with a text label, never colour alone. */
const STATUT_COLOR = {
  NOUVELLE: '#B07A2E',
  CONFIRMEE: '#2C63A8',
  EN_PREPARATION: '#6B4E8F',
  EXPEDIEE: '#0F8A76',
  LIVREE: '#2F7D4F',
  ANNULEE: '#8A8580',
};

const INK = '#1F2320';
const INK_MUTED = '#6B7065';
const GRID = '#D8D1C5';

/** Compact DA figures. 289000 becomes "289 k". */
function short(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)} M`;
  if (n >= 1000) return `${Math.round(n / 1000)} k`;
  return String(Math.round(n));
}

function dayLabel(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/** A "no data yet" panel body. Charts with nothing to show must say so rather
 *  than draw empty axes, which read as a broken widget. */
function Empty({ children }) {
  return (
    <div className="flex min-h-[140px] items-center justify-center px-4 text-center">
      <p className="text-sm leading-relaxed text-ink-muted">{children}</p>
    </div>
  );
}

/**
 * Daily trend: orders as bars, delivered revenue as a line over them.
 *
 * These are two different measures, so they are NOT given two y-axes — that is
 * the single worst chart mistake and makes any crossing point meaningless.
 * Instead each is scaled to its own band of the plot: bars occupy the lower
 * two-thirds, the revenue line the upper third, with its own labelled maximum.
 * They share an x-axis only.
 */
export function TrendChart({ data }) {
  const [hover, setHover] = useState(null);
  const clipId = useId();

  const hasOrders = data.some((d) => d.commandes > 0);
  if (!hasOrders) {
    return <Empty>Aucune commande sur les 30 derniers jours. Le graphique apparaîtra dès la première commande.</Empty>;
  }

  const W = 640;
  const H = 200;
  const PAD = { top: 16, right: 44, bottom: 26, left: 34 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxOrders = Math.max(1, ...data.map((d) => d.commandes));
  const maxRevenue = Math.max(1, ...data.map((d) => d.revenus));
  const hasRevenue = data.some((d) => d.revenus > 0);

  const step = plotW / data.length;
  const barW = Math.max(2, Math.min(14, step - 3));

  const xOf = (i) => PAD.left + i * step + step / 2;
  // Bars fill the lower 62% of the plot; the revenue line lives above them.
  const barBase = PAD.top + plotH;
  const barTop = (v) => barBase - (v / maxOrders) * (plotH * 0.62);
  const revY = (v) => PAD.top + (plotH * 0.3) - (v / maxRevenue) * (plotH * 0.26);

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${revY(d.revenus).toFixed(1)}`)
    .join(' ');

  const active = hover === null ? null : data[hover];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 'auto' }}
        role="img"
        aria-label={`Commandes et revenus par jour sur ${data.length} jours`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        {/* Horizontal guides. Recessive: they are reference, not content. */}
        {[0, 0.5, 1].map((t) => {
          const y = barBase - t * plotH * 0.62;
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={PAD.left + plotW} y2={y} stroke={GRID} strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 3.5} textAnchor="end" fontSize="9" fill={INK_MUTED}>
                {Math.round(t * maxOrders)}
              </text>
            </g>
          );
        })}

        {/* Order bars. 2px gap between neighbours comes from barW < step. */}
        {data.map((d, i) => {
          const h = barBase - barTop(d.commandes);
          return (
            <rect
              key={d.date}
              x={xOf(i) - barW / 2}
              y={barTop(d.commandes)}
              width={barW}
              height={Math.max(d.commandes > 0 ? 2 : 0, h)}
              rx="2"
              fill={SERIES[0]}
              opacity={hover === null || hover === i ? 1 : 0.35}
            />
          );
        })}

        {/* Delivered revenue. Only drawn when there is revenue to draw. */}
        {hasRevenue ? (
          <g clipPath={`url(#${clipId})`}>
            <path d={linePath} fill="none" stroke={SERIES[3]} strokeWidth="2" strokeLinejoin="round" />
          </g>
        ) : null}

        {/* Date ticks: first, middle and last only. One label per day is
            unreadable at this width and adds nothing. */}
        {[0, Math.floor(data.length / 2), data.length - 1].map((i) => (
          <text key={i} x={xOf(i)} y={H - 8} textAnchor="middle" fontSize="9" fill={INK_MUTED}>
            {dayLabel(data[i].date)}
          </text>
        ))}

        {hasRevenue ? (
          <text x={PAD.left + plotW + 6} y={revY(maxRevenue) + 3} fontSize="9" fill={SERIES[3]}>
            {short(maxRevenue)}
          </text>
        ) : null}

        {/* Hover targets, wider than the bars so a mouse finds them. */}
        {data.map((d, i) => (
          <rect
            key={`hit-${d.date}`}
            x={PAD.left + i * step}
            y={PAD.top}
            width={step}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {hover !== null ? (
          <line
            x1={xOf(hover)}
            y1={PAD.top}
            x2={xOf(hover)}
            y2={barBase}
            stroke={INK}
            strokeWidth="1"
            opacity="0.25"
          />
        ) : null}
      </svg>

      {/*
        Tooltip as HTML rather than SVG text: it wraps, and it inherits the
        admin's type styles for free. Positioned as a percentage of the SVG's
        own width so it tracks the hovered day at any container size, and it
        flips to the left of the cursor past the midpoint so it never gets
        clipped by the panel's right edge.
      */}
      {active ? (
        <div
          className="pointer-events-none absolute z-10 -translate-y-1 rounded-sm border border-greige bg-cream px-2.5 py-1.5 text-[12px] shadow-sm"
          style={{
            left: `${(xOf(hover) / W) * 100}%`,
            top: `${(PAD.top / H) * 100}%`,
            transform: hover > data.length / 2 ? 'translate(-100%, -4px)' : 'translate(8px, -4px)',
          }}
        >
          <span className="block tabular-nums text-ink">{dayLabel(active.date)}</span>
          <span className="mt-0.5 block whitespace-nowrap tabular-nums text-ink-muted">
            {active.commandes} commande{active.commandes > 1 ? 's' : ''}
          </span>
          {active.revenus > 0 ? (
            <span className="block whitespace-nowrap tabular-nums text-ink-muted">
              {short(active.revenus)} DA livrés
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-xs" style={{ background: SERIES[0] }} />
          Commandes par jour
        </span>
        {hasRevenue ? (
          <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <span aria-hidden="true" className="h-0.5 w-3.5" style={{ background: SERIES[3] }} />
            Revenus livrés
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Orders by status, as a horizontal bar list.
 *
 * Horizontal because the labels are French status names that would never fit
 * under a vertical bar, and a bar list stays readable at any count. Not a pie:
 * comparing six angles is measurably harder than comparing six lengths.
 */
export function StatusChart({ parStatut, labels }) {
  const rows = useMemo(
    () =>
      Object.entries(parStatut || {})
        .map(([statut, count]) => ({ statut, count, label: labels[statut] || statut }))
        .sort((a, b) => b.count - a.count),
    [parStatut, labels]
  );

  if (!rows.length) return <Empty>Aucune commande enregistrée pour le moment.</Empty>;

  const total = rows.reduce((n, r) => n + r.count, 0);
  const max = Math.max(...rows.map((r) => r.count));

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <div key={r.statut}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-xs"
                style={{ background: STATUT_COLOR[r.statut] || INK_MUTED }}
              />
              <span className="truncate text-sm text-ink">{r.label}</span>
            </span>
            {/* Direct label: identity never rests on colour alone. */}
            <span className="shrink-0 tabular-nums text-sm text-ink">
              {r.count}
              <span className="ml-1.5 text-[12px] text-ink-muted">
                {Math.round((r.count / total) * 100)}%
              </span>
            </span>
          </div>

          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-xs bg-greige/50">
            <div
              className="h-full rounded-xs"
              style={{
                width: `${Math.max(2, (r.count / max) * 100)}%`,
                background: STATUT_COLOR[r.statut] || INK_MUTED,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Revenue by category. Delivered orders only, so it reflects money actually
 * collected rather than orders that may still be cancelled on the phone.
 */
export function CategoryChart({ data }) {
  if (!data?.length) {
    return <Empty>Aucune commande livrée pour le moment. Les ventes par catégorie apparaîtront ici.</Empty>;
  }

  const max = Math.max(...data.map((d) => d.revenus));

  return (
    <div className="flex flex-col gap-3">
      {data.map((row, i) => (
        <div key={row.nom}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-sm text-ink">{row.nom}</span>
            <span className="shrink-0 tabular-nums text-sm text-ink">
              {short(row.revenus)}
              <span className="ml-1.5 text-[12px] text-ink-muted">
                {row.quantite} pce{row.quantite > 1 ? 's' : ''}
              </span>
            </span>
          </div>

          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-xs bg-greige/50">
            <div
              className="h-full rounded-xs"
              style={{
                width: `${Math.max(2, (row.revenus / max) * 100)}%`,
                background: SERIES[i % SERIES.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
