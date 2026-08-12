import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, ArrowRight, Truck, Banknote, Ruler, Armchair } from 'lucide-react';

import { useSettings } from '../lib/settings';
import { formatPhone, toInternational } from '../lib/format';
import { brand, contact } from '../brand';
import {
  revealVariants,
  revealTransition,
  viewportOnce,
  gridContainer,
  gridItem,
  wordContainer,
  wordItem,
  useReducedMotion,
} from '../lib/motion';

import Button from '../Components/UI/Button';
import SectionDivider from '../Components/Brand/SectionDivider';
import EvoraTree from '../Components/Brand/EvoraTree';

import ShowroomImage from '../assets/ShopImg.png';
import HeroBg from '../assets/HeroBg.png';

/**
 * Notre showroom.
 *
 * The physical shop is the trust signal on this site. An Algerian customer
 * paying 289 000 DA cash to a driver wants to know there is a building with a
 * sign on it and a phone somebody answers. That is what this page is for, and
 * it is why there are no invented statistics or testimonials on it.
 *
 * Every photograph here is one the client has actually supplied. The previous
 * version referenced four /products/showroom-*.jpg files that do not exist in
 * the repo, so the page rendered as a header with no image above a column of
 * empty greige rectangles.
 */

function Reveal({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={viewportOnce}
      variants={revealVariants}
      transition={{ ...revealTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Words rise out of a clipped line. Matches the home page's section heading. */
function WordReveal({ text, className = '' }) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{text}</span>;

  const words = text.split(' ');

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={wordContainer}
      className={className}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          aria-hidden="true"
          className="inline-flex overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span variants={wordItem} className="inline-block">
            {word}
          </motion.span>
          {i < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
        </span>
      ))}
    </motion.span>
  );
}

/**
 * Header.
 *
 * Split rather than full-bleed: the type sits on flat olive where it is always
 * legible, and the photograph owns its own half instead of being buried under
 * the two overlays the old header needed to make white text survive on it.
 */
function Header({ settings }) {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-olive text-cream">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(247,244,234,0.14),_transparent_40%),linear-gradient(180deg,#3e4638_0%,#2a3026_100%)]"
      />

      {/* The mark, oversized and barely there. Same watermark treatment as the
          footer, which is one of its four sanctioned placements. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-20 -z-10 select-none text-sand/[0.05]"
      >
        <EvoraTree size={460} />
      </div>

      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
        <motion.div
          initial={reduced ? false : { opacity: 0, transform: 'translateY(18px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="font-sans text-[12px] uppercase tracking-[0.28em] text-gold">
            El Khroub, Constantine
          </p>

          <h1 className="mt-5 font-display text-[clamp(1.6rem,4.5vw,2.75rem)] leading-[1.15] tracking-[0.08em] text-cream">
            Notre showroom
          </h1>

          <span aria-hidden="true" className="mt-6 block h-px w-16 bg-gold" />

          <p className="mt-6 max-w-md text-base leading-relaxed text-sand sm:text-lg">
            {brand.tagline}. Nos pièces sont montées sur place — asseyez-vous dessus, ouvrez les
            tiroirs, comparez deux tissus sous la même lumière.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              href={`tel:+${toInternational(settings.telephone)}`}
              variant="onOliveSolid"
              size="lg"
            >
              Appeler le showroom
            </Button>
            <Button to="/catalogue" variant="onOlive" size="lg">
              Voir le catalogue
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, transform: 'translateY(18px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.6, delay: reduced ? 0 : 0.12, ease: [0.23, 1, 0.32, 1] }}
          className="relative"
        >
          <div className="aspect-[4/3] overflow-hidden rounded-sm border border-sand/25">
            <img
              src={ShowroomImage}
              alt="Le showroom Evora Home à El Khroub"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </div>

          {/* A gold rule offset behind the frame. The one piece of decoration
              on the page, and it is a hairline, which is all gold ever is here. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-3 -right-3 -z-10 hidden h-full w-full rounded-sm border border-gold/40 lg:block"
          />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * The three facts a visitor came for: where, when, and what number to ring.
 *
 * These sit in a band that overlaps the header rather than as three plain boxes
 * further down the page, because they are the answer to the question that
 * brought somebody here and they should not require a scroll.
 */
function PracticalInfo({ settings }) {
  const items = [
    {
      icon: MapPin,
      label: 'Adresse',
      value: settings.adresse,
      href: `https://www.google.com/maps/search/${encodeURIComponent(
        `Evora Home ${settings.adresse}`
      )}`,
      action: 'Ouvrir dans Maps',
    },
    { icon: Clock, label: 'Horaires', value: settings.horaires },
    {
      icon: Phone,
      label: 'Téléphone',
      value: formatPhone(settings.telephone),
      href: `tel:+${toInternational(settings.telephone)}`,
      action: 'Appeler maintenant',
      tabular: true,
    },
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={gridContainer}
        className="-mt-8 grid gap-px overflow-hidden rounded-sm border border-greige bg-greige sm:grid-cols-3 lg:-mt-12"
      >
        {items.map(({ icon: Icon, label, value, href, action, tabular }) => (
          <motion.div key={label} variants={gridItem} className="group bg-cream p-5 lg:p-6">
            <Icon size={18} strokeWidth={1.5} className="text-gold" />

            <h2 className="mt-3 font-sans text-[12px] uppercase tracking-[0.18em] text-ink-muted">
              {label}
            </h2>

            <p className={`mt-2 text-base leading-relaxed text-ink ${tabular ? 'tabular-nums' : ''}`}>
              {value}
            </p>

            {href ? (
              <a
                href={href}
                {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm text-gold-deep underline decoration-gold decoration-1 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2"
              >
                {action}
                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out-strong motion-safe:[@media(hover:hover)]:group-hover:translate-x-1"
                />
              </a>
            ) : null}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/**
 * What is on the floor. Four plain statements, each one a thing the customer
 * can verify by walking in, rather than a marketing claim.
 */
const OFFERINGS = [
  {
    icon: Armchair,
    title: 'Les pièces sont montées',
    body: 'Salons, chambres et tables sont exposés assemblés. Vous jugez la fermeté d’une assise en vous asseyant dessus, pas sur une photo.',
  },
  {
    icon: Ruler,
    title: 'Le sur-mesure se décide sur place',
    body: 'Nous prenons les mesures avec vous et confirmons le délai de fabrication avant de lancer quoi que ce soit.',
  },
  {
    icon: Truck,
    title: 'Livraison dans les 58 wilayas',
    body: 'À domicile ou en point de retrait. Les frais dépendent de votre wilaya et sont affichés avant que vous confirmiez.',
  },
  {
    icon: Banknote,
    title: 'Paiement à la livraison',
    body: 'En espèces, au moment où vous recevez. Le site ne demande aucune donnée bancaire et rien n’est prélevé à la commande.',
  },
];

function Offerings() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <Reveal className="max-w-xl">
        <p className="font-sans text-[12px] uppercase tracking-[0.28em] text-gold-deep">Sur place</p>

        <h2 className="mt-4 font-display text-[clamp(1.4rem,3.5vw,2.25rem)] leading-[1.15] tracking-[0.1em] text-ink">
          <WordReveal text="Ce que vous trouverez" />
        </h2>

        <span aria-hidden="true" className="mt-6 block h-px w-16 bg-gold" />
      </Reveal>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={gridContainer}
        className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-14 lg:gap-x-16"
      >
        {OFFERINGS.map(({ icon: Icon, title, body }) => (
          <motion.div key={title} variants={gridItem} className="flex gap-4">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-greige text-gold">
              <Icon size={18} strokeWidth={1.5} />
            </span>

            <div>
              <h3 className="font-sans text-base leading-snug text-ink">{title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-muted">{body}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/**
 * The olive band. Carries the colour note that runs through the site and gives
 * the page a full-bleed moment between two cream sections.
 */
function VisitBand({ settings }) {
  return (
    <section className="relative isolate overflow-hidden bg-olive text-cream">
      <img
        src={HeroBg}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-olive/85" />

      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <EvoraTree size={44} className="mx-auto text-gold" />

          <h2 className="mt-6 font-display text-[clamp(1.4rem,3.5vw,2.25rem)] leading-[1.15] tracking-[0.1em] text-cream">
            Venez voir, toucher, vous asseoir
          </h2>

          <p className="mt-5 text-base leading-relaxed text-sand sm:text-lg">
            Une photo ne dit pas la fermeté d&apos;une assise ni la vraie couleur d&apos;un tissu.
            Nous sommes ouverts six jours sur sept, et vous pouvez passer sans rendez-vous.
          </p>

          <dl className="mt-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2.5">
              <dt className="sr-only">Horaires</dt>
              <Clock size={16} strokeWidth={1.5} className="shrink-0 text-gold" />
              <dd className="text-base text-sand">{settings.horaires}</dd>
            </div>

            <div className="flex items-center gap-2.5">
              <dt className="sr-only">Adresse</dt>
              <MapPin size={16} strokeWidth={1.5} className="shrink-0 text-gold" />
              <dd className="text-base text-sand">{settings.adresse}</dd>
            </div>
          </dl>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              href={`tel:+${toInternational(settings.telephone)}`}
              variant="onOliveSolid"
              size="lg"
            >
              {formatPhone(settings.telephone)}
            </Button>
            <Button to="/contact" variant="onOlive" size="lg">
              Nous écrire
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Delivery and payment.
 *
 * Two short columns rather than the two paragraphs of prose this used to be.
 * Somebody scanning for "do I pay now or later" should find it without reading
 * a block of text.
 */
const TERMS = [
  {
    icon: Truck,
    title: 'Livraison',
    lines: [
      'Les 58 wilayas, à domicile ou en point de retrait.',
      'Les frais dépendent de votre wilaya et du mode choisi.',
      'Le montant est affiché avant la confirmation, jamais après.',
    ],
  },
  {
    icon: Banknote,
    title: 'Paiement',
    lines: [
      'À la livraison, en espèces.',
      'Aucune donnée bancaire demandée sur le site.',
      'Nous appelons pour confirmer avant l’expédition.',
    ],
  },
];

function Terms() {
  return (
    <section id="livraison" className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <Reveal className="max-w-xl">
        <p className="font-sans text-[12px] uppercase tracking-[0.28em] text-gold-deep">
          Commander
        </p>

        <h2 className="mt-4 font-display text-[clamp(1.4rem,3.5vw,2.25rem)] leading-[1.15] tracking-[0.1em] text-ink">
          Livraison et paiement
        </h2>

        <span aria-hidden="true" className="mt-6 block h-px w-16 bg-gold" />
      </Reveal>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:mt-14 lg:gap-16">
        {TERMS.map(({ icon: Icon, title, lines }, i) => (
          <Reveal key={title} delay={i * 0.08}>
            <div className="flex items-center gap-3">
              <Icon size={18} strokeWidth={1.5} className="shrink-0 text-gold" />
              <h3 className="font-sans text-[12px] uppercase tracking-[0.18em] text-ink-muted">
                {title}
              </h3>
            </div>

            <ul className="mt-4 flex flex-col gap-2.5 border-t border-greige pt-4">
              {lines.map((line) => (
                <li key={line} className="flex gap-3 text-base leading-relaxed text-ink">
                  <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-gold" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12 border-t border-greige pt-8">
        <p className="text-base text-ink-muted">
          Une question avant de commander ? Appelez-nous au{' '}
          <a
            href={`tel:+${toInternational(contact.telephone)}`}
            className="tabular-nums text-ink underline decoration-gold decoration-1 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2"
          >
            {formatPhone(contact.telephone)}
          </a>
          , nous répondons pendant les heures d&apos;ouverture.
        </p>
      </Reveal>
    </section>
  );
}

export default function Showroom() {
  const settings = useSettings();

  return (
    <div>
      <Header settings={settings} />
      <PracticalInfo settings={settings} />
      <Offerings />

      <SectionDivider className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10" />

      <VisitBand settings={settings} />
      <Terms />
    </div>
  );
}
