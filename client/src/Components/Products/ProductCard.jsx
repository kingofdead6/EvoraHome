import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import ProductImage from '../UI/ProductImage';
import Price from '../UI/Price';
import Badge from '../UI/Badge';
import { gridItem } from '../../lib/motion';

/**
 * A product card.
 *
 * The hover is deliberately restrained: the image scales to 1.03 and a gold
 * hairline draws in along the base of the card. No lift, no shadow, no tilt.
 * Both are gated behind `(hover: hover)`, because on a phone every tap fires a
 * phantom hover and the card would flicker under the customer's thumb.
 *
 * The whole card is one link. A card with a link on the title and another on
 * the image gives a screen reader two identical destinations and gives a thumb
 * two chances to miss.
 */
export default function ProductCard({ product, priority = false, className = '' }) {
  const image = product.images?.[0];
  const rupture = product.disponibilite === 'RUPTURE';

  return (
    <motion.article variants={gridItem} className={className}>
      <Link
        to={`/produit/${product.slug}`}
        className="group flex h-full flex-col gap-3 focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4"
      >
        <div className="relative">
          <ProductImage
            src={image?.url}
            alt={image?.alt || product.nom}
            priority={priority}
            imgClassName="transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover:scale-[1.03]"
          />

          {/* The gold hairline. Scales from the centre on hover. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px origin-center scale-x-0 bg-gold transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover:scale-x-100"
          />

          {product.isNouveau && !rupture ? (
            <Badge tone="olive" className="absolute left-3 top-3">
              Nouveau
            </Badge>
          ) : null}

          {rupture ? (
            <span className="absolute inset-0 flex items-end bg-forest/45 p-3">
              <Badge tone="olive">Rupture de stock</Badge>
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          {/* The reference code, always. It is how the client and their
              customers already talk about a piece on Instagram. */}
          <span className="font-sans text-[12px] uppercase tracking-[0.18em] text-ink-muted">
            Réf {product.ref}
          </span>

          {/* Long French furniture names are the norm, so the card reserves two
              lines and clamps rather than letting one product push the row. */}
          <h3 className="line-clamp-2 font-sans text-base leading-snug text-ink">{product.nom}</h3>

          <Price value={product.prix} ancienPrix={product.ancienPrix} size="md" className="mt-auto pt-1" />
        </div>
      </Link>
    </motion.article>
  );
}
