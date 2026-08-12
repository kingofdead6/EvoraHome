import { MapPin, Phone, Clock } from 'lucide-react';

import { useSettings } from '../lib/settings';
import { formatPhone, toInternational } from '../lib/format';
import { brand } from '../brand';

import ProductImage from '../Components/UI/ProductImage';
import Button from '../Components/UI/Button';
import SectionHeading from '../Components/UI/SectionHeading';
import SectionDivider from '../Components/Brand/SectionDivider';

import { showroom } from '../lib/placeholders';

import ShowroomImage from '../assets/ShopImg.webp';

/**
 * Notre showroom.
 *
 * The physical shop is the trust signal on this site. An Algerian customer
 * paying 289 000 DA cash to a driver wants to know there is a building with a
 * sign on it and a phone somebody answers. That is what this page is for, and
 * it is why there are no invented statistics or testimonials on it.
 */

/**
 * The practical block, as one plaque rather than three floating cards.
 *
 * Three separate bordered boxes read as a template row. A single panel divided
 * by hairlines reads as the information plate on the door, which is what this
 * actually is. It overlaps the photographic header so the first thing below the
 * fold is the address, not another heading.
 */
function InfoPlaque({ settings }) {
  const rows = [
    { Icon: MapPin, term: 'Adresse', value: settings.adresse },
    { Icon: Clock, term: 'Horaires', value: settings.horaires },
    {
      Icon: Phone,
      term: 'Téléphone',
      value: formatPhone(settings.telephone),
      href: `tel:+${toInternational(settings.telephone)}`,
    },
  ];

  return (
    <div className="relative z-10 -mt-10 sm:-mt-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <dl className="grid divide-y divide-greige rounded-sm border border-greige bg-cream sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {rows.map(({ Icon, term, value, href }) => (
            <div key={term} className="flex items-start gap-3.5 p-5 sm:p-6">
              <Icon size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold" />
              <div className="min-w-0">
                <dt className="text-[12px] uppercase tracking-[0.18em] text-ink-muted">{term}</dt>
                <dd className="mt-1.5 text-base leading-relaxed text-ink">
                  {href ? (
                    <a
                      href={href}
                      className="tabular-nums underline decoration-gold underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2"
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default function Showroom() {
  const settings = useSettings();
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `Evora Home ${settings.adresse}`
  )}`;

  return (
    // No trailing padding: the last section is a full-bleed olive band that
    // meets the olive footer. A gap there put a cream stripe between two
    // identical greens.
    <div>
      {/* Header. The second and last place large photography appears. */}
      <section className="relative isolate overflow-hidden bg-olive">
        <img
          src={showroom.header.local}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          onError={(e) => {
            // The client's own file first, the stand-in second, the olive
            // gradient underneath if neither resolves.
            const img = e.currentTarget;
            if (img.src.endsWith(showroom.header.local)) img.src = showroom.header.remote;
            else img.style.display = 'none';
          }}
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-olive/75" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-forest/85 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 -z-10 hidden border border-gold/20 lg:block"
        />

        <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-20 sm:px-6 sm:pb-28 lg:px-14 lg:pb-32 lg:pt-28">
          <p className="text-[12px] uppercase tracking-[0.28em] text-sand">Notre maison</p>
          <span aria-hidden="true" className="mt-5 block h-px w-16 bg-gold" />

          <h1 className="mt-5 max-w-2xl font-display text-xl leading-tight tracking-[0.08em] text-cream sm:text-3xl lg:text-4xl">
            Notre showroom à El Khroub
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-sand sm:text-lg">
            {brand.tagline}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              href={`tel:+${toInternational(settings.telephone)}`}
              variant="onOliveSolid"
              size="md"
            >
              Appeler le showroom
            </Button>
            <Button href={mapsHref} target="_blank" rel="noreferrer noopener" variant="onOlive" size="md">
              Ouvrir dans Maps
            </Button>
          </div>
        </div>
      </section>

      <InfoPlaque settings={settings} />

      {/* The shop, in words. Written to be specific rather than promotional. */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-prose">
            <SectionHeading title="Sur place" as="h2" />

            <div className="mt-6 flex flex-col divide-y divide-greige border-y border-greige">
              {[
                {
                  title: 'Tout est monté',
                  body: "Nos salons, chambres et tables sont montés dans le showroom. Vous pouvez vous asseoir, ouvrir les tiroirs, comparer deux tissus côte à côte sous la même lumière.",
                },
                {
                  title: 'Les coloris en main',
                  body: "Les coloris que vous voyez sur le site sont disponibles en échantillons. Un beige sur un écran de téléphone et le même beige dans votre salon ne sont pas la même couleur, et c'est le genre de chose qui se règle en deux minutes sur place.",
                },
                {
                  title: 'Le sur-mesure',
                  body: 'Pour les pièces sur commande, nous prenons les mesures avec vous et confirmons le délai avant de lancer la fabrication.',
                },
              ].map((block) => (
                <div key={block.title} className="py-5">
                  <h3 className="text-[12px] uppercase tracking-[0.18em] text-gold-deep">
                    {block.title}
                  </h3>
                  <p className="mt-2.5 text-base leading-relaxed text-ink">{block.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/catalogue" variant="primary" size="md">
                Voir le catalogue
              </Button>
              <Button to="/contact" variant="secondary" size="md">
                Nous écrire
              </Button>
            </div>
          </div>

          {/* Gallery. One tall plate and two below it, so the set reads as a
              spread rather than as three photos of the same size. */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {showroom.plates.map((plate, i) => (
              <ProductImage
                key={plate.local}
                src={plate.local}
                fallbackSrc={plate.remote}
                alt={plate.alt}
                aspect={i === 0 ? 'aspect-[16/10]' : 'aspect-[4/3]'}
                className={i === 0 ? 'col-span-2' : ''}
                sizes={i === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
              />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10" />

      {/* The building itself, full width. */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <ProductImage
              src={ShowroomImage}
              alt="La devanture du showroom Evora Home à El Khroub"
              aspect="aspect-[4/3]"
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
          </div>

          <div className="lg:col-span-2">
            <SectionHeading title="Nous trouver" as="h2" />
            {/* The horaires string is a full sentence of the client's own
                writing. Lower-casing it to graft it onto ours turned "Vendredi
                fermé" into "vendredi fermé" mid-paragraph, so it stands alone. */}
            <p className="mt-5 text-base leading-relaxed text-ink">{settings.adresse}.</p>
            <p className="mt-2 text-base leading-relaxed text-ink">{settings.horaires}</p>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Appelez-nous avant de venir si vous cherchez une pièce précise : nous vérifions
              qu&apos;elle est bien exposée le jour de votre visite.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href={mapsHref} target="_blank" rel="noreferrer noopener" variant="primary" size="md">
                Itinéraire
              </Button>
              <Button href={`tel:+${toInternational(settings.telephone)}`} variant="secondary" size="md">
                {formatPhone(settings.telephone)}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery and payment, stated plainly. */}
      <section id="livraison" className="bg-olive text-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <SectionHeading tone="cream" title="Livraison et paiement" as="h2" />

          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:gap-16">
            <div className="max-w-prose border-t border-sand/20 pt-6">
              <h3 className="text-[12px] uppercase tracking-[0.18em] text-sand">Livraison</h3>
              <p className="mt-3 text-base leading-relaxed text-sand">
                Nous livrons dans les 58 wilayas, à domicile ou en point de retrait. Les frais
                dépendent de votre wilaya et du mode choisi, et ils sont affichés avant que vous
                confirmiez la commande. Aucun montant n&apos;apparaît après coup.
              </p>
            </div>

            <div className="max-w-prose border-t border-sand/20 pt-6">
              <h3 className="text-[12px] uppercase tracking-[0.18em] text-sand">Paiement</h3>
              <p className="mt-3 text-base leading-relaxed text-sand">
                Paiement à la livraison, en espèces. Rien n&apos;est prélevé au moment de la
                commande et le site ne demande aucune donnée bancaire. Nous vous appelons pour
                confirmer avant l&apos;expédition.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
