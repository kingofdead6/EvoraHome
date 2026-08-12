import { useEffect, useRef } from 'react';
import { useReducedMotion, useScroll, useTransform } from 'framer-motion';

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

/**
 * Word-by-word heading reveal.
 *
 * Each word rises out of a clipped line rather than fading in place, which is
 * what makes it read as typesetting rather than as a web animation. Kept to the
 * home page's one display heading: used on every heading it would become the
 * thing the customer notices about the site.
 *
 * 60ms between words is slower than the 50ms grid stagger on purpose. There are
 * only three or four words, so the cascade has to be visible across a much
 * shorter run.
 */
export const wordContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const wordItem = {
  // 110% rather than 100%: Cinzel's descenders sit below the baseline and at
  // exactly 100% the tail of a "p" stays visible above the mask edge.
  hidden: { transform: 'translateY(110%)' },
  visible: { transform: 'translateY(0%)', transition: { duration: 0.6, ease: EASE_OUT } },
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
 * Scroll parallax for an image inside a fixed frame.
 *
 * Returns a ref for the frame and a `y` to hand to a `motion.img` inside it.
 * The image drifts by `distance` across the whole time it is on screen, which
 * at the default 24px is small enough that nobody consciously sees it move and
 * large enough that the grid stops feeling like flat paper.
 *
 * The image must be taller than its frame or the drift would expose an edge.
 * Callers scale it; `ProductImage` already crops with object-cover.
 *
 * `enabled` exists because hooks cannot be called conditionally but the effect
 * is opt-in per page. Passing a `target` ref that the caller never attaches
 * makes Framer throw "Target ref is defined but not hydrated" on every card, so
 * when the effect is off we hand it no target at all and ignore the result.
 *
 * Returns a null `y` when disabled or under reduced motion, which is the
 * caller's signal to render a plain image.
 */
export function useScrollParallax(distance = 24, enabled = true) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const active = enabled && !reduced;

  const { scrollYProgress } = useScroll(
    active
      ? {
          target: ref,
          // From the frame's top edge hitting the bottom of the viewport, to
          // its bottom edge leaving the top: the full pass, so the drift is
          // linear in how far the customer has actually scrolled.
          offset: ['start end', 'end start'],
        }
      : undefined
  );

  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return { ref: active ? ref : undefined, y: active ? y : null };
}

/**
 * Lenis smooth scroll.
 *
 * Disabled entirely under prefers-reduced-motion, where hijacking the scroll is
 * exactly the thing the setting asks us not to do. Also skipped on coarse
 * pointers: mobile browsers already have momentum scrolling, and layering
 * Lenis on top of it costs frames on the mid-range Android this audience uses.
 *
 * `enabled` turns it off wholesale for the admin. Lenis takes over the wheel
 * and drives `window`, but the admin scrolls an inner <main> element instead,
 * so with Lenis running the wheel was captured and nothing moved: the admin
 * simply could not be scrolled. Smooth scrolling is storefront presentation
 * anyway, and the admin is a tool the client uses all day.
 */
export function useSmoothScroll(enabled = true) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!enabled) return undefined;
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
  }, [reduced, enabled]);
}

export { useReducedMotion };
