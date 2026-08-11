import { MapPin, Phone, Clock } from 'lucide-react';

import { useSettings } from '../lib/settings';
import { formatPhone, toInternational } from '../lib/format';
import { brand } from '../brand';

import ProductImage from '../Components/UI/ProductImage';
import Button from '../Components/UI/Button';
import SectionDivider from '../Components/Brand/SectionDivider';

/**
 * Notre showroom.
 *
 * The physical shop is the trust signal on this site. An Algerian customer
 * paying 289 000 DA cash to a driver wants to know there is a building with a
 * sign on it and a phone somebody answers. That is what this page is for, and
 * it is why there are no invented statistics or testimonials on it.
 */
export default function Showroom() {
  const settings = useSettings();

  return (
    <div className="pb-20">
      {/* Header. The second and last place large photography appears. */}
      <section className="relative isolate overflow-hidden bg-olive">
        <img
          src="/products/showroom-header.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-olive/75" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-forest/80 to-transparent"
        />

        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <h1 className="max-w-2xl font-display text-xl leading-tight tracking-[0.08em] text-cream sm:text-3xl">
            Notre showroom à El Khroub
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-sand sm:text-lg">
            {brand.tagline}
          </p>
        </div>
      </section>

      {/* Practical information first. It is what the visitor came for. */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-sm border border-greige p-5">
            <MapPin size={18} strokeWidth={1.5} className="text-gold" />
            <h2 className="mt-3 text-[11px] uppercase tracking-[0.18em] text-ink-muted">Adresse</h2>
            <p className="mt-2 text-base leading-relaxed text-ink">{settings.adresse}</p>
          </div>

          <div className="rounded-sm border border-greige p-5">
            <Clock size={18} strokeWidth={1.5} className="text-gold" />
            <h2 className="mt-3 text-[11px] uppercase tracking-[0.18em] text-ink-muted">Horaires</h2>
            <p className="mt-2 text-base leading-relaxed text-ink">{settings.horaires}</p>
          </div>

          <div className="rounded-sm border border-greige p-5">
            <Phone size={18} strokeWidth={1.5} className="text-gold" />
            <h2 className="mt-3 text-[11px] uppercase tracking-[0.18em] text-ink-muted">Téléphone</h2>
            <a
              href={`tel:+${toInternational(settings.telephone)}`}
              className="mt-2 block text-base tabular-nums text-ink underline decoration-gold underline-offset-4"
            >
              {formatPhone(settings.telephone)}
            </a>
          </div>
        </div>
      </section>

      <SectionDivider className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10" />

      {/* The shop, in words. Written to be specific rather than promotional. */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-prose">
            <h2 className="font-display text-lg tracking-[0.12em] text-ink sm:text-xl">
              Ce que vous trouverez sur place
            </h2>

            <div className="mt-5 flex flex-col gap-4 text-base leading-relaxed text-ink">
              <p>
                Nos salons, chambres et tables sont montés dans le showroom. Vous pouvez vous
                asseoir, ouvrir les tiroirs, comparer deux tissus côte à côte sous la même lumière.
              </p>
              <p>
                Les coloris que vous voyez sur le site sont disponibles en échantillons. Un beige sur
                un écran de téléphone et le même beige dans votre salon ne sont pas la même couleur,
                et c&apos;est le genre de chose qui se règle en deux minutes sur place.
              </p>
              <p>
                Pour les pièces sur commande, nous prenons les mesures avec vous et confirmons le
                délai avant de lancer la fabrication.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={`tel:+${toInternational(settings.telephone)}`} variant="primary" size="md">
                Appeler le showroom
              </Button>
              <Button to="/catalogue" variant="secondary" size="md">
                Voir le catalogue
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <ProductImage
              src="/products/showroom-01.jpg"
              alt="Salons exposés dans le showroom Evora Home"
              className="aspect-[4/3]"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="grid grid-cols-2 gap-4">
              <ProductImage
                src="/products/showroom-02.jpg"
                alt="Coin chambre du showroom"
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
              <ProductImage
                src="/products/showroom-03.jpg"
                alt="Tables et chaises exposées"
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Delivery and payment, stated plainly. */}
      <section id="livraison" className="bg-olive text-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <h2 className="font-display text-lg tracking-[0.12em] text-cream sm:text-xl">
            Livraison et paiement
          </h2>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:gap-16">
            <div className="max-w-prose">
              <h3 className="text-[11px] uppercase tracking-[0.18em] text-gold">Livraison</h3>
              <p className="mt-3 text-base leading-relaxed text-sand">
                Nous livrons dans les 58 wilayas, à domicile ou en point de retrait. Les frais
                dépendent de votre wilaya et du mode choisi, et ils sont affichés avant que vous
                confirmiez la commande. Aucun montant n&apos;apparaît après coup.
              </p>
            </div>

            <div className="max-w-prose">
              <h3 className="text-[11px] uppercase tracking-[0.18em] text-gold">Paiement</h3>
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
