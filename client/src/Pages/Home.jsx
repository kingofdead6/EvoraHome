import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, MapPin, ArrowRight } from 'lucide-react';

import api from '../lib/api';
import { useSettings } from '../lib/settings';
import { formatPhone, toInternational } from '../lib/format';
import { brand } from '../brand';
import { useI18n } from '../lib/i18n';

import SectionDivider from '../Components/Brand/SectionDivider';
import ProductGrid from '../Components/Products/ProductGrid';
import ProductImage from '../Components/UI/ProductImage';
import Button from '../Components/UI/Button';
import { ProductGridSkeleton } from '../Components/UI/States';
import {
  revealVariants,
  revealTransition,
  viewportOnce,
  wordContainer,
  wordItem,
  useReducedMotion,
} from '../lib/motion';

import HeroBg from '../assets/HeroBg.png';
import ShowroomImage from '../assets/ShopImg.png';
/**
 * A heading whose words rise out of a clipped line, one after the next.
 *
 * Each word gets its own overflow-hidden span so the mask is the line box
 * itself. The whole string stays in the DOM as one text node per word, so a
 * screen reader still reads "Les pièces du moment" and not four fragments.
 */
function WordReveal({ text, className = '' }) {
  const reduced = useReducedMotion();

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={wordContainer}
      className={className}
      aria-label={text}
    >
      {text.split(' ').map((word, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          aria-hidden="true"
          // inline-flex keeps the mask tight to the line box; the padding gives
          // the descenders somewhere to live so they are not clipped at rest.
          className="inline-flex overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span variants={wordItem} className="inline-block">
            {word}
          </motion.span>
          {i < text.split(' ').length - 1 ? <span className="inline-block">&nbsp;</span> : null}
        </span>
      ))}
    </motion.span>
  );
}

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
 * carries an olive overlay at 30% plus a bottom gradient so that any photo the
 * client drops in works, including the phone shots and the mixed white balance.
 */
function Hero({ settings }) {
  const reduced = useReducedMotion();
  const { t } = useI18n();

  return (
    <section className="relative isolate min-h-[70vh] overflow-hidden bg-olive sm:min-h-[76vh]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_top_left,_rgba(247,244,234,0.16),_transparent_35%),linear-gradient(180deg,#5f6d4f_0%,#30371f_100%)]"
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
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-forest/80 to-transparent"
      />

      <div className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col justify-end px-4 pb-14 pt-24 sm:min-h-[76vh] sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
        <motion.div
          initial={reduced ? false : { opacity: 0, transform: 'translateY(18px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.6, delay: reduced ? 0 : 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-2xl"
        >
          <p className="font-sans text-[12px] uppercase tracking-[0.28em] text-sand">
            {brand.descriptor}
          </p>

          <h1 className="mt-5 font-display text-[1.75rem] leading-[1.2] tracking-[0.06em] text-cream sm:text-4xl lg:text-5xl">
            {settings.heroTitle || brand.tagline}
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-sand sm:text-lg">
            {settings.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/catalogue" variant="onOliveSolid" size="lg">
              {t('home.heroCta')}
            </Button>
            <Button to="/showroom" variant="onOlive" size="lg">
              {t('home.heroShowroom')}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Category grid.
 *
 * Seven tiles in a four-column grid would leave an empty cell, and an empty
 * cell is a planning error rather than a style. Giving the first tile two
 * columns makes eight cells for seven tiles, which fills exactly two rows on
 * desktop and exactly four rows at two columns on a phone.
 */
function Categories({ categories, loading }) {
  const { t } = useI18n();
  // Placeholders while the request is in flight. Returning null here meant the
  // featured products, the olive band and the footer all sat near the top of
  // the page and then dropped by the height of this grid.
  if (loading) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="h-7 w-56 animate-pulse rounded-xs bg-greige/60" />
        <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded-xs bg-greige/50" />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className={`animate-pulse rounded-sm border border-greige bg-greige/40 ${
                i === 0 ? 'col-span-2 aspect-[16/9] sm:aspect-[2/1]' : 'aspect-[4/5]'
              }`}
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
        <h2 className="font-display text-xl tracking-[0.12em] text-ink sm:text-2xl">{t('home.collectionsTitle')}</h2>
        <p className="mt-3 max-w-lg text-base text-ink-muted">
          {t('home.collectionsLead')}
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((category, i) => (
          <Reveal
            key={category._id}
            as={motion.div}
            className={i === 0 ? 'col-span-2' : ''}
          >
            <Link
              to={`/catalogue/${category.slug}`}
              className="group relative block h-full overflow-hidden rounded-sm border border-greige focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4"
            >
              <div className={i === 0 ? 'aspect-[16/9] sm:aspect-[2/1]' : 'aspect-[4/5]'}>
                <ProductImage
                  src={category.image}
                  alt=""
                  className="h-full w-full rounded-none border-0"
                  imgClassName="transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover:scale-[1.03]"
                  sizes={i === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
                />
              </div>

              {/*
                Flat overlay plus a bottom gradient. Measured against the
                placeholder the label sits at 5.17:1, but the client's photos
                are inconsistent and some are bright, so the gradient runs to
                95% at the base: the label has to stay legible on a photo
                nobody has taken yet.
              */}
              <span aria-hidden="true" className="absolute inset-0 bg-olive/30" />
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-forest/95 via-forest/70 to-transparent"
              />

              <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 sm:p-5">
                <span className="font-display text-sm tracking-[0.12em] text-cream sm:text-base">
                  {category.nom}
                </span>
                <span className="text-[12px] tracking-[0.05em] text-sand">
                  {category.nbProduits} pièce{category.nbProduits > 1 ? 's' : ''}
                </span>
                <span
                  aria-hidden="true"
                  className="mt-2 h-px w-10 origin-[left_center] rtl:origin-[right_center] bg-gold transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover:scale-x-[2.4]"
                />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/**
 * Featured products — the section the page is built around.
 *
 * The header follows the editorial pattern: a tracked eyebrow, a display
 * heading two steps larger than the section headings above it, and a "shop all"
 * link parked on the baseline at the right. On a phone that link moves below the
 * heading and becomes a full-width tap target rather than a cramped corner one,
 * and the grid falls back to the two-column browse the rest of the site uses.
 */
function FeaturedProducts({ featured, loading }) {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <div className="max-w-xl">
          <p className="font-sans text-[12px] uppercase tracking-[0.28em] text-gold-deep">
            {t('home.featuredEyebrow')}
          </p>

          <h2 className="mt-4 font-display text-[clamp(1.5rem,4vw,2.5rem)] leading-[1.15] tracking-[0.1em] text-ink">
            <WordReveal text={t('home.featuredTitle')} />
          </h2>

          {/* The gold hairline that the rest of the site uses to mark a heading. */}
          <span aria-hidden="true" className="mt-6 block h-px w-16 bg-gold" />

          <p className="mt-6 text-base leading-relaxed text-ink-muted">
            {t('home.featuredLead')}
          </p>
        </div>

        <Link
          to="/catalogue"
          className="group inline-flex min-h-[44px] shrink-0 items-center gap-3 self-start text-sm uppercase tracking-[0.15em] text-ink sm:self-auto sm:pb-1"
        >
          <span className="underline decoration-gold decoration-1 underline-offset-4 transition-[text-decoration-thickness] group-hover:decoration-2">
            {t('home.allCatalogue')}
          </span>
          <ArrowRight
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
            className="text-gold-deep transition-transform duration-300 ease-out-strong motion-safe:[@media(hover:hover)]:group-hover:translate-x-1"
          />
        </Link>
      </Reveal>

      <div className="mt-12 lg:mt-16">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : featured.length ? (
          <ProductGrid products={featured} offset parallax />
        ) : (
          <p className="text-base text-ink-muted">
            {t('home.featuredEmpty')}
          </p>
        )}
      </div>

      {/* On a phone the header link sits far above the fold by the time the
          customer has scrolled eight cards, so the exit repeats at the bottom. */}
      {!loading && featured.length ? (
        <Reveal className="mt-12 flex justify-center sm:hidden">
          <Button to="/catalogue" variant="secondary" size="md" full>
            {t('home.allCatalogue')}
          </Button>
        </Reveal>
      ) : null}
    </section>
  );
}

/** The olive band. The physical shop is what makes an Algerian customer trust a site. */
function ShowroomBand({ settings }) {
  const { t } = useI18n();
  return (
    <section className="bg-olive text-cream">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="font-display text-xl tracking-[0.12em] text-cream sm:text-2xl">
              {t('home.showroomTitle')}
            </h2>

            <p className="mt-5 max-w-md text-base leading-relaxed text-sand">
              {t('home.showroomLead')}
            </p>

            <dl className="mt-8 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin size={17} strokeWidth={1.5} className="mt-1 shrink-0 text-gold" />
                <div>
                  <dt className="sr-only">{t('showroom.address')}</dt>
                  <dd className="text-base text-cream">{settings.adresse}</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={17} strokeWidth={1.5} className="mt-1 shrink-0 text-gold" />
                <div>
                  <dt className="sr-only">{t('showroom.hours')}</dt>
                  <dd className="text-base text-sand">{settings.horaires}</dd>
                </div>
              </div>
            </dl>

            <div className="mt-8">
              <Button to="/showroom" variant="onOlive" size="md">
                {t('home.showroomCta')}
              </Button>
            </div>
          </Reveal>

          <Reveal>
            <ProductImage
              src={ShowroomImage}
              alt={t('showroom.imageAlt')}
              className="aspect-[4/3] border-sand/25"
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
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10">
      <Reveal className="flex flex-col items-start justify-between gap-6 border-t border-greige pt-10 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-base tracking-[0.12em] text-ink">{t('home.contactTitle')}</h2>
          <p className="mt-2 max-w-md text-base text-ink-muted">
            {t('home.contactLead')}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button href={`tel:+${toInternational(settings.telephone)}`} variant="primary" size="md">
            {formatPhone(settings.telephone)}
          </Button>
          <Button to="/contact" variant="secondary" size="md">
            {t('common.write')}
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
      api.products({ featured: 'true', limit: 8 }, controller.signal).catch(() => ({ products: [] })),
    ])
      .then(([cats, prods]) => {
        setCategories(cats || []);
        setFeatured(prods?.products || []);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <>
      <Hero settings={settings} />

      <Categories categories={categories} loading={loading} />

      <SectionDivider className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10" />

      <FeaturedProducts featured={featured} loading={loading} />

      <ShowroomBand settings={settings} />

      <ContactStrip settings={settings} />
    </>
  );
}
