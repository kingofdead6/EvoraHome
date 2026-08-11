import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Minus, Plus, Check } from 'lucide-react';

import api from '../lib/api';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { useSettings } from '../lib/settings';
import { formatPrice } from '../lib/format';
import { whatsappProductLink } from '../brand';

import ProductImage from '../Components/UI/ProductImage';
import Price from '../Components/UI/Price';
import Button from '../Components/UI/Button';
import { AvailabilityBadge } from '../Components/UI/Badge';
import { Loading, ErrorState, EmptyState } from '../Components/UI/States';
import ProductGrid from '../Components/Products/ProductGrid';
import SectionDivider from '../Components/Brand/SectionDivider';
import { EASE_OUT, useReducedMotion } from '../lib/motion';

/**
 * Product detail.
 *
 * The reference code and the dimensions block are the point of this page. The
 * client already publishes both on every Instagram post, and a customer
 * measuring a wall wants the numbers before anything else. They sit above the
 * fold on desktop and directly under the price on a phone.
 */

/**
 * Gallery. Crossfade between images, never a slide.
 *
 * The crossfade happens by re-keying a single image inside the frame rather
 * than stacking a second one on top of ProductImage's. Two elements pointing at
 * the same URL made every photo download twice and left the overlay showing a
 * broken-image glyph whenever the file was missing.
 */
function Gallery({ images, nom }) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  const ordered = [...(images || [])].sort((a, b) => a.ordre - b.ordre);
  const current = ordered[index];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={current?.url || index}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
          >
            <ProductImage
              src={current?.url}
              alt={current?.alt || nom}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* A single-image product gets no thumbnail strip. A strip of one is a
          control that does nothing. */}
      {ordered.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {ordered.map((image, i) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Voir la photo ${i + 1}`}
              aria-current={i === index}
              className={`overflow-hidden rounded-sm border transition-colors duration-200 ${
                i === index ? 'border-gold' : 'border-greige hover:border-sand'
              }`}
            >
              <ProductImage
                src={image.url}
                alt=""
                sizes="80px"
                className="rounded-none border-0"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The dimensions spec block. Three figures in a row, large, tabular. Not a
 * 10-row table with a hairline under every line: that is the laziest possible
 * layout for a spec sheet and it reads as filler.
 */
function Dimensions({ dimensions }) {
  if (!dimensions) return null;

  const rows = [
    { label: 'Largeur', value: dimensions.largeur },
    { label: 'Profondeur', value: dimensions.profondeur },
    { label: 'Hauteur', value: dimensions.hauteur },
  ].filter((r) => r.value);

  if (!rows.length) return null;

  return (
    <section aria-labelledby="dimensions-heading" className="border-t border-greige pt-6">
      <h2 id="dimensions-heading" className="text-[12px] uppercase tracking-[0.18em] text-ink-muted">
        Dimensions
      </h2>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-sm border border-greige px-3 py-4 text-center">
            <dt className="text-[12px] uppercase tracking-[0.12em] text-ink-muted">{row.label}</dt>
            <dd className="mt-1.5 font-sans text-xl tabular-nums text-ink">
              {row.value}
              <span className="ml-1 text-sm text-ink-muted">{dimensions.unite || 'cm'}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { add } = useCart();
  const { isLoggedIn, isFavourite, toggleFavourite } = useAuth();
  const settings = useSettings();

  const [state, setState] = useState({ loading: true, error: null, product: null, similaires: [] });
  const [quantite, setQuantite] = useState(1);
  const [couleur, setCouleur] = useState('');
  const [added, setAdded] = useState(false);

  const load = useCallback(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    api
      .product(slug, controller.signal)
      .then((data) =>
        setState({
          loading: false,
          error: null,
          product: data.product,
          similaires: data.similaires || [],
        })
      )
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState({ loading: false, error: err, product: null, similaires: [] });
      });

    return () => controller.abort();
  }, [slug]);

  useEffect(() => load(), [load]);

  // Reset the per-product choices when navigating between products, otherwise
  // a quantity of 4 carries over to the next piece the customer opens.
  useEffect(() => {
    setQuantite(1);
    setCouleur('');
    setAdded(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  const { loading, error, product, similaires } = state;

  if (loading) return <Loading label="Chargement de la pièce" />;

  if (error?.status === 404) {
    return (
      <EmptyState
        title="Cette pièce est introuvable"
        message="Elle a peut-être été retirée du catalogue. Parcourez les collections ou appelez-nous."
        actionLabel="Voir le catalogue"
        actionTo="/catalogue"
      />
    );
  }

  if (error) return <ErrorState message={error.message} onRetry={load} />;
  if (!product) return null;

  const rupture = product.disponibilite === 'RUPTURE';
  const favourite = isFavourite(product._id);

  const handleAdd = () => {
    add(product, { quantite, couleur });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-6 sm:px-6 lg:px-10">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        <Link to="/catalogue" className="inline-flex min-h-[44px] items-center hover:text-ink">
          Catalogue
        </Link>
        {product.categoryId?.slug ? (
          <>
            <span aria-hidden="true">/</span>
            <Link
              to={`/catalogue/${product.categoryId.slug}`}
              className="inline-flex min-h-[44px] items-center hover:text-ink"
            >
              {product.categoryId.nom}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Gallery images={product.images} nom={product.nom} />

        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-sans text-[12px] uppercase tracking-[0.22em] text-gold-deep">
                Réf {product.ref}
              </span>
              <AvailabilityBadge disponibilite={product.disponibilite} />
            </div>

            <h1 className="font-display text-xl leading-tight tracking-[0.06em] text-ink sm:text-2xl">
              {product.nom}
            </h1>

            <Price value={product.prix} ancienPrix={product.ancienPrix} size="lg" />

            {product.delaiLivraison ? (
              <p className="text-sm text-ink-muted">Livraison sous {product.delaiLivraison}</p>
            ) : null}
          </header>

          {product.description ? (
            <p className="max-w-prose text-base leading-relaxed text-ink">{product.description}</p>
          ) : null}

          <Dimensions dimensions={product.dimensions} />

          {/* Materials */}
          {product.materiaux?.length ? (
            <section aria-labelledby="materiaux-heading" className="border-t border-greige pt-6">
              <h2 id="materiaux-heading" className="text-[12px] uppercase tracking-[0.18em] text-ink-muted">
                Matériaux
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.materiaux.map((m) => (
                  <li
                    key={m}
                    className="rounded-xs border border-greige px-2.5 py-1 text-sm text-ink"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Colours */}
          {product.couleurs?.length ? (
            <fieldset className="border-0 border-t border-greige p-0 pt-6">
              <legend className="text-[12px] uppercase tracking-[0.18em] text-ink-muted">
                Coloris
                {couleur ? <span className="ml-2 normal-case tracking-normal text-ink">{couleur}</span> : null}
              </legend>

              <div className="mt-3 flex flex-wrap gap-2">
                {product.couleurs.map((c) => {
                  const selected = couleur === c.nom;
                  return (
                    <button
                      key={c.nom}
                      type="button"
                      onClick={() => setCouleur(selected ? '' : c.nom)}
                      aria-pressed={selected}
                      title={c.nom}
                      className={`flex min-h-[44px] items-center gap-2 rounded-sm border px-3 transition-colors duration-200 ${
                        selected ? 'border-gold bg-greige/30' : 'border-greige hover:border-sand'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 rounded-xs border border-greige"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-sm text-ink">{c.nom}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {/* Buy */}
          <div className="flex flex-col gap-3 border-t border-greige pt-6">
            {rupture ? (
              <p className="rounded-sm border border-greige bg-greige/25 px-4 py-3 text-base text-ink">
                Cette pièce est en rupture. Appelez-nous au{' '}
                <a
                  href={`tel:+213${String(settings.telephone).replace(/\D/g, '').slice(1)}`}
                  className="text-gold-deep underline decoration-gold underline-offset-4"
                >
                  {settings.telephone}
                </a>{' '}
                pour connaître le prochain arrivage.
              </p>
            ) : (
              <>
                <div className="flex items-stretch gap-3">
                  <div className="flex items-center rounded-sm border border-greige">
                    <button
                      type="button"
                      onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                      disabled={quantite <= 1}
                      aria-label="Diminuer la quantité"
                      className="flex h-12 w-12 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-35"
                    >
                      <Minus size={16} strokeWidth={1.5} />
                    </button>

                    <span className="w-10 text-center text-base tabular-nums text-ink" aria-live="polite">
                      {quantite}
                    </span>

                    <button
                      type="button"
                      onClick={() => setQuantite((q) => Math.min(20, q + 1))}
                      disabled={quantite >= 20}
                      aria-label="Augmenter la quantité"
                      className="flex h-12 w-12 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-35"
                    >
                      <Plus size={16} strokeWidth={1.5} />
                    </button>
                  </div>

                  <Button onClick={handleAdd} variant="primary" size="lg" className="flex-1">
                    {added ? (
                      <>
                        <Check size={16} strokeWidth={2} />
                        Ajouté au panier
                      </>
                    ) : (
                      'Ajouter au panier'
                    )}
                  </Button>
                </div>

                {/* The WhatsApp fallback. Many customers will never use the cart
                    at all, so this carries the reference code into the chat. */}
                <Button
                  href={whatsappProductLink(product, settings.whatsapp)}
                  target="_blank"
                  rel="noreferrer noopener"
                  variant="secondary"
                  size="lg"
                >
                  Commander via WhatsApp
                </Button>
              </>
            )}

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => toggleFavourite(product._id)}
                className="flex min-h-[44px] items-center gap-2 self-start text-sm uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-ink"
              >
                <Heart
                  size={16}
                  strokeWidth={1.5}
                  className={favourite ? 'fill-gold text-gold' : ''}
                />
                {favourite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </button>
            ) : null}

            <p className="text-sm leading-relaxed text-ink-muted">
              Paiement à la livraison. Les frais de livraison dépendent de votre wilaya et sont
              affichés avant la confirmation de la commande.
            </p>
          </div>
        </div>
      </div>

      {similaires.length ? (
        <>
          <SectionDivider className="mt-20" />

          <section className="mt-16">
            <h2 className="font-display text-lg tracking-[0.12em] text-ink">
              Dans la même collection
            </h2>
            <div className="mt-8">
              <ProductGrid products={similaires} priorityCount={0} />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
