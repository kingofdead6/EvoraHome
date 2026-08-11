/**
 * Availability and catalogue badges.
 *
 * Deliberately not colour-coded traffic lights. Availability is stated in
 * words, because "En stock" and "Sur commande" mean different things to a
 * furniture customer and a green dot conveys neither.
 */

export const DISPONIBILITE_LABEL = {
  EN_STOCK: 'En stock',
  SUR_COMMANDE: 'Sur commande',
  RUPTURE: 'Rupture de stock',
};

const TONES = {
  // Ink on greige: high contrast, no colour needed.
  neutral: 'border-greige bg-greige/40 text-ink',
  // The one place a warmer tone is used, for a state that blocks ordering.
  muted: 'border-greige bg-transparent text-ink-muted',
  gold: 'border-gold/50 bg-transparent text-gold-deep',
  olive: 'border-olive/25 bg-olive text-cream',
};

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-xs border px-2 py-1 text-[11px] uppercase tracking-[0.12em] ${
        TONES[tone] || TONES.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function AvailabilityBadge({ disponibilite, className = '' }) {
  const tone = disponibilite === 'RUPTURE' ? 'muted' : disponibilite === 'SUR_COMMANDE' ? 'gold' : 'neutral';
  return (
    <Badge tone={tone} className={className}>
      {DISPONIBILITE_LABEL[disponibilite] || disponibilite}
    </Badge>
  );
}
