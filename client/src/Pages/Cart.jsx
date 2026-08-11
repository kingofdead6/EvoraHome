import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';

import { useCart } from '../lib/cart';
import { formatPrice } from '../lib/format';
import ProductImage from '../Components/UI/ProductImage';
import Button from '../Components/UI/Button';
import { EmptyState } from '../Components/UI/States';

/**
 * The cart page.
 *
 * Same content as the drawer, laid out for a screen rather than a panel. Both
 * exist because the drawer is for "did that work?" and this is for "let me
 * check what I am about to spend".
 */
export default function Cart() {
  const { items, nbArticles, sousTotal, setQuantity, remove, lineKey } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Votre panier est vide"
        message="Parcourez le catalogue et ajoutez les pièces qui vous plaisent. Vous n'avez pas besoin de compte pour commander."
        actionLabel="Voir le catalogue"
        actionTo="/catalogue"
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-10">
      <h1 className="font-display text-xl tracking-[0.12em] text-ink sm:text-2xl">
        Panier
        <span className="ml-3 font-sans text-base tracking-normal text-ink-muted">
          {nbArticles} article{nbArticles > 1 ? 's' : ''}
        </span>
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <ul className="divide-y divide-greige border-y border-greige">
          {items.map((line) => {
            const key = lineKey(line.productId, line.couleur);
            return (
              <li key={key} className="flex gap-4 py-5">
                <Link to={`/produit/${line.slug}`} className="w-24 shrink-0 sm:w-28">
                  <ProductImage src={line.image} alt={line.nom} sizes="112px" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                    Réf {line.ref}
                    {line.couleur ? ` · ${line.couleur}` : ''}
                  </span>

                  <Link
                    to={`/produit/${line.slug}`}
                    className="line-clamp-2 text-base leading-snug text-ink hover:text-gold-deep"
                  >
                    {line.nom}
                  </Link>

                  <span className="text-base tabular-nums text-gold-deep">{formatPrice(line.prix)}</span>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
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

                      <span className="w-9 text-center text-base tabular-nums text-ink" aria-live="polite">
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

                    <div className="flex items-center gap-4">
                      <span className="text-base tabular-nums text-ink">
                        {formatPrice(line.prix * line.quantite)}
                      </span>

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
                </div>
              </li>
            );
          })}
        </ul>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-sm border border-greige p-5">
            <h2 className="font-display text-base tracking-[0.12em] text-ink">Récapitulatif</h2>

            <dl className="mt-5 flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <dt className="text-base text-ink-muted">Sous-total</dt>
                <dd className="text-base tabular-nums text-ink">{formatPrice(sousTotal)}</dd>
              </div>

              <div className="flex items-baseline justify-between">
                <dt className="text-base text-ink-muted">Livraison</dt>
                <dd className="text-[13px] text-ink-muted">Selon votre wilaya</dd>
              </div>
            </dl>

            <p className="mt-4 border-t border-greige pt-4 text-[13px] leading-relaxed text-ink-muted">
              Les frais de livraison sont calculés à l&apos;étape suivante, une fois votre wilaya
              choisie. Vous voyez le total avant de confirmer.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <Button to="/commande" variant="primary" size="lg" full>
                Passer la commande
              </Button>
              <Button to="/catalogue" variant="secondary" size="md" full>
                Continuer mes achats
              </Button>
            </div>

            <p className="mt-4 text-center text-[13px] text-ink-muted">
              Paiement à la livraison. Aucun compte requis.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
