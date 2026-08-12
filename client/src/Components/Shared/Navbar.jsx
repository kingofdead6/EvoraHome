import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ShoppingBag, User, Search, Phone } from 'lucide-react';

import { useCart } from '../../lib/cart';
import { useAuth } from '../../lib/auth';
import { useSettings } from '../../lib/settings';
import { formatPhone, toInternational } from '../../lib/format';
import { brand } from '../../brand';
import { EASE_OUT, useReducedMotion } from '../../lib/motion';

import LogoMark from '../../assets/LogoMark.webp';

/**
 * The navbar.
 *
 * Olive, full width, 68px on desktop, sitting under a thin forest strip that
 * carries the two facts an Algerian customer checks before anything else:
 * where we deliver and how they pay.
 *
 * The lockup is the printed logo card's mark next to the Cinzel wordmark. The
 * mark used here is the photographed card, not the traced SVG: the SVG has
 * four sanctioned placements and this is not one of them.
 */

const LINKS = [
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/showroom', label: 'Notre showroom' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

const SHEET_CATEGORIES = [
  { slug: 'salons', nom: 'Salons' },
  { slug: 'chambres', nom: 'Chambres' },
  { slug: 'tables-et-chaises', nom: 'Tables & Chaises' },
  { slug: 'meubles-tv', nom: 'Meubles TV' },
  { slug: 'consoles-et-miroirs', nom: 'Consoles & Miroirs' },
  { slug: 'salon-de-jardin', nom: 'Salon de Jardin' },
  { slug: 'decoration', nom: 'Décoration' },
];

/** The active link marker: a gold hairline under the label. */
function navLinkClass({ isActive }) {
  return [
    'relative py-2 text-sm uppercase tracking-[0.15em] transition-colors duration-200',
    'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-gold after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.23,1,0.32,1)]',
    isActive ? 'text-cream after:scale-x-100' : 'text-sand hover:text-cream after:scale-x-0',
  ].join(' ');
}

/** The mark plus the wordmark. One link, one focus stop. */
function Lockup({ size = 'md', onClick }) {
  const compact = size === 'sm';

  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={`${brand.name}, retour à l'accueil`}
      className="group flex min-h-[44px] shrink-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4 sm:gap-3"
    >
      <img
        src={LogoMark}
        alt=""
        aria-hidden="true"
        width={40}
        height={40}
        className={`shrink-0 rounded-sm border border-gold/30 object-cover transition-colors duration-200 group-hover:border-gold/70 ${
          compact ? 'h-8 w-8' : 'h-8 w-8 sm:h-10 sm:w-10'
        }`}
      />
      <span className="flex flex-col leading-none">
        <span
          className={`whitespace-nowrap font-display text-cream transition-colors duration-200 group-hover:text-sand ${
            compact ? 'text-sm tracking-[0.14em]' : 'text-sm tracking-[0.14em] sm:text-lg sm:tracking-[0.2em]'
          }`}
        >
          {brand.wordmark}
        </span>
        <span className="mt-1 hidden text-[12px] tracking-[0.18em] text-sand/80 sm:block">
          El Khroub 25100
        </span>
      </span>
    </Link>
  );
}

export default function Navbar({ onOpenCart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { nbArticles, addCount } = useCart();
  const { isLoggedIn, isAdmin } = useAuth();
  const settings = useSettings();
  const location = useLocation();
  const reduced = useReducedMotion();

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

  const accountTo = isAdmin ? '/admin' : isLoggedIn ? '/compte' : '/connexion';

  return (
    <header className="sticky top-0 z-40 bg-olive">
      {/* Utility strip. Two facts, no marketing. */}
      <div className="border-b border-gold/15 bg-forest">
        <div className="mx-auto flex h-8 max-w-[1400px] items-center justify-between gap-4 overflow-hidden px-4 sm:px-6 lg:px-10">
          {/* The full line does not fit at 360px and truncating it cuts the
              half that matters, so the phone gets the shorter of the two. */}
          <p className="truncate text-[12px] uppercase tracking-[0.16em] text-sand/85">
            <span className="sm:hidden">Paiement à la livraison</span>
            <span className="hidden sm:inline">
              Livraison dans les 58 wilayas - paiement à la livraison
            </span>
          </p>
          <a
            href={`tel:+${toInternational(settings.telephone)}`}
            className="hidden shrink-0 items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-sand transition-colors duration-200 hover:text-cream sm:flex"
          >
            <Phone size={13} strokeWidth={1.5} className="text-gold" />
            <span className="tabular-nums">{formatPhone(settings.telephone)}</span>
          </a>
        </div>
      </div>

      <nav
        aria-label="Navigation principale"
        className="border-b border-gold/25"
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:h-[76px] lg:gap-6 lg:px-10">
          {/* Left: menu trigger on mobile, the lockup on desktop */}
          <div className="flex items-center gap-3 lg:flex-1">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-label="Ouvrir le menu"
              className="-ml-2 flex h-11 w-11 items-center justify-center text-sand transition-colors duration-200 hover:text-cream lg:hidden"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>

            <div className="hidden lg:block">
              <Lockup />
            </div>
          </div>

          {/* Centre: the lockup on mobile, the links on desktop */}
          <div className="min-w-0 lg:hidden">
            <Lockup size="sm" />
          </div>

          <ul className="hidden items-center justify-center gap-8 lg:flex">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right: search, account and cart */}
          <div className="flex items-center justify-end gap-1 sm:gap-1.5 lg:flex-1">
            <Link
              to="/catalogue"
              aria-label="Rechercher un produit"
              className="hidden h-11 w-11 items-center justify-center rounded-sm text-sand transition-colors duration-200 hover:bg-forest hover:text-cream sm:flex"
            >
              <Search size={19} strokeWidth={1.5} />
            </Link>

            <Link
              to={accountTo}
              aria-label={isLoggedIn ? 'Mon compte' : 'Se connecter'}
              className="flex h-11 w-11 items-center justify-center rounded-sm text-sand transition-colors duration-200 hover:bg-forest hover:text-cream"
            >
              <User size={19} strokeWidth={1.5} />
            </Link>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Panier, ${nbArticles} article${nbArticles > 1 ? 's' : ''}`}
              className="relative flex h-11 w-11 items-center justify-center rounded-sm text-sand transition-colors duration-200 hover:bg-forest hover:text-cream"
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
                  className="absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[12px] font-medium tabular-nums text-forest"
                >
                  {nbArticles > 99 ? '99+' : nbArticles}
                </motion.span>
              ) : null}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-olive lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-sand/15 bg-olive px-4 sm:px-6">
              <Lockup size="sm" onClick={() => setMenuOpen(false)} />
              <button
                ref={closeRef}
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
                className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-sand transition-colors duration-200 hover:text-cream"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <nav aria-label="Menu mobile" className="flex-1 px-4 pb-10 pt-6 sm:px-6">
              <ul className="flex flex-col">
                {[...LINKS, { to: accountTo, label: isAdmin ? 'Administration' : isLoggedIn ? 'Mon compte' : 'Se connecter' }].map(
                  (link, i) => (
                    <motion.li
                      key={link.to}
                      initial={reduced ? false : { opacity: 0, transform: 'translateY(10px)' }}
                      animate={{ opacity: 1, transform: 'translateY(0px)' }}
                      transition={{ duration: 0.28, delay: reduced ? 0 : 0.04 * i, ease: EASE_OUT }}
                      className="border-b border-sand/15"
                    >
                      <Link
                        to={link.to}
                        className="flex min-h-[56px] items-center font-display text-lg tracking-[0.1em] text-cream"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  )
                )}
              </ul>

              <h2 className="mb-3 mt-8 text-[12px] uppercase tracking-[0.2em] text-sand/80">
                Collections
              </h2>
              <ul className="grid grid-cols-2 gap-x-3">
                {SHEET_CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to={`/catalogue/${c.slug}`}
                      className="flex min-h-[40px] items-center text-sm text-sand transition-colors duration-200 hover:text-cream"
                    >
                      {c.nom}
                    </Link>
                  </li>
                ))}
              </ul>

              <a
                href={`tel:+${toInternational(settings.telephone)}`}
                className="mt-8 flex min-h-[48px] items-center justify-center gap-2.5 rounded-sm border border-sand/40 text-sm uppercase tracking-[0.12em] text-sand transition-colors duration-200 hover:border-gold hover:text-cream"
              >
                <Phone size={16} strokeWidth={1.5} className="text-gold" />
                <span className="tabular-nums">{formatPhone(settings.telephone)}</span>
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
