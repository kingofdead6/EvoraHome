import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock } from 'lucide-react';

import api from '../lib/api';
import { useSettings } from '../lib/settings';
import { formatPhone, toInternational } from '../lib/format';
import { brand } from '../brand';

import SectionDivider from '../Components/Brand/SectionDivider';
import ProductGrid from '../Components/Products/ProductGrid';
import ProductImage from '../Components/UI/ProductImage';
import SectionHeading from '../Components/UI/SectionHeading';
import Price from '../Components/UI/Price';
import Button from '../Components/UI/Button';
import { AvailabilityBadge } from '../Components/UI/Badge';
import { ProductGridSkeleton } from '../Components/UI/States';
import { revealVariants, revealTransition, viewportOnce, useReducedMotion } from '../lib/motion';

import HeroBg from '../assets/HeroBg.webp';
import ShowroomImage from '../assets/ShopImg.webp';

function Reveal({ children, className = '', as: Component = motion.div }) {
  const reduced = useReducedMotion();
  return (
    <Component
      initial={reduced ? false : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={viewportOnce}
      variants={revealVariants}
      transition={revealTransition}
      className={className}
    >
      {children}
    </Component>
  );
}

/**
 * Hero.
 *
 * One of only two places on the site where large photography is used, and it
 * carries an olive overlay plus a bottom gradient so that any photo the client
 * drops in works, including the phone shots and the mixed white balance.
 */
function Hero({ settings }) {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate min-h-[72vh] overflow-hidden bg-olive sm:min-h-[80vh]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-30 bg-[linear-gradient(180deg,#5f6d4f_0%,#30371f_100%)]"
      />
      <img
        src={HeroBg}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-olive/70" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-forest/90 via-forest/45 to-transparent"
      />

      {/* A matted print: one gold hairline inset from the edges of the band.
          It is the single decorative element in the hero and it is 1px wide. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 -z-10 hidden border border-gold/20 lg:block"
      />

      <div className="mx-auto flex min-h-[72vh] max-w-[1400px] flex-col justify-end px-4 pb-14 pt-24 sm:min-h-[80vh] sm:px-6 sm:pb-20 lg:px-14 lg:pb-24">
        <motion.div
          initial={reduced ? false : { opacity: 0, transform: 'translateY(18px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.6, delay: reduced ? 0 : 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-2xl"
        >
          <p className="font-sans text-[12px] uppercase tracking-[0.28em] text-sand">
            {brand.descriptor}
          </p>

          <span aria-hidden="true" className="mt-5 block h-px w-16 bg-gold" />

          <h1 className="mt-5 font-display text-[1.75rem] leading-[1.2] tracking-[0.06em] text-cream sm:text-4xl lg:text-5xl">
            {settings.heroTitle || brand.tagline}
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-sand sm:text-lg">
            {settings.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/catalogue" variant="onOliveSolid" size="lg">
              Voir le catalogue
            </Button>
            <Button to="/showroom" variant="onOlive" size="lg">
              Notre showroom
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * The collections mosaic.
 *
 * Seven tiles in an even four-column grid leaves an empty cell, and an empty
 * cell is a planning error rather than a style. This lays them out on a twelve
 * column grid with fixed row heights instead: one tall opening tile, one wide
 * tile beside it, then a pair and a trio. Every cell is filled at every
 * breakpoint, and no two rows have the same rhythm, which is what makes it read
 * as a spread rather than as a grid of thumbnails.
 *
 * At two columns the same seven tiles fall into four exact rows.
 */
const TILE_SPANS = [
  'col-span-2 aspect-[16/10] lg:col-span-6 lg:row-span-2 lg:aspect-auto',
  'aspect-[4/5] lg:col-span-6 lg:aspect-auto',
  'aspect-[4/5] lg:col-span-3 lg:aspect-auto',
  'aspect-[4/5] lg:col-span-3 lg:aspect-auto',
  'aspect-[4/5] lg:col-span-4 lg:aspect-auto',
  'aspect-[4/5] lg:col-span-4 lg:aspect-auto',
  'aspect-[4/5] lg:col-span-4 lg:aspect-auto',
];
const TILE_FALLBACK = 'aspect-[4/5] lg:col-span-4 lg:aspect-auto';

const GRID = 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:auto-rows-[14rem] lg:gap-5';

function CategoryTile({ category, index }) {
  const lead = index === 0;

  return (
    <Reveal as={motion.div} className={TILE_SPANS[index] || TILE_FALLBACK}>
      <Link
        to={`/catalogue/${category.slug}`}
        className="group relative block h-full overflow-hidden rounded-sm border border-greige focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4"
      >
        <ProductImage
          src={category.image}
          alt=""
          className="h-full w-full rounded-none border-0"
          imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover:scale-[1.04]"
          sizes={lead ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 33vw, 50vw'}
        />

        {/*
          Flat overlay plus a bottom gradient. The client's photos are
          inconsistent and some are bright, so the gradient runs to 95% at the
          base: the label has to stay legible on a photo nobody has taken yet.
        */}
        <span aria-hidden="true" className="absolute inset-0 bg-olive/30" />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-forest/95 via-forest/65 to-transparent"
        />

        {/* The matted-print hairline, drawn on hover only. */}
        <span
          aria-hidden="true"
          className="absolute inset-2.5 rounded-xs border border-cream/0 transition-colors duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover:border-cream/25 sm:inset-3"
        />

        <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 sm:p-5">
          <span
            className={`font-display tracking-[0.12em] text-cream ${
              lead ? 'text-base sm:text-xl' : 'text-sm sm:text-base'
            }`}
          >
            {category.nom}
          </span>
          <span className="text-[12px] tracking-[0.05em] text-sand">
            {category.nbProduits} pièce{category.nbProduits > 1 ? 's' : ''}
          </span>
          <span
            aria-hidden="true"
            className="mt-2 h-px w-10 origin-left bg-gold transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover:scale-x-[2.6]"
          />
        </span>
      </Link>
    </Reveal>
  );
}

function Categories({ categories, loading }) {
  // Placeholders while the request is in flight. Returning null here meant the
  // featured products, the olive band and the footer all sat near the top of
  // the page and then dropped by the height of this grid.
  if (loading) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="h-7 w-56 animate-pulse rounded-xs bg-greige/60" />
        <div className="mt-4 h-5 w-80 max-w-full animate-pulse rounded-xs bg-greige/50" />
        <div className={`mt-10 ${GRID}`}>
          {TILE_SPANS.map((span, i) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className={`animate-pulse rounded-sm border border-greige bg-greige/40 ${span}`}
            />
          ))}
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <Reveal>
        <SectionHeading
          title="Nos collections"
          intro="Sept familles de pièces, du salon complet à l'objet qui termine une pièce."
          actionLabel="Tout le catalogue"
          actionTo="/catalogue"
        />
      </Reveal>

      <div className={`mt-10 ${GRID}`}>
        {categories.map((category, i) => (
          <CategoryTile key={category._id} category={category} index={i} />
        ))}
      </div>
    </section>
  );
}

/**
 * The opening piece of the selection.
 *
 * One product, given the room a showroom would give it: the photograph at half
 * the page, the reference code, the price and the measurements right beside it.
 * The rest of the selection follows underneath in the ordinary grid, so this
 * reads as the piece in the window rather than as a card that got bigger.
 */
function FeaturedPiece({ product }) {
  const d = product.dimensions || {};
  const measures = [
    d.largeur ? { label: 'L', value: d.largeur } : null,
    d.profondeur ? { label: 'P', value: d.profondeur } : null,
    d.hauteur ? { label: 'H', value: d.hauteur } : null,
  ].filter(Boolean);

  return (
    <Reveal className="grid gap-6 border border-greige bg-cream p-4 sm:gap-8 sm:p-6 lg:grid-cols-2 lg:gap-12 lg:p-8">
      <Link
        to={`/produit/${product.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="group block overflow-hidden rounded-sm"
      >
        <ProductImage
          src={product.images?.[0]?.url}
          alt=""
          priority
          aspect="aspect-[4/5] lg:aspect-[5/6]"
          imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 45vw, 100vw"
        />
      </Link>

      <div className="flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-sans text-[12px] uppercase tracking-[0.22em] text-gold-deep">
            Réf {product.ref}
          </span>
          <AvailabilityBadge disponibilite={product.disponibilite} />
        </div>

        <h3 className="mt-4 font-display text-xl leading-tight tracking-[0.06em] text-ink sm:text-2xl">
          <Link
            to={`/produit/${product.slug}`}
            className="underline decoration-transparent decoration-1 underline-offset-8 transition-colors duration-300 hover:decoration-gold"
          >
            {product.nom}
          </Link>
        </h3>

        <Price value={product.prix} ancienPrix={product.ancienPrix} size="lg" className="mt-4" />

        {product.description ? (
          <p className="mt-5 line-clamp-4 max-w-prose text-base leading-relaxed text-ink-muted">
            {product.description}
          </p>
        ) : null}

        {measures.length ? (
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-greige pt-5">
            {measures.map((m) => (
              <div key={m.label} className="flex items-baseline gap-2">
                <dt className="text-[12px] uppercase tracking-[0.18em] text-ink-muted">{m.label}</dt>
                <dd className="font-sans text-lg tabular-nums text-ink">
                  {m.value}
                  <span className="ml-1 text-sm text-ink-muted">{d.unite || 'cm'}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button to={`/produit/${product.slug}`} variant="primary" size="md">
            Voir la pièce
          </Button>
          <Button to="/showroom" variant="secondary" size="md">
            La voir au showroom
          </Button>
        </div>
      </div>
    </Reveal>
  );
}

/** The olive band. The physical shop is what makes an Algerian customer trust a site. */
function ShowroomBand({ settings }) {
  const facts = [
    { Icon: MapPin, term: 'Adresse', value: settings.adresse },
    { Icon: Clock, term: 'Horaires', value: settings.horaires },
    { Icon: Phone, term: 'Téléphone', value: formatPhone(settings.telephone) },
  ];

  return (
    <section className="bg-olive text-cream">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading
              tone="cream"
              eyebrow="El Khroub, Constantine"
              title="Venez voir, toucher, vous asseoir"
              intro="Une photo ne dit pas la fermeté d'une assise ni la vraie couleur d'un tissu. Notre showroom d'El Khroub est ouvert six jours sur sept et nos pièces y sont montées."
            />

            <dl className="mt-8 flex flex-col divide-y divide-sand/15 border-y border-sand/15">
              {facts.map(({ Icon, term, value }) => (
                <div key={term} className="flex items-start gap-4 py-4">
                  <Icon size={17} strokeWidth={1.5} className="mt-1 shrink-0 text-gold" />
                  <div className="min-w-0">
                    <dt className="text-[12px] uppercase tracking-[0.18em] text-sand/80">{term}</dt>
                    <dd className="mt-1 text-base leading-relaxed text-cream">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/showroom" variant="onOliveSolid" size="md">
                Voir le showroom
              </Button>
              <Button href={`tel:+${toInternational(settings.telephone)}`} variant="onOlive" size="md">
                Nous appeler
              </Button>
            </div>
          </Reveal>

          <Reveal className="relative">
            {/* The hairline sits behind and offset, so the photograph reads as
                mounted rather than pasted onto the band. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-4 -right-4 hidden h-full w-full rounded-sm border border-gold/35 lg:block"
            />
            <ProductImage
              src={ShowroomImage}
              alt="Le showroom Evora Home à El Khroub"
              aspect="aspect-[4/3]"
              className="relative border-sand/25"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Contact strip. One row, real information, no form. The form lives on /contact. */
function ContactStrip({ settings }) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10">
      <Reveal className="flex flex-col items-start justify-between gap-6 border-t border-greige pt-10 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-base tracking-[0.12em] text-ink">
            Une question sur une pièce ?
          </h2>
          <p className="mt-2 max-w-md text-base text-ink-muted">
            Appelez-nous pour les dimensions, les délais ou une commande sur mesure.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button href={`tel:+${toInternational(settings.telephone)}`} variant="primary" size="md">
            {formatPhone(settings.telephone)}
          </Button>
          <Button to="/contact" variant="secondary" size="md">
            Nous écrire
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

export default function Home() {
  const settings = useSettings();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      api.categories(controller.signal).catch(() => []),
      // One lead piece plus two full rows of four underneath it.
      api.products({ featured: 'true', limit: 9 }, controller.signal).catch(() => ({ products: [] })),
    ])
      .then(([cats, prods]) => {
        setCategories(cats || []);
        setFeatured(prods?.products || []);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const [lead, ...rest] = featured;

  return (
    <>
      <Hero settings={settings} />

      <Categories categories={categories} loading={loading} />

      <SectionDivider className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10" />

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <Reveal>
          <SectionHeading
            title="Sélection"
            intro="Les pièces que nous montrons en premier au showroom."
            actionLabel="Tout le catalogue"
            actionTo="/catalogue"
          />
        </Reveal>

        {loading ? (
          <div className="mt-10">
            <ProductGridSkeleton count={8} />
          </div>
        ) : lead ? (
          <div className="mt-10 flex flex-col gap-12 lg:gap-16">
            <FeaturedPiece product={lead} />
            {rest.length ? <ProductGrid products={rest} priorityCount={0} /> : null}
          </div>
        ) : (
          <p className="mt-10 text-base text-ink-muted">
            Le catalogue arrive. Appelez-nous en attendant, nous avons tout en showroom.
          </p>
        )}
      </section>

      <ShowroomBand settings={settings} />

      <ContactStrip settings={settings} />
    </>
  );
}
