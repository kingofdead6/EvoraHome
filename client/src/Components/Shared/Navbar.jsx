import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ShoppingBag, User, Search } from 'lucide-react';

import { useCart } from '../../lib/cart';
import { useAuth } from '../../lib/auth';
import { EASE_OUT, useReducedMotion } from '../../lib/motion';
import { useI18n } from '../../lib/i18n';
import LangSwitch from './LangSwitch';

/**
 * The navbar.
 *
 * Olive, full width, 68px on desktop. The wordmark is Cinzel, which is the only
 * place the display face carries the brand name. The tree mark is deliberately
 * NOT here: it has four sanctioned uses and this is not one of them.
 *
 * The nav is a single line on desktop and a full-height sheet on mobile.
 */

/** Translation keys, not labels: the array lives at module scope where no hook
 *  can run, so the text is resolved at render time instead. */
const LINKS = [
  { to: '/catalogue', key: 'nav.catalogue' },
  { to: '/showroom', key: 'nav.showroom' },
  { to: '/faq', key: 'nav.faq' },
  { to: '/contact', key: 'nav.contact' },
];

/** The active link marker: a gold hairline under the label. */
function navLinkClass({ isActive }) {
  return [
    'relative py-2 text-sm uppercase tracking-[0.15em] transition-colors duration-200',
    'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-gold after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.23,1,0.32,1)]',
    isActive ? 'text-cream after:scale-x-100' : 'text-sand hover:text-cream after:scale-x-0',
  ].join(' ');
}

export default function Navbar({ onOpenCart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { nbArticles, addCount } = useCart();
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();
  const reduced = useReducedMotion();
  const { t } = useI18n();

  const closeRef = useRef(null);

  // Close the sheet on navigation, so tapping a link never leaves it open
  // over the page the customer just asked for.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock the page behind the open sheet and send focus into it.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/25 bg-olive">
      <nav
        aria-label={t('nav.menu')}
        className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[68px] lg:px-10"
      >
        {/* Left: menu trigger on mobile, links on desktop */}
        <div className="flex flex-1 items-center gap-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-label={t('nav.menu')}
            className="-ms-2 flex h-11 w-11 items-center justify-center text-sand transition-colors duration-200 hover:text-cream lg:hidden"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>

          <ul className="hidden items-center gap-8 lg:flex">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={navLinkClass}>
                  {t(link.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Centre: the wordmark */}
        <Link
          to="/"
          className="flex min-h-[44px] shrink-0 items-center font-display text-base tracking-[0.2em] text-cream transition-colors duration-200 hover:text-sand sm:text-lg"
        >
          Evora Home
        </Link>

        {/* Right: language, account and cart */}
        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          <LangSwitch tone="onOlive" className="me-1 hidden sm:inline-flex" />

          <Link
            to="/catalogue"
            aria-label={t('nav.search')}
            className="hidden h-11 w-11 items-center justify-center text-sand transition-colors duration-200 hover:text-cream sm:flex"
          >
            <Search size={19} strokeWidth={1.5} />
          </Link>

          <Link
            to={isAdmin ? '/admin' : isLoggedIn ? '/compte' : '/connexion'}
            aria-label={isLoggedIn ? t('nav.account') : t('nav.login')}
            className="flex h-11 w-11 items-center justify-center text-sand transition-colors duration-200 hover:text-cream"
          >
            <User size={19} strokeWidth={1.5} />
          </Link>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`${t('nav.cart')} (${nbArticles})`}
            className="relative flex h-11 w-11 items-center justify-center text-sand transition-colors duration-200 hover:text-cream"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />

            {nbArticles > 0 ? (
              <motion.span
                // Keyed on the add counter so the badge pops when something is
                // added, and stays still when a quantity is merely edited.
                key={addCount}
                initial={reduced ? false : { transform: 'scale(0.6)' }}
                animate={{ transform: 'scale(1)' }}
                transition={{ duration: 0.24, ease: EASE_OUT }}
                className="absolute end-1 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[12px] font-medium tabular-nums text-forest"
              >
                {nbArticles > 99 ? '99+' : nbArticles}
              </motion.span>
            ) : null}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="fixed inset-0 z-50 bg-olive lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
          >
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <span className="font-display text-base tracking-[0.2em] text-cream">Evora Home</span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t('nav.close')}
                className="-me-2 flex h-11 w-11 items-center justify-center text-sand transition-colors duration-200 hover:text-cream"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <nav aria-label={t('nav.menu')} className="px-4 pt-6 sm:px-6">
              <ul className="flex flex-col">
                {LINKS.map((link, i) => (
                  <motion.li
                    key={link.to}
                    initial={reduced ? false : { opacity: 0, transform: 'translateY(10px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    transition={{ duration: 0.28, delay: reduced ? 0 : 0.04 * i, ease: EASE_OUT }}
                    className="border-b border-sand/15"
                  >
                    <Link
                      to={link.to}
                      className="flex min-h-[60px] items-center font-display text-lg tracking-[0.1em] text-cream"
                    >
                      {t(link.key)}
                    </Link>
                  </motion.li>
                ))}

                <motion.li
                  initial={reduced ? false : { opacity: 0, transform: 'translateY(10px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  transition={{ duration: 0.28, delay: reduced ? 0 : 0.12, ease: EASE_OUT }}
                  className="border-b border-sand/15"
                >
                  <Link
                    to={isAdmin ? '/admin' : isLoggedIn ? '/compte' : '/connexion'}
                    className="flex min-h-[60px] items-center font-display text-lg tracking-[0.1em] text-cream"
                  >
                    {isAdmin ? 'Administration' : isLoggedIn ? t('nav.account') : t('nav.login')}
                  </Link>
                </motion.li>
              </ul>

              {/* The switcher is hidden in the desktop bar below sm, so the
                  sheet is where a phone user finds it. */}
              <div className="mt-8 flex items-center gap-3 sm:hidden">
                <span className="text-[12px] uppercase tracking-[0.15em] text-sand/70">
                  {t('lang.switch')}
                </span>
                <LangSwitch tone="onOlive" />
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
