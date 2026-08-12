import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import ProductImage from '../UI/ProductImage';
import Price from '../UI/Price';
import Badge from '../UI/Badge';
import { gridItem, useScrollParallax } from '../../lib/motion';
import { useI18n } from '../../lib/i18n';

/**
 * A product card.
 *
 * The hover is deliberately restrained: the image scales to 1.03, the second
 * showroom photo cross-fades in underneath it where one exists, and a gold
 * hairline draws in along the base. No lift, no shadow, no tilt. All of it is
 * gated behind `(hover: hover)`, because on a phone every tap fires a phantom
 * hover and the card would flicker under the customer's thumb.
 *
 * The whole card is one link. A card with a link on the title and another on
 * the image gives a screen reader two identical destinations and gives a thumb
 * two chances to miss.
 */
export default function ProductCard({ product, priority = false, parallax = false, className = '' }) {
  const image = product.images?.[0];
  // The client shoots most pieces twice, from the front and at an angle. Where
  // the second frame exists it is worth more than any hover effect we could
  // invent: it answers "what does the back look like" without a page load.
  const alternate = product.images?.[1];
  const rupture = product.disponibilite === 'RUPTURE';
  const { t } = useI18n();

  // Opt-in, because the effect costs a scroll listener per card and only the
  // home page's eight featured cards are worth it. When it is off the hook
  // returns no ref and no motion value, so nothing here tracks scroll.
  const { ref, y } = useScrollParallax(20, parallax);

  return (
    <motion.article variants={gridItem} className={className}>
      <Link
        to={`/produit/${product.slug}`}
        className="group flex h-full flex-col gap-3 focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4"
      >
        {/*
          The hover scale lives on this wrapper rather than on the image,
          because the parallax writes `transform` on the image itself and the
          two would overwrite each other. Scaling the frame's contents gets the
          same result and leaves the image's transform free.
        */}
        <div ref={ref} className="relative">
          <ProductImage
            src={image?.url}
            alt={image?.alt || product.nom}
            priority={priority}
            parallaxY={y}
            className="transition-transform duration-500 ease-out-strong motion-safe:[@media(hover:hover)]:group-hover:scale-[1.03]"
            imgClassName={
              alternate && !rupture
                ? 'relative z-10 transition-opacity duration-500 ease-out-strong motion-safe:[@media(hover:hover)]:group-hover:opacity-0'
                : 'relative z-10'
            }
          >
            {/* Sits under the primary, which fades out over it. Decorative:
                the primary image already carries the accessible name. It is
                painted first in source order but the primary is lifted to z-10,
                so this stays underneath. */}
            {alternate && !rupture ? (
              <img
                src={alternate.url}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                // Must match the primary's geometry, which ProductImage only
                // enlarges when it actually receives a motion value.
                className={`pointer-events-none absolute inset-x-0 w-full object-cover ${
                  y ? '-top-[6%] h-[112%]' : 'top-0 h-full'
                }`}
              />
            ) : null}

            {/*
              The quiet counterpart to the reference's "View product" bar. Forest
              at 88% carries cream at well past the 4.5:1 floor, and it only ever
              appears on a real pointer, so it never covers a price on a phone.
            */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-full bg-forest/88 px-3 py-2.5 text-center font-sans text-[11px] uppercase tracking-[0.18em] text-cream opacity-0 transition-[transform,opacity] duration-300 ease-out-strong motion-safe:[@media(hover:hover)]:group-hover:translate-y-0 motion-safe:[@media(hover:hover)]:group-hover:opacity-100"
            >
              {t('product.viewPiece')}
            </span>
          </ProductImage>

          {/* The gold hairline. Scales from the centre on hover. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 z-10 h-px origin-center scale-x-0 bg-gold transition-transform duration-300 ease-out-strong motion-safe:[@media(hover:hover)]:group-hover:scale-x-100"
          />

          {product.isNouveau && !rupture ? (
            <Badge tone="olive" className="absolute start-3 top-3 z-10">
              {t('product.isNew')}
            </Badge>
          ) : null}

          {rupture ? (
            <span className="absolute inset-0 z-10 flex items-end bg-forest/45 p-3">
              <Badge tone="olive">{t('product.availability.RUPTURE')}</Badge>
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          {/* The reference code, always. It is how the client and their
              customers already talk about a piece on Instagram. */}
          <span className="font-sans text-[12px] uppercase tracking-[0.18em] text-ink-muted">
            {t('product.ref')} {product.ref}
          </span>

          {/* Long French furniture names are the norm, so the card reserves two
              lines and clamps rather than letting one product push the row. */}
          <h3 className="line-clamp-2 font-sans text-base leading-snug text-ink transition-colors duration-200 [@media(hover:hover)]:group-hover:text-gold-deep">
            {product.nom}
          </h3>

          <Price value={product.prix} ancienPrix={product.ancienPrix} size="md" className="mt-auto pt-1" />
        </div>
      </Link>
    </motion.article>
  );
}
