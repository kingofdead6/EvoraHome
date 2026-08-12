import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../lib/settings';
import Button from '../Components/UI/Button';
import SectionDivider from '../Components/Brand/SectionDivider';

const FAQ_ITEMS = [
  {
    question: 'Comment puis-je commander une pièce ?', 
    answer:
      'Parcourez le catalogue, ouvrez la page de la pièce qui vous intéresse et ajoutez-la au panier. Vous pouvez aussi commander via WhatsApp depuis la page produit.',
  },
  {
    question: 'Est-ce que vous livrez dans toutes les wilayas ?', 
    answer:
      'Oui, nous livrons dans les 58 wilayas. Les frais exacts sont affichés avant la confirmation de la commande.',
  },
  {
    question: 'Puis-je voir les pièces avant de commander ?', 
    answer:
      'Oui. Notre showroom à El Khroub est ouvert six jours sur sept. Venez toucher les tissus et comparer les coloris en personne.',
  },
  {
    question: 'Comment choisir la bonne couleur ou le bon tissu ?', 
    answer:
      'Les photos donnent une idée, mais l’éclairage varie. Nous recommandons de venir au showroom ou de demander un échantillon avant de confirmer votre commande.',
  },
  {
    question: 'Comment puis-je suivre ma commande ?', 
    answer:
      'Vous pouvez suivre votre commande depuis votre compte client sous “Mes commandes”. Si vous n’avez pas encore de compte, contactez-nous via WhatsApp ou téléphone.',
  },
];

export default function FAQ() {
  const settings = useSettings();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-sans text-[12px] uppercase tracking-[0.28em] text-ink-muted">
            Questions fréquentes
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-3xl tracking-[0.04em] text-ink sm:text-4xl">
            Tout ce qu’il faut savoir avant de commander.
          </h1>
        </div>
        <Button to="/contact" variant="onOlive" size="lg">
          Nous contacter
        </Button>
      </div>

      <SectionDivider className="my-10" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group rounded-sm border border-greige bg-cream p-6 open:shadow-[0_0_0_1px_rgba(180,150,70,0.25)]">
              <summary className="cursor-pointer text-lg font-semibold text-ink transition-colors duration-200 group-open:text-gold">
                {item.question}
              </summary>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">{item.answer}</p>
            </details>
          ))}
        </div>

        <aside className="rounded-sm border border-greige bg-olive/10 p-6 text-ink">
          <p className="text-sm uppercase tracking-[0.18em] text-ink-muted">Besoin d’aide rapide ?</p>
          <div className="mt-4 space-y-4 text-base leading-relaxed">
            <p>
              Appelez-nous au <a href={`tel:+${settings.telephone.replace(/\D/g, '')}`} className="font-semibold text-ink underline decoration-gold underline-offset-4">{settings.telephone}</a>.
            </p>
            <p>
              Écrivez sur WhatsApp : <Link to="/contact" className="font-semibold text-ink underline decoration-gold underline-offset-4">{settings.whatsapp ? `+${settings.whatsapp}` : 'Contactez-nous'}</Link>
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/showroom" variant="secondary" size="md">
              Voir le showroom
            </Button>
            <Button to="/catalogue" variant="secondary" size="md">
              Explorer le catalogue
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
