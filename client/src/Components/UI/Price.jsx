import { formatPrice } from '../../lib/format';

/**
 * A price.
 *
 * The figure renders in `gold-deep`, not raw `gold`. Raw gold on cream measures
 * 2.23:1, which fails both the 4.5:1 body floor and the 3:1 large-text floor,
 * so it cannot legally carry a number the customer has to read. `gold-deep`
 * measures 5.13:1 and still reads as the brand's gold.
 *
 * `tabular-nums` keeps six-digit prices from jittering as quantities change in
 * the cart.
 */

const SIZES = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
};

export default function Price({ value, ancienPrix, size = 'md', onOlive = false, className = '' }) {
  const hasPromo = Boolean(ancienPrix && ancienPrix > value);

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 ${className}`}>
      <span
        className={`font-sans tabular-nums tracking-[0.02em] ${SIZES[size]} ${
          onOlive ? 'text-sand' : 'text-gold-deep'
        }`}
      >
        {formatPrice(value)}
      </span>

      {hasPromo ? (
        <span
          className={`font-sans text-sm tabular-nums line-through ${
            onOlive ? 'text-cream/55' : 'text-ink-muted'
          }`}
        >
          {formatPrice(ancienPrix)}
        </span>
      ) : null}
    </span>
  );
}
