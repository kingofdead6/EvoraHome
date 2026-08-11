import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { animate } from 'animejs';

import EvoraTree from '../Brand/EvoraTree';
import { EASE_OUT, useReducedMotion } from '../../lib/motion';

/**
 * The signature entrance: the tree mark drawing itself in, once, on first load.
 *
 * The brief asks for two things that collide. It lists exactly four places the
 * tree may appear (loading state, section divider, empty state, footer
 * watermark) and says "use it nowhere else", and it also asks for a hero
 * entrance where the mark draws itself in. Putting the mark in the hero as well
 * would be a fifth placement.
 *
 * This resolves it by making the entrance BE the loading state: the mark draws
 * itself over an olive field while the home page paints behind, then lifts.
 * One placement, both requirements.
 *
 * Constraints it respects:
 *   - once per session, so a customer browsing five products never sees it again
 *   - skipped entirely under prefers-reduced-motion
 *   - the hero renders behind it the whole time, so this delays nothing
 *   - anime.js is used here and nowhere else in the project
 */

const SEEN_KEY = 'evora.intro.seen';

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    // Private browsing. Better to show the intro once too often than to crash.
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* nothing to do */
  }
}

export default function Intro() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(() => !alreadySeen() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const pathRef = useRef(null);
  const [windowDrawn, setWindowDrawn] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;

    markSeen();

    const path = pathRef.current;
    if (!path) {
      setVisible(false);
      return undefined;
    }

    // The mark is one path made of many subpaths, so a single dashoffset tween
    // draws the whole thing stroke by stroke, from the trunks upward.
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const animation = animate(path, {
      strokeDashoffset: 0,
      duration: 1100,
      ease: 'outCubic',
    });

    // The window lights up once the house it sits in has been drawn.
    const windowTimer = setTimeout(() => setWindowDrawn(true), 950);

    // Held slightly past the draw so the completed mark is legible for a beat,
    // then out. Total is under 1.6s.
    const timer = setTimeout(() => setVisible(false), 1550);

    return () => {
      clearTimeout(windowTimer);
      clearTimeout(timer);
      animation.pause();
    };
  }, [visible]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-olive"
        >
          <EvoraTree
            size={200}
            pathRef={pathRef}
            className="text-gold"
            windowStyle={{
              opacity: windowDrawn ? 1 : 0,
              transition: 'opacity 400ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
