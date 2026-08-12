import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, MapPin } from 'lucide-react';

import EvoraTree from '../Brand/EvoraTree';
import { useSettings } from '../../lib/settings';
import { formatPhone, toInternational } from '../../lib/format';
import { brand } from '../../brand';

/**
 * The footer.
 *
 * Carries the fourth and last sanctioned use of the tree mark: an oversized,
 * very low opacity watermark behind the content. It is decorative, so it is
 * aria-hidden and sits behind a stacking context that keeps it off the links.
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

function FooterHeading({ children, ...props }) {
  return (
    <h2 {...props} className="mb-4 font-sans text-[12px] uppercase tracking-[0.2em] text-sand">
      {children}
    </h2>
  );
}

export default function Footer() {
  const settings = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate mt-auto overflow-hidden border-t border-gold/25 bg-olive text-cream">
      {/* Watermark. Cropped by the footer, bleeding off the right edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 -z-10 select-none text-sand/[0.06] sm:-right-8"
      >
        <EvoraTree size={520} />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div className="lg:pr-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-sand/25 bg-olive/20 text-gold">
                <EvoraTree size={22} />
              </span>
              <div>
                <p className="font-display text-lg tracking-[0.18em] text-cream">Evora Home</p>
                <p className="text-sm text-sand">{brand.descriptor}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-sand">{brand.tagline}</p>
          </div>

          {/* Catalogue */}
          <nav aria-labelledby="footer-catalogue">
            <FooterHeading id="footer-catalogue">Catalogue</FooterHeading>
            <ul className="flex flex-col gap-2.5">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/catalogue/${c.slug}`}
                    className="inline-flex min-h-[44px] items-center text-sm text-sand transition-colors duration-200 hover:text-cream"
                  >
                    {c.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Shop */}
          <nav aria-labelledby="footer-maison">
            <FooterHeading id="footer-maison">La maison</FooterHeading>
            <ul className="flex flex-col gap-2.5">
              {[
                    { to: '/showroom', label: 'Notre showroom' },
                { to: '/faq', label: 'FAQ' },
                { to: '/contact', label: 'Nous contacter' },
                { to: '/compte/commandes', label: 'Suivre ma commande' },
                { to: '/livraison', label: 'Livraison et paiement' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="inline-flex min-h-[44px] items-center text-sm text-sand transition-colors duration-200 hover:text-cream"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <FooterHeading>Nous joindre</FooterHeading>
            <ul className="flex flex-col gap-3.5">
              <li>
                <a
                  href={`tel:+${toInternational(settings.telephone)}`}
                  className="inline-flex min-h-[44px] items-center gap-2.5 text-sm text-sand transition-colors duration-200 hover:text-cream"
                >
                  <Phone size={15} strokeWidth={1.5} className="shrink-0 text-gold" />
                  <span className="tabular-nums">{formatPhone(settings.telephone)}</span>
                </a>
              </li>

              {settings.telephone2 ? (
                <li>
                  <a
                    href={`tel:+${toInternational(settings.telephone2)}`}
                    className="inline-flex min-h-[44px] items-center gap-2.5 text-sm text-sand transition-colors duration-200 hover:text-cream"
                  >
                    <Phone size={15} strokeWidth={1.5} className="shrink-0 text-gold" />
                    <span className="tabular-nums">{formatPhone(settings.telephone2)}</span>
                  </a>
                </li>
              ) : null}

              <li className="flex items-start gap-2.5 text-sm text-sand">
                <MapPin size={15} strokeWidth={1.5} className="mt-1 shrink-0 text-gold" />
                <span>{settings.adresse}</span>
              </li>

              {settings.horaires ? (
                <li className="text-sm leading-relaxed text-sand">{settings.horaires}</li>
              ) : null}
            </ul>

            <div className="mt-5 flex items-center gap-2">
              {settings.instagram ? (
                <a
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Instagram"
                  className="flex h-11 w-11 items-center justify-center rounded-sm border border-sand/25 text-sand transition-colors duration-200 hover:border-gold hover:text-cream"
                >
                  <Instagram size={17} strokeWidth={1.5} />
                </a>
              ) : null}

              {settings.facebook ? (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Facebook"
                  className="flex h-11 w-11 items-center justify-center rounded-sm border border-sand/25 text-sand transition-colors duration-200 hover:border-gold hover:text-cream"
                >
                  <Facebook size={17} strokeWidth={1.5} />
                </a>
              ) : null}

              {settings.tiktok ? (
                <a
                  href={`https://tiktok.com/@${settings.tiktok}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="TikTok"
                  className="flex h-11 w-11 items-center justify-center rounded-sm border border-sand/25 text-sand transition-colors duration-200 hover:border-gold hover:text-cream"
                >
                  <span className="text-[18px] font-black">t</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-sand/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-sand">
            {year} Evora Home. El Khroub, Constantine.
          </p>
          <p className="text-sm text-sand">Paiement à la livraison dans les 58 wilayas.</p>
        </div>
      </div>
    </footer>
  );
}
