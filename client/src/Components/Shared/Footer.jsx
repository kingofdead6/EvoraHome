import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, MapPin, Clock } from 'lucide-react';

import EvoraTree from '../Brand/EvoraTree';
import { useSettings } from '../../lib/settings';
import { formatPhone, toInternational } from '../../lib/format';
import { brand } from '../../brand';

import LogoMark from '../../assets/LogoMark.webp';

/**
 * The footer.
 *
 * Carries the fourth and last sanctioned use of the traced tree mark: an
 * oversized, very low opacity watermark behind the content. It is decorative,
 * so it is aria-hidden and sits behind a stacking context that keeps it off the
 * links. The printed logo card is a separate asset and appears here as the
 * brand lockup.
 *
 * Link rows are deliberately dense. A 44px row per link turned four short lists
 * into four tall columns of mostly empty olive, which is what a footer looks
 * like when nobody decided how tall it should be. Rows are 32px with the tap
 * target extended across the full column width, so a thumb still lands.
 */

const CATEGORIES = [
  { slug: 'salons', nom: 'Salons' },
  { slug: 'chambres', nom: 'Chambres' },
  { slug: 'tables-et-chaises', nom: 'Tables & Chaises' },
  { slug: 'meubles-tv', nom: 'Meubles TV' },
  { slug: 'consoles-et-miroirs', nom: 'Consoles & Miroirs' },
  { slug: 'salon-de-jardin', nom: 'Salon de Jardin' },
  { slug: 'decoration', nom: 'Décoration' },
];

const MAISON = [
  { to: '/showroom', label: 'Notre showroom' },
  { to: '/catalogue', label: 'Tout le catalogue' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Nous contacter' },
  { to: '/compte/commandes', label: 'Suivre ma commande' },
  { to: '/livraison', label: 'Livraison et paiement' },
];

/** TikTok is not in the icon set, so it is drawn here at the same 1.5 stroke. */
function TikTokIcon({ size = 17 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 6.5A4.5 4.5 0 0 0 18.5 11" />
    </svg>
  );
}

function FooterHeading({ children, ...props }) {
  return (
    <h2
      {...props}
      className="mb-3 flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.2em] text-sand"
    >
      {children}
      <span aria-hidden="true" className="h-px flex-1 bg-gold/25" />
    </h2>
  );
}

/** One dense list of links. 32px rows, full-width hit area. */
function FooterLinks({ items }) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li key={item.to}>
          <Link
            to={item.to}
            className="group flex min-h-[32px] items-center gap-2 text-sm text-sand transition-colors duration-200 hover:text-cream"
          >
            <span
              aria-hidden="true"
              className="h-px w-0 bg-gold transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-3"
            />
            <span>{item.nom || item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  const settings = useSettings();
  const year = new Date().getFullYear();

  const socials = [
    settings.instagram
      ? { key: 'ig', href: `https://instagram.com/${settings.instagram}`, label: 'Instagram', Icon: Instagram }
      : null,
    settings.facebook ? { key: 'fb', href: settings.facebook, label: 'Facebook', Icon: Facebook } : null,
    settings.tiktok
      ? { key: 'tt', href: `https://tiktok.com/@${settings.tiktok}`, label: 'TikTok', Icon: TikTokIcon }
      : null,
  ].filter(Boolean);

  return (
    <footer className="relative isolate mt-auto overflow-hidden border-t border-gold/25 bg-olive text-cream">
      {/* Watermark. Cropped by the footer, bleeding off the right edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 -z-10 select-none text-sand/[0.05] sm:-right-8"
      >
        <EvoraTree size={520} />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand. The printed logo card, framed. */}
          <div className="lg:col-span-4 lg:pr-8">
            <Link
              to="/"
              aria-label={`${brand.name}, retour à l'accueil`}
              className="group inline-flex items-center gap-4 focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4"
            >
              <img
                src={LogoMark}
                alt=""
                aria-hidden="true"
                width={72}
                height={72}
                loading="lazy"
                className="h-16 w-16 shrink-0 rounded-sm border border-gold/35 object-cover transition-colors duration-200 group-hover:border-gold/70 sm:h-[72px] sm:w-[72px]"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-display text-lg tracking-[0.18em] text-cream sm:text-xl">
                  {brand.wordmark}
                </span>
                <span className="mt-1 text-[12px] uppercase tracking-[0.14em] text-sand">
                  {brand.descriptor}
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-sand">{brand.tagline}</p>

            {socials.length ? (
              <div className="mt-5 flex items-center gap-2">
                {socials.map(({ key, href, label, Icon }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-sm border border-sand/25 text-sand transition-colors duration-200 hover:border-gold hover:text-cream"
                  >
                    <Icon size={17} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* Catalogue */}
          <nav aria-labelledby="footer-catalogue" className="lg:col-span-3">
            <FooterHeading id="footer-catalogue">Catalogue</FooterHeading>
            <FooterLinks items={CATEGORIES.map((c) => ({ to: `/catalogue/${c.slug}`, label: c.nom }))} />
          </nav>

          {/* Shop */}
          <nav aria-labelledby="footer-maison" className="lg:col-span-2">
            <FooterHeading id="footer-maison">La maison</FooterHeading>
            <FooterLinks items={MAISON} />
          </nav>

          {/* Contact */}
          <div className="lg:col-span-3">
            <FooterHeading>Nous joindre</FooterHeading>

            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href={`tel:+${toInternational(settings.telephone)}`}
                  className="flex min-h-[32px] items-center gap-2.5 text-sm text-sand transition-colors duration-200 hover:text-cream"
                >
                  <Phone size={14} strokeWidth={1.5} className="shrink-0 text-gold" />
                  <span className="tabular-nums">{formatPhone(settings.telephone)}</span>
                </a>
              </li>

              {settings.telephone2 ? (
                <li>
                  <a
                    href={`tel:+${toInternational(settings.telephone2)}`}
                    className="flex min-h-[32px] items-center gap-2.5 text-sm text-sand transition-colors duration-200 hover:text-cream"
                  >
                    <Phone size={14} strokeWidth={1.5} className="shrink-0 text-gold" />
                    <span className="tabular-nums">{formatPhone(settings.telephone2)}</span>
                  </a>
                </li>
              ) : null}

              <li className="flex items-start gap-2.5 text-sm leading-relaxed text-sand">
                <MapPin size={14} strokeWidth={1.5} className="mt-1 shrink-0 text-gold" />
                <span>{settings.adresse}</span>
              </li>

              {settings.horaires ? (
                <li className="flex items-start gap-2.5 text-sm leading-relaxed text-sand">
                  <Clock size={14} strokeWidth={1.5} className="mt-1 shrink-0 text-gold" />
                  <span>{settings.horaires}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-sand/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-sand">{year} Evora Home. El Khroub, Constantine.</p>
          <p className="text-sm text-sand">Paiement à la livraison dans les 58 wilayas.</p>
        </div>
      </div>
    </footer>
  );
}
