import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Minus, Plus, Check, Search, Truck, ShieldCheck } from 'lucide-react';

import api from '../lib/api';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { useSettings } from '../lib/settings';
import { formatPhone, toInternational } from '../lib/format';
import { whatsappProductLink } from '../brand';

import ProductImage from '../Components/UI/ProductImage';
import ZoomImage from '../Components/Products/ZoomImage';
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
 * than stacking a second one on top of it. Two elements pointing at the same
 * URL made every photo download twice and left the overlay showing a
 * broken-image glyph whenever the file was missing.
 *
 * The main frame magnifies under the cursor. The thumbnails deliberately do
 * not: a zoom on an 80px tile shows nothing, and the hover would fight the
 * click that selects it.
 */
function Gallery({ images, nom }) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  const ordered = [...(images || [])].sort((a, b) => a.ordre - b.ordre);
  const current = ordered[index];

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
      <div className="relative">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={current?.url || index}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
          >
            <ZoomImage
              src={current?.url}
              alt={current?.alt || nom}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            >
              {/* Only shown where the interaction exists. It disappears while
                  zooming so it never sits on top of what is being inspected. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-xs bg-forest/80 px-2.5 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] text-cream opacity-100 transition-opacity duration-300 [@media(hover:hover)]:flex"
              >
                <Search size={13} strokeWidth={1.6} />
                Survolez pour agrandir
              </span>
            </ZoomImage>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* A single-image product gets no thumbnail strip. A strip of one is a
          control that does nothing. */}
      {ordered.length > 1 ? (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
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

/** A section heading inside the detail column. */
function SpecHeading({ children, ...props }) {
  return (
    <h2 {...props} className="font-sans text-[12px] uppercase tracking-[0.18em] text-ink-muted">
      {children}
    </h2>
  );
}

/**
 * The dimensions spec block. Three figures in a row, large, tabular. Not a
 * 10-row table with a hairline under every line: that is the laziest possible
 * layout for a spec sheet and it reads as filler.
 *
 * The figures share one bordered box divided by hairlines rather than sitting
 * in three separate boxes, so they read as one measurement of one object.
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
    <section aria-labelledby="dimensions-heading">
      <SpecHeading id="dimensions-heading">Dimensions</SpecHeading>

      <dl
        className={`mt-4 grid gap-px overflow-hidden rounded-sm border border-greige bg-greige ${
          rows.length === 3 ? 'grid-cols-3' : rows.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {rows.map((row) => (
          <div key={row.label} className="bg-cream px-3 py-4 text-center">
            <dt className="font-sans text-[12px] uppercase tracking-[0.12em] text-ink-muted">
              {row.label}
            </dt>
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

/**
 * The two promises that decide whether somebody orders: how it is paid and how
 * it arrives. They were previously one grey paragraph at the very bottom of the
 * column, which is where text goes to not be read.
 */
function Reassurance({ delai }) {
  const items = [
    {
      icon: ShieldCheck,
      title: 'Paiement à la livraison',
      body: 'Vous payez en espèces au moment où vous recevez la pièce.',
    },
    {
      icon: Truck,
      title: delai ? `Livraison sous ${delai}` : 'Livraison dans les 58 wilayas',
      body: 'Les frais dépendent de votre wilaya et sont affichés avant la confirmation.',
    },
  ];

  return (
    <ul className="flex flex-col gap-px overflow-hidden rounded-sm border border-greige bg-greige">
      {items.map(({ icon: Icon, title, body }) => (
        <li key={title} className="flex gap-3 bg-cream p-4">
          <Icon size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold" />
          <div>
            <p className="text-base leading-snug text-ink">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{body}</p>
          </div>
        </li>
      ))}
    </ul>
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

        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-sans text-[12px] uppercase tracking-[0.22em] text-gold-deep">
                Réf {product.ref}
              </span>
              <AvailabilityBadge disponibilite={product.disponibilite} />
            </div>

            <h1 className="font-display text-[clamp(1.35rem,3vw,2rem)] leading-[1.2] tracking-[0.06em] text-ink">
              {product.nom}
            </h1>

            <span aria-hidden="true" className="mt-1 block h-px w-12 bg-gold" />

            <Price
              value={product.prix}
              ancienPrix={product.ancienPrix}
              size="lg"
              className="mt-2"
            />
          </header>

          {product.description ? (
            <p className="max-w-prose text-base leading-relaxed text-ink">{product.description}</p>
          ) : null}

          {/* Colours sit with the buy controls rather than in the spec list,
              because choosing one is part of ordering, not part of reading. */}
          {product.couleurs?.length ? (
            <fieldset className="border-0 p-0">
              <legend className="font-sans text-[12px] uppercase tracking-[0.18em] text-ink-muted">
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
          <div className="flex flex-col gap-3">
            {rupture ? (
              <p className="rounded-sm border border-greige bg-greige/25 px-4 py-3 text-base leading-relaxed text-ink">
                Cette pièce est en rupture. Appelez-nous au{' '}
                <a
                  href={`tel:+${toInternational(settings.telephone)}`}
                  className="tabular-nums text-gold-deep underline decoration-gold decoration-1 underline-offset-4"
                >
                  {formatPhone(settings.telephone)}
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

                    <span
                      className="w-10 text-center text-base tabular-nums text-ink"
                      aria-live="polite"
                    >
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
          </div>

          <Reassurance delai={product.delaiLivraison} />

          {/* Specs last: whoever is still reading wants the numbers. */}
          <div className="flex flex-col gap-6 border-t border-greige pt-8">
            <Dimensions dimensions={product.dimensions} />

            {product.materiaux?.length ? (
              <section aria-labelledby="materiaux-heading">
                <SpecHeading id="materiaux-heading">Matériaux</SpecHeading>
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
