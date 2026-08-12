import { motion } from 'framer-motion';
import EvoraTree from '../Brand/EvoraTree';
import Button from './Button';
import { EASE_OUT, useReducedMotion } from '../../lib/motion';

/**
 * Loading, empty and error states.
 *
 * Two of the tree mark's four sanctioned uses live here: the loading state and
 * the empty-state illustration.
 */

/**
 * Loading. The mark breathes on opacity only, at 2s, which reads as waiting
 * rather than as a spinner demanding attention. No rotation.
 *
 * It reserves a viewport by default. Almost every use is a whole-page state,
 * and a short loader lets the footer render on screen and then drop a full
 * screen when the content arrives. That single shift was worth 0.92 CLS on the
 * product page. Pass a className to opt out where the loader is inline.
 */
export function Loading({ label = 'Chargement', className = 'min-h-[calc(100dvh-4rem)]' }) {
  const reduced = useReducedMotion();

  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-20 ${className}`} role="status">
      <motion.div
        animate={reduced ? undefined : { opacity: [0.35, 1, 0.35] }}
        transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-sand"
      >
        <EvoraTree size={64} />
      </motion.div>
      <span className="text-sm uppercase tracking-[0.15em] text-ink-muted">{label}</span>
    </div>
  );
}

/**
 * Skeleton grid, shaped like the product cards it replaces so nothing jumps
 * when the real content lands.
 */
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="flex flex-col gap-3">
          <div className="aspect-product animate-pulse rounded-sm border border-greige bg-greige/40" />
          {/* Matches the card's stack: ref line, two-line name, price. */}
          <div className="h-3 w-1/3 animate-pulse rounded-xs bg-greige/60" />
          <div className="h-4 w-4/5 animate-pulse rounded-xs bg-greige/60" />
          <div className="h-4 w-1/2 animate-pulse rounded-xs bg-greige/60" />
        </div>
      ))}
    </div>
  );
}

/** Empty state. The mark, one line of explanation, and a way out. */
export function EmptyState({ title, message, actionLabel, actionTo, onAction, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-5 px-6 py-20 text-center ${className}`}>
      <EvoraTree size={96} className="text-sand" />

      <div className="flex max-w-md flex-col gap-2">
        <h2 className="font-display text-lg text-ink">{title}</h2>
        {message ? <p className="text-base text-ink-muted">{message}</p> : null}
      </div>

      {actionLabel ? (
        <Button to={actionTo} onClick={onAction} variant="secondary" size="md">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Error state. Always offers a retry, because the most common cause here is a
 * dropped mobile connection rather than a broken server.
 */
export function ErrorState({ message, onRetry, className = '' }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className={`flex flex-col items-center justify-center gap-5 px-6 py-20 text-center ${className}`}
      role="alert"
    >
      <div className="flex max-w-md flex-col gap-2">
        <h2 className="font-display text-lg text-ink">Une erreur est survenue</h2>
        <p className="text-base text-ink-muted">{message}</p>
      </div>

      {onRetry ? (
        <Button onClick={onRetry} variant="secondary" size="md">
          Réessayer
        </Button>
      ) : null}
    </motion.div>
  );
}
