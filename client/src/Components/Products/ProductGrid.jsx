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
 * The column count is a prop rather than a className override: two
 * `grid-template-columns` utilities on one element resolve by stylesheet order,
 * not by the order they are written, so `lg:grid-cols-3` passed in through
 * className silently loses to the built-in `lg:grid-cols-4`.
 *
 * The stagger fires once when the grid enters the viewport and never again.
 */

const COLUMNS = {
  4: 'grid-cols-2 lg:grid-cols-4',
  3: 'grid-cols-2 lg:grid-cols-3',
  2: 'grid-cols-2',
};

export default function ProductGrid({ products, priorityCount = 4, columns = 4, className = '' }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={viewportOnce}
      variants={gridContainer}
      className={`grid gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-12 ${COLUMNS[columns] || COLUMNS[4]} ${className}`}
    >
      {products.map((product, i) => (
        <ProductCard key={product._id} product={product} priority={i < priorityCount} />
      ))}
    </motion.div>
  );
}
