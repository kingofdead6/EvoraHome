import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, Instagram, MessageCircle, ArrowUpRight, Clock } from 'lucide-react';

import api from '../lib/api';
import { useSettings } from '../lib/settings';
import { formatPhone, toInternational } from '../lib/format';
import { whatsappLink } from '../brand';
import { isValidPhoneClient, isValidEmail } from '../lib/validate';
import {
  revealVariants,
  revealTransition,
  viewportOnce,
  gridContainer,
  gridItem,
  wordContainer,
  wordItem,
  EASE_OUT,
  useReducedMotion,
} from '../lib/motion';

import { Field, TextArea } from '../Components/UI/Field';
import Button from '../Components/UI/Button';
import SectionDivider from '../Components/Brand/SectionDivider';
import EvoraTree from '../Components/Brand/EvoraTree';
import { useI18n } from '../lib/i18n';

/**
 * The showroom on Google Maps.
 *
 * `MAP_EMBED` is the client's own place embed. `MAP_LINK` targets the same
 * place by its Google place ID rather than by a name search, so the button and
 * the embed always land on the same pin — a search for "Evora Home El Khroub"
 * is at the mercy of whatever else Google decides matches that day.
 */
const MAP_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.194825139573!2d6.690830099999999' +
  '!3d36.273198799999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2' +
  '!1s0x12f173005725becf%3A0x198dbf7d732f828d!2sEvora%20Home!5e1!3m2!1sen!2sdz' +
  '!4v1786530306340!5m2!1sen!2sdz';

const MAP_LINK =
  'https://www.google.com/maps/search/?api=1&query=Evora%20Home' +
  '&query_place_id=ChIJz748VwBzsRIRjYIvc33vjRk';

/** Words rise out of a clipped line. Matches the other pages' headings. */
function WordReveal({ text, className = '' }) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{text}</span>;

  const words = text.split(' ');

  return (
    <motion.span
      initial="hidden"
      animate="visible"
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

/**
 * One direct channel.
 *
 * Rendered as a link when there is somewhere to go and a plain div otherwise,
 * because the showroom address is a fact rather than an action and a card that
 * looks clickable but is not is worse than one that never pretended.
 */
function ChannelCard({ icon: Icon, label, value, href, external }) {
  const interactive = Boolean(href);
  const Component = interactive ? 'a' : 'div';

  return (
    <motion.div variants={gridItem}>
      <Component
        {...(interactive
          ? {
              href,
              ...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {}),
            }
          : {})}
        className={`group relative flex h-full min-h-[124px] flex-col justify-between overflow-hidden rounded-sm border border-greige bg-cream p-5 ${
          interactive ? 'transition-colors duration-300 hover:border-gold' : ''
        }`}
      >
        <span className="flex items-start justify-between">
          <Icon size={18} strokeWidth={1.5} className="text-gold" />
          {interactive ? (
            <ArrowUpRight
              size={16}
              strokeWidth={1.5}
              aria-hidden="true"
              className="text-ink-muted transition-transform duration-300 ease-out-strong motion-safe:[@media(hover:hover)]:group-hover:-translate-y-0.5 motion-safe:[@media(hover:hover)]:group-hover:translate-x-0.5"
            />
          ) : null}
        </span>

        <span className="mt-6 block">
          <span className="block font-sans text-[12px] uppercase tracking-[0.18em] text-ink-muted">
            {label}
          </span>
          <span className="mt-1.5 block text-base leading-snug text-ink">{value}</span>
        </span>

        {/* The gold hairline that draws in along the base on hover, the same
            signature the product cards use. */}
        {interactive ? (
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px origin-[left_center] rtl:origin-[right_center] scale-x-0 bg-gold transition-transform duration-300 ease-out-strong motion-safe:[@media(hover:hover)]:group-hover:scale-x-100"
          />
        ) : null}
      </Component>
    </motion.div>
  );
}

/**
 * Contact.
 *
 * The phone number and the WhatsApp link come first, above the form. This
 * audience calls; the form is for the minority who would rather write, and for
 * questions that arrive at 23:00.
 */
export default function Contact() {
  const settings = useSettings();
  const reduced = useReducedMotion();
  const { t } = useI18n();

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
    if (!form.nom.trim()) next.nom = t('validation.nameRequired');
    if (!isValidPhoneClient(form.telephone)) {
      next.telephone = t('validation.phoneInvalid');
    }
    if (!isValidEmail(form.email)) next.email = t('validation.emailInvalid');
    if (!form.message.trim()) next.message = t('validation.messageEmpty');

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

  const channels = [
    {
      icon: Phone,
      label: t('contact.phone'),
      value: formatPhone(settings.telephone),
      href: `tel:+${toInternational(settings.telephone)}`,
    },
    {
      icon: MessageCircle,
      label: t('contact.whatsapp'),
      value: t('contact.whatsappCta'),
      href: whatsappLink('Bonjour Evora Home,', settings.whatsapp),
      external: true,
    },
    settings.instagram
      ? {
          icon: Instagram,
          label: t('contact.instagram'),
          value: `@${settings.instagram}`,
          href: `https://instagram.com/${settings.instagram}`,
          external: true,
        }
      : null,
    { icon: MapPin, label: t('contact.showroom'), value: settings.adresse },
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      {/* Header */}
      <motion.div
        initial={reduced ? false : { opacity: 0, transform: 'translateY(16px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="max-w-2xl"
      >
        <p className="font-sans text-[12px] uppercase tracking-[0.28em] text-gold-deep">
          {t('contact.eyebrow')}
        </p>

        <h1 className="mt-4 font-display text-[clamp(1.5rem,4vw,2.5rem)] leading-[1.15] tracking-[0.08em] text-ink">
          <WordReveal text={t('contact.title')} />
        </h1>

        <span aria-hidden="true" className="mt-6 block h-px w-16 bg-gold" />

        <p className="mt-6 text-base leading-relaxed text-ink-muted sm:text-lg">{t('contact.lead')}</p>

        <p className="mt-4 inline-flex items-center gap-2.5 text-base text-ink-muted">
          <Clock size={16} strokeWidth={1.5} className="shrink-0 text-gold" />
          {settings.horaires}
        </p>
      </motion.div>

      {/* Direct channels */}
      <motion.div
        initial={reduced ? false : 'hidden'}
        whileInView={reduced ? undefined : 'visible'}
        viewport={viewportOnce}
        variants={gridContainer}
        className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {channels.map((c) => (
          <ChannelCard key={c.label} {...c} />
        ))}
      </motion.div>

      <SectionDivider className="mt-16" />

      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Form */}
        <Reveal>
          <h2 className="font-display text-base tracking-[0.12em] text-ink">{t('contact.writeTitle')}</h2>
          <span aria-hidden="true" className="mt-4 block h-px w-10 bg-gold" />

          {/* The success panel and the form swap in place rather than one
              replacing the other on the next paint. */}
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div
                key="sent"
                initial={reduced ? false : { opacity: 0, transform: 'translateY(10px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                className="mt-6 flex flex-col items-start gap-4 rounded-sm border border-gold/50 bg-olive/4 p-6"
              >
                <motion.div
                  initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: reduced ? 0 : 0.1, ease: EASE_OUT }}
                >
                  <EvoraTree size={56} className="text-sand" />
                </motion.div>

                <div>
                  <p className="font-display text-base tracking-[0.12em] text-ink">{t('contact.sent')}</p>
                  <p className="mt-2 text-base leading-relaxed text-ink-muted">{t('contact.sentLead')}</p>
                </div>

                <Button
                  onClick={() => {
                    setSent(false);
                    setForm({ nom: '', telephone: '', email: '', sujet: '', message: '' });
                  }}
                  variant="secondary"
                  size="sm"
                >
                  {t('contact.writeAnother')}
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                noValidate
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="mt-6 flex flex-col gap-5"
              >
                <AnimatePresence>
                  {submitError ? (
                    <motion.div
                      role="alert"
                      initial={reduced ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={reduced ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: EASE_OUT }}
                      className="overflow-hidden"
                    >
                      <p className="rounded-sm border border-[#8C2F1F]/40 bg-[#8C2F1F]/5 px-4 py-3 text-base text-[#8C2F1F]">
                        {submitError}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <Field
                  label={t('checkout.name')}
                  required
                  autoComplete="name"
                  value={form.nom}
                  onChange={set('nom')}
                  error={errors.nom}
                />

                <Field
                  label={t('checkout.phone')}
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
                  label={t('checkout.email')}
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={set('email')}
                  error={errors.email}
                />

                <Field label={t('contact.subject')} value={form.sujet} onChange={set('sujet')} />

                <TextArea
                  label={t('contact.message')}
                  required
                  rows={5}
                  value={form.message}
                  onChange={set('message')}
                  error={errors.message}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="self-start"
                >
                  {loading ? `${t('contact.sending')}…` : t('contact.send')}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>

        {/* Map */}
        <Reveal delay={0.08}>
          <h2 className="font-display text-base tracking-[0.12em] text-ink">{t('contact.findTitle')}</h2>
          <span aria-hidden="true" className="mt-4 block h-px w-10 bg-gold" />

          {/* The client's own Google Maps place, not a bounding box around El
              Khroub. It resolves to the Evora Home pin, so "Ouvrir dans Maps"
              and the embed agree with each other. */}
          <div className="mt-6 overflow-hidden rounded-sm border border-greige">
            <iframe
              title={t('contact.mapTitle')}
              src={MAP_EMBED}
              className="h-[22rem] w-full border-0 lg:h-[26rem]"
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            {settings.adresse}. {t('contact.guideLead')}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              href={`https://www.google.com/maps/search/${encodeURIComponent(
                `Evora Home ${settings.adresse}`
              )}`}
              target="_blank"
              rel="noreferrer noopener"
              variant="secondary"
              size="md"
            >
              {t('contact.openMaps')}
            </Button>
            <Button to="/showroom" variant="secondary" size="md">
              {t('showroom.title')}
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
