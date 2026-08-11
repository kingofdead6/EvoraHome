import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Shared motion vocabulary. Every animation on the storefront comes from here,
 * so the site moves as one thing rather than as twelve components that each
 * invented a duration.
 *
 * The bar: furniture-showroom calm. If an animation draws attention to itself
 * rather than to the product, it does not belong here.
 */

// Matches the --ease-* tokens in index.css. Framer needs the array form.
export const EASE_OUT = [0.23, 1, 0.32, 1];
export const EASE_IN_OUT = [0.77, 0, 0.175, 1];

/** Section and block entrance. Fires once, never re-triggers on scroll. */
export const revealVariants = {
  hidden: { opacity: 0, transform: 'translateY(14px)' },
  visible: { opacity: 1, transform: 'translateY(0px)' },
};

export const revealTransition = { duration: 0.5, ease: EASE_OUT };

/** Standard viewport config: once only, triggered slightly before entry. */
export const viewportOnce = { once: true, margin: '-60px' };

/**
 * Grid stagger. 50ms sits in the brief's 40-60ms window: enough to read as a
 * cascade, short enough that the last card in a row of four is not visibly
 * late.
 */
export const gridContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export const gridItem = {
  hidden: { opacity: 0, transform: 'translateY(12px)' },
  visible: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.4, ease: EASE_OUT } },
};

/** Page transition. A clean fade, well under the 400ms ceiling. */
export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const pageTransition = { duration: 0.22, ease: EASE_OUT };

/**
 * Returns motion props that collapse to "already in final state" when the
 * customer asks for reduced motion. Not zero animation, just no movement:
 * content still appears, it simply does not travel.
 */
export function useRevealProps(reduced) {
  if (reduced) return {};
  return {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: viewportOnce,
    variants: revealVariants,
    transition: revealTransition,
  };
}

/**
 * Lenis smooth scroll.
 *
 * Disabled entirely under prefers-reduced-motion, where hijacking the scroll is
 * exactly the thing the setting asks us not to do. Also skipped on coarse
 * pointers: mobile browsers already have momentum scrolling, and layering
 * Lenis on top of it costs frames on the mid-range Android this audience uses.
 */
export function useSmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;

    let lenis;
    let frame;
    let cancelled = false;

    // Imported dynamically so Lenis never lands in the entry chunk. It is a
    // desktop-only enhancement and the phone visitors who dominate this
    // audience must not pay for it.
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        smoothWheel: true,
      });

      const raf = (time) => {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, [reduced]);
}

export { useReducedMotion };
