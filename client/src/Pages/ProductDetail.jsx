import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Minus, Plus, Check, ChevronRight, Truck, Banknote, Store } from 'lucide-react';

import api from '../lib/api';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { useSettings } from '../lib/settings';
import { formatPhone, toInternational } from '../lib/format';
import { whatsappProductLink } from '../brand';

import ProductImage from '../Components/UI/ProductImage';
import Price from '../Components/UI/Price';
import Button from '../Components/UI/Button';
import SectionHeading from '../Components/UI/SectionHeading';
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
 * measuring a wall wants the numbers before anything else.
 *
 * The page is two columns from `lg`: the gallery sticks while the specification
 * column scrolls past it, because a furniture buyer reads the measurements
 * while looking at the piece, not after it has scrolled off the top.
 *
 * Everything in the right-hand column sits in one divided stack. The previous
 * pass gave each block its own top border *and* a parent gap, which stacked a
 * 24px gap, a hairline and 24px of padding between every pair of blocks and
 * left the column looking like it had come apart.
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
  const current = ordered[index] || ordered[0];

  // A product whose gallery shrinks between navigations must not keep an index
  // that no longer exists.
  useEffect(() => setIndex(0), [nom]);

  return (
    <div className="flex flex-col gap-3">
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
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* A single-image product gets no thumbnail strip. A strip of one is a
          control that does nothing. */}
      {ordered.length > 1 ? (
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {ordered.map((image, i) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Voir la photo ${i + 1}`}
                aria-current={i === index}
                className={`block w-full overflow-hidden rounded-sm border transition-colors duration-200 ${
                  i === index ? 'border-gold' : 'border-greige hover:border-sand'
                }`}
              >
                <ProductImage
                  src={image.url}
                  alt=""
                  aspect="aspect-square"
                  sizes="90px"
                  className="rounded-none border-0"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** One block in the specification stack. Uniform padding, one hairline. */
function Block({ title, children, className = '' }) {
  return (
    <section className={`py-6 ${className}`}>
      {title ? (
        <h2 className="text-[12px] uppercase tracking-[0.18em] text-ink-muted">{title}</h2>
      ) : null}
      {children}
    </section>
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
    <Block title="Dimensions">
      <dl className="mt-4 grid grid-cols-3 divide-x divide-greige rounded-sm border border-greige">
        {rows.map((row) => (
          <div key={row.label} className="px-2 py-4 text-center">
            <dt className="text-[12px] uppercase tracking-[0.12em] text-ink-muted">{row.label}</dt>
            <dd className="mt-1.5 font-sans text-xl tabular-nums text-ink">
              {row.value}
              <span className="ml-1 text-sm text-ink-muted">{dimensions.unite || 'cm'}</span>
            </dd>
          </div>
        ))}
      </dl>
    </Block>
  );
}

/** The three facts that decide whether an Algerian customer completes an order. */
function Reassurance({ settings }) {
  const rows = [
    { Icon: Banknote, text: 'Paiement à la livraison, en espèces. Aucune donnée bancaire demandée.' },
    {
      Icon: Truck,
      text: 'Livraison dans les 58 wilayas. Les frais dépendent de votre wilaya et sont affichés avant la confirmation.',
    },
    { Icon: Store, text: `Pièce visible au showroom, ${settings.adresse}.` },
  ];

  return (
    <Block>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.text} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
            <row.Icon size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold" />
            <span>{row.text}</span>
          </li>
        ))}
      </ul>
    </Block>
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
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-5 sm:px-6 lg:px-10">
      {/* Breadcrumb. A 44px row per crumb turned this into a band of its own;
          the whole trail is one line of 14px text with 8px of breathing room. */}
      <nav
        aria-label="Fil d'Ariane"
        className="mb-6 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-ink-muted"
      >
        <Link to="/catalogue" className="py-1 transition-colors hover:text-ink">
          Catalogue
        </Link>
        {product.categoryId?.slug ? (
          <>
            <ChevronRight size={14} strokeWidth={1.5} aria-hidden="true" className="text-greige" />
            <Link to={`/catalogue/${product.categoryId.slug}`} className="py-1 transition-colors hover:text-ink">
              {product.categoryId.nom}
            </Link>
          </>
        ) : null}
        <ChevronRight size={14} strokeWidth={1.5} aria-hidden="true" className="text-greige" />
        <span className="truncate py-1 text-ink">{product.nom}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          {/* The navbar is 72px on mobile and 108px on desktop; 7rem clears it
              with the page's own breathing room on top. */}
          <div className="lg:sticky lg:top-28">
            <Gallery images={product.images} nom={product.nom} />
          </div>
        </div>

        <div className="lg:col-span-5">
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-sans text-[12px] uppercase tracking-[0.22em] text-gold-deep">
                Réf {product.ref}
              </span>
              <AvailabilityBadge disponibilite={product.disponibilite} />
              {product.isNouveau && !rupture ? (
                <span className="text-[12px] uppercase tracking-[0.18em] text-ink-muted">Nouveauté</span>
              ) : null}
            </div>

            <h1 className="mt-4 font-display text-xl leading-tight tracking-[0.06em] text-ink sm:text-2xl">
              {product.nom}
            </h1>

            <span aria-hidden="true" className="mt-5 block h-px w-12 bg-gold" />

            <Price value={product.prix} ancienPrix={product.ancienPrix} size="lg" className="mt-5" />

            {product.delaiLivraison ? (
              <p className="mt-2 text-sm text-ink-muted">Livraison sous {product.delaiLivraison}</p>
            ) : null}

            {product.description ? (
              <p className="mt-5 max-w-prose text-base leading-relaxed text-ink">{product.description}</p>
            ) : null}
          </header>

          {/* One divided stack. Uniform 24px of padding on both sides of every
              hairline, and exactly one hairline between any two blocks. */}
          <div className="mt-6 flex flex-col divide-y divide-greige border-t border-greige">
            <Dimensions dimensions={product.dimensions} />

            {product.materiaux?.length ? (
              <Block title="Matériaux">
                <ul className="mt-3 flex flex-wrap gap-2">
                  {product.materiaux.map((m) => (
                    <li key={m} className="rounded-xs border border-greige px-2.5 py-1 text-sm text-ink">
                      {m}
                    </li>
                  ))}
                </ul>
              </Block>
            ) : null}

            {product.couleurs?.length ? (
              <Block>
                <fieldset className="border-0 p-0">
                  <legend className="text-[12px] uppercase tracking-[0.18em] text-ink-muted">
                    Coloris
                    {couleur ? (
                      <span className="ml-2 normal-case tracking-normal text-ink">{couleur}</span>
                    ) : null}
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
                          className={`flex min-h-[44px] items-center gap-2.5 rounded-sm border px-3 transition-colors duration-200 ${
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
              </Block>
            ) : null}

            {/* Buy */}
            <Block>
              {rupture ? (
                <p className="rounded-sm border border-greige bg-greige/25 px-4 py-3 text-base leading-relaxed text-ink">
                  Cette pièce est en rupture. Appelez-nous au{' '}
                  <a
                    href={`tel:+${toInternational(settings.telephone)}`}
                    className="tabular-nums text-gold-deep underline decoration-gold underline-offset-4"
                  >
                    {formatPhone(settings.telephone)}
                  </a>{' '}
                  pour connaître le prochain arrivage.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-stretch gap-3">
                    <div className="flex items-center rounded-sm border border-greige">
                      <button
                        type="button"
                        onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                        disabled={quantite <= 1}
                        aria-label="Diminuer la quantité"
                        className="flex h-[54px] w-12 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-35"
                      >
                        <Minus size={16} strokeWidth={1.5} />
                      </button>

                      <span className="w-9 text-center text-base tabular-nums text-ink" aria-live="polite">
                        {quantite}
                      </span>

                      <button
                        type="button"
                        onClick={() => setQuantite((q) => Math.min(20, q + 1))}
                        disabled={quantite >= 20}
                        aria-label="Augmenter la quantité"
                        className="flex h-[54px] w-12 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-35"
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

                  {/* The WhatsApp fallback. Many customers will never use the
                      cart at all, so this carries the reference code into the
                      chat. */}
                  <Button
                    href={whatsappProductLink(product, settings.whatsapp)}
                    target="_blank"
                    rel="noreferrer noopener"
                    variant="secondary"
                    size="lg"
                  >
                    Commander via WhatsApp
                  </Button>

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
                </div>
              )}
            </Block>

            <Reassurance settings={settings} />
          </div>
        </div>
      </div>

      {similaires.length ? (
        <>
          <SectionDivider className="mt-20" />

          <section className="mt-16">
            <SectionHeading
              title="Dans la même collection"
              as="h2"
              actionLabel="Tout le catalogue"
              actionTo={product.categoryId?.slug ? `/catalogue/${product.categoryId.slug}` : '/catalogue'}
            />
            <div className="mt-10">
              <ProductGrid products={similaires} priorityCount={0} />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
