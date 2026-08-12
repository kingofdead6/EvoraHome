import { useI18n } from '../../lib/i18n';

/**
 * Availability and catalogue badges.
 *
 * Deliberately not colour-coded traffic lights. Availability is stated in
 * words, because "En stock" and "Sur commande" mean different things to a
 * furniture customer and a green dot conveys neither.
 *
 * DISPONIBILITE_LABEL stays exported as a French fallback for any call site
 * that has not been converted to the translated <AvailabilityBadge>.
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
      className={`inline-flex items-center rounded-xs border px-2 py-1 text-[12px] uppercase tracking-[0.12em] ${
        TONES[tone] || TONES.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function AvailabilityBadge({ disponibilite, className = '' }) {
  const { t } = useI18n();
  const tone = disponibilite === 'RUPTURE' ? 'muted' : disponibilite === 'SUR_COMMANDE' ? 'gold' : 'neutral';
  return (
    <Badge tone={tone} className={className}>
      {t(`product.availability.${disponibilite}`)}
    </Badge>
  );
}
