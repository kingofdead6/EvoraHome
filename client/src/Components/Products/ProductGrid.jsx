import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { gridContainer, viewportOnce, useReducedMotion } from '../../lib/motion';

/**
 * The product grid. Two columns at 360px, four from `lg`.
 *
 * Two columns on a phone rather than one is a deliberate call: furniture is
 * bought by comparison, and a single column turns browsing eight sofas into
 * eight screens of scrolling.
 *
 * The stagger fires once when the grid enters the viewport and never again.
 */
export default function ProductGrid({ products, priorityCount = 4, className = '' }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={viewportOnce}
      variants={gridContainer}
      className={`grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12 ${className}`}
    >
      {products.map((product, i) => (
        <ProductCard key={product._id} product={product} priority={i < priorityCount} />
      ))}
    </motion.div>
  );
}
