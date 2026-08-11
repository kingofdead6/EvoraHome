import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';

import { useCart } from '../../lib/cart';
import { formatPrice } from '../../lib/format';
import ProductImage from '../UI/ProductImage';
import Button from '../UI/Button';
import EvoraTree from '../Brand/EvoraTree';
import { useReducedMotion } from '../../lib/motion';

/**
 * The cart drawer. Slides in from the right on desktop, full width on a phone.
 *
 * Shows the subtotal only. Delivery is not a number we can honestly quote until
 * the customer picks a wilaya, and showing "Total" here and a different, larger
 * total at checkout is how a cash-on-delivery customer decides not to open the
 * door.
 */
export default function CartDrawer({ open, onClose }) {
  const { items, nbArticles, sousTotal, setQuantity, remove, lineKey } = useCart();
  const reduced = useReducedMotion();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Fermer le panier"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 cursor-default bg-forest/50"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Panier"
            initial={reduced ? { opacity: 0 } : { transform: 'translateX(100%)' }}
            animate={reduced ? { opacity: 1 } : { transform: 'translateX(0%)' }}
            exit={reduced ? { opacity: 0 } : { transform: 'translateX(100%)' }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[26rem] flex-col bg-cream shadow-none"
          >
            <header className="flex items-center justify-between border-b border-greige px-4 py-4 sm:px-6">
              <h2 className="font-display text-base tracking-[0.12em] text-ink">
                Panier
                {nbArticles > 0 ? (
                  <span className="ml-2 font-sans text-sm tracking-normal text-ink-muted">
                    {nbArticles} article{nbArticles > 1 ? 's' : ''}
                  </span>
                ) : null}
              </h2>

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Fermer le panier"
                className="-mr-2 flex h-11 w-11 items-center justify-center text-ink-muted transition-colors duration-200 hover:text-ink"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
                <EvoraTree size={88} className="text-sand" />
                <div className="flex flex-col gap-1.5">
                  <p className="font-display text-base text-ink">Votre panier est vide</p>
                  <p className="text-sm text-ink-muted">
                    Parcourez le catalogue et ajoutez les pièces qui vous plaisent.
                  </p>
                </div>
                <Button to="/catalogue" variant="secondary" size="md" onClick={onClose}>
                  Voir le catalogue
                </Button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-greige overflow-y-auto px-4 sm:px-6">
                  {items.map((line) => {
                    const key = lineKey(line.productId, line.couleur);
                    return (
                      <li key={key} className="flex gap-3 py-4">
                        <Link to={`/produit/${line.slug}`} onClick={onClose} className="w-20 shrink-0">
                          <ProductImage src={line.image} alt={line.nom} sizes="80px" />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <Link
                            to={`/produit/${line.slug}`}
                            onClick={onClose}
                            className="line-clamp-2 text-sm leading-snug text-ink hover:text-gold-deep"
                          >
                            {line.nom}
                          </Link>

                          <span className="text-[12px] uppercase tracking-[0.15em] text-ink-muted">
                            Réf {line.ref}
                            {line.couleur ? ` · ${line.couleur}` : ''}
                          </span>

                          <span className="text-sm tabular-nums text-gold-deep">
                            {formatPrice(line.prix)}
                          </span>

                          <div className="mt-1 flex items-center justify-between gap-2">
                            <div className="flex items-center rounded-sm border border-greige">
                              <button
                                type="button"
                                onClick={() => setQuantity(key, line.quantite - 1)}
                                disabled={line.quantite <= 1}
                                aria-label="Diminuer la quantité"
                                className="flex h-11 w-11 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-35"
                              >
                                <Minus size={15} strokeWidth={1.5} />
                              </button>

                              <span className="w-8 text-center text-sm tabular-nums text-ink" aria-live="polite">
                                {line.quantite}
                              </span>

                              <button
                                type="button"
                                onClick={() => setQuantity(key, line.quantite + 1)}
                                disabled={line.quantite >= 20}
                                aria-label="Augmenter la quantité"
                                className="flex h-11 w-11 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-35"
                              >
                                <Plus size={15} strokeWidth={1.5} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => remove(key)}
                              aria-label={`Retirer ${line.nom} du panier`}
                              className="flex h-11 w-11 items-center justify-center text-ink-muted transition-colors hover:text-[#8C2F1F]"
                            >
                              <Trash2 size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <footer className="border-t border-greige px-4 py-4 sm:px-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-ink-muted">Sous-total</span>
                    <span className="text-lg tabular-nums text-gold-deep">{formatPrice(sousTotal)}</span>
                  </div>

                  <p className="mt-1 text-sm text-ink-muted">
                    Livraison calculée à l&apos;étape suivante, selon votre wilaya.
                  </p>

                  <div className="mt-4 flex flex-col gap-2">
                    <Button to="/commande" onClick={onClose} variant="primary" size="lg" full>
                      Commander
                    </Button>
                    <Button to="/panier" onClick={onClose} variant="secondary" size="md" full>
                      Voir le panier
                    </Button>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
