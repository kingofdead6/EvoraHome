import { useState } from 'react';
import { Phone, MapPin, Instagram, MessageCircle } from 'lucide-react';

import api from '../lib/api';
import { useSettings } from '../lib/settings';
import { formatPhone, toInternational } from '../lib/format';
import { whatsappLink } from '../brand';
import { isValidPhoneClient, isValidEmail } from '../lib/validate';

import { Field, TextArea } from '../Components/UI/Field';
import Button from '../Components/UI/Button';
import SectionDivider from '../Components/Brand/SectionDivider';
import EvoraTree from '../Components/Brand/EvoraTree';

/**
 * Contact.
 *
 * The phone number and the WhatsApp link come first, above the form. This
 * audience calls; the form is for the minority who would rather write, and for
 * questions that arrive at 23:00.
 */
export default function Contact() {
  const settings = useSettings();

  const [form, setForm] = useState({ nom: '', telephone: '', email: '', sujet: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    const next = {};
    if (!form.nom.trim()) next.nom = 'Votre nom est requis';
    if (!isValidPhoneClient(form.telephone)) {
      next.telephone = 'Numéro invalide. Format : 05, 06 ou 07 suivi de 8 chiffres';
    }
    if (!isValidEmail(form.email)) next.email = 'Adresse email invalide';
    if (!form.message.trim()) next.message = 'Votre message est vide';

    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await api.sendMessage(form);
      setSent(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <h1 className="font-display text-xl tracking-[0.1em] text-ink sm:text-2xl">Nous contacter</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted">
        Pour une question sur une pièce, un délai ou une commande sur mesure, le plus rapide reste
        le téléphone.
      </p>

      {/* Direct channels */}
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <a
          href={`tel:+${toInternational(settings.telephone)}`}
          className="group flex min-h-[96px] flex-col justify-between rounded-sm border border-greige p-4 transition-colors duration-200 hover:border-gold"
        >
          <Phone size={18} strokeWidth={1.5} className="text-gold" />
          <span>
            <span className="block text-[12px] uppercase tracking-[0.15em] text-ink-muted">Téléphone</span>
            <span className="mt-1 block text-base tabular-nums text-ink">
              {formatPhone(settings.telephone)}
            </span>
          </span>
        </a>

        <a
          href={whatsappLink('Bonjour Evora Home,', settings.whatsapp)}
          target="_blank"
          rel="noreferrer noopener"
          className="group flex min-h-[96px] flex-col justify-between rounded-sm border border-greige p-4 transition-colors duration-200 hover:border-gold"
        >
          <MessageCircle size={18} strokeWidth={1.5} className="text-gold" />
          <span>
            <span className="block text-[12px] uppercase tracking-[0.15em] text-ink-muted">WhatsApp</span>
            <span className="mt-1 block text-base text-ink">Écrire un message</span>
          </span>
        </a>

        {settings.instagram ? (
          <a
            href={`https://instagram.com/${settings.instagram}`}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex min-h-[96px] flex-col justify-between rounded-sm border border-greige p-4 transition-colors duration-200 hover:border-gold"
          >
            <Instagram size={18} strokeWidth={1.5} className="text-gold" />
            <span>
              <span className="block text-[12px] uppercase tracking-[0.15em] text-ink-muted">Instagram</span>
              <span className="mt-1 block text-base text-ink">@{settings.instagram}</span>
            </span>
          </a>
        ) : null}

        <div className="flex min-h-[96px] flex-col justify-between rounded-sm border border-greige p-4">
          <MapPin size={18} strokeWidth={1.5} className="text-gold" />
          <span>
            <span className="block text-[12px] uppercase tracking-[0.15em] text-ink-muted">Showroom</span>
            <span className="mt-1 block text-base leading-snug text-ink">{settings.adresse}</span>
          </span>
        </div>
      </div>

      <SectionDivider className="mt-16" />

      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Form */}
        <div>
          <h2 className="font-display text-base tracking-[0.12em] text-ink">Nous écrire</h2>

          {sent ? (
            <div className="mt-6 flex flex-col items-start gap-4 rounded-sm border border-gold/50 p-6">
              <EvoraTree size={56} className="text-sand" />
              <div>
                <p className="font-display text-base text-ink">Message envoyé</p>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">
                  Nous vous répondons sur le numéro que vous avez indiqué. Pour une réponse
                  immédiate, appelez-nous.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSent(false);
                  setForm({ nom: '', telephone: '', email: '', sujet: '', message: '' });
                }}
                variant="secondary"
                size="sm"
              >
                Écrire un autre message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
              {submitError ? (
                <div
                  role="alert"
                  className="rounded-sm border border-[#8C2F1F]/40 bg-[#8C2F1F]/5 px-4 py-3 text-base text-[#8C2F1F]"
                >
                  {submitError}
                </div>
              ) : null}

              <Field
                label="Nom et prénom"
                required
                autoComplete="name"
                value={form.nom}
                onChange={set('nom')}
                error={errors.nom}
              />

              <Field
                label="Téléphone"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0X XX XX XX XX"
                value={form.telephone}
                onChange={set('telephone')}
                error={errors.telephone}
              />

              <Field
                label="Email (facultatif)"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
              />

              <Field label="Sujet" value={form.sujet} onChange={set('sujet')} />

              <TextArea
                label="Message"
                required
                rows={5}
                value={form.message}
                onChange={set('message')}
                error={errors.message}
              />

              <Button type="submit" variant="primary" size="lg" disabled={loading} className="self-start">
                {loading ? 'Envoi' : 'Envoyer le message'}
              </Button>
            </form>
          )}
        </div>

        {/* Map */}
        <div>
          <h2 className="font-display text-base tracking-[0.12em] text-ink">Nous trouver</h2>

          <div className="mt-6 overflow-hidden rounded-sm border border-greige">
            <iframe
              title="Emplacement du showroom Evora Home à El Khroub"
              src="https://www.openstreetmap.org/export/embed.html?bbox=6.85%2C36.24%2C6.93%2C36.30&layer=mapnik"
              className="h-[22rem] w-full border-0 lg:h-[28rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {settings.adresse}. Appelez-nous en arrivant, nous vous guidons sur les derniers mètres.
          </p>
        </div>
      </div>
    </div>
  );
}
