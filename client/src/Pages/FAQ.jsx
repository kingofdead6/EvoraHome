import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

import { useSettings } from '../lib/settings';
import { formatPhone, toInternational } from '../lib/format';
import {
  revealVariants,
  revealTransition,
  viewportOnce,
  wordContainer,
  wordItem,
  EASE_OUT,
  useReducedMotion,
} from '../lib/motion';

import Button from '../Components/UI/Button';
import SectionDivider from '../Components/Brand/SectionDivider';
import { useI18n } from '../lib/i18n';

/** Translation keys rather than copy: this array lives at module scope,
 *  outside any component, so no hook can resolve the text here. */
const FAQ_ITEMS = [
  { questionKey: 'faq.q1', answerKey: 'faq.a1' },
  { questionKey: 'faq.q2', answerKey: 'faq.a2' },
  { questionKey: 'faq.q3', answerKey: 'faq.a3' },
  { questionKey: 'faq.q4', answerKey: 'faq.a4' },
  { questionKey: 'faq.q5', answerKey: 'faq.a5' },
];

/** Words rise out of a clipped line. Matches the home and showroom headings. */
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

/**
 * One question.
 *
 * This replaces the native <details>, which snaps open with no transition and
 * cannot be animated: `height: auto` is not interpolable in CSS and the element
 * has no intermediate state to hook. Framer measures the panel and animates to
 * its real height, so the answer slides rather than appearing.
 *
 * The accessible contract of <details> is rebuilt by hand: the trigger is a
 * real <button> carrying aria-expanded and aria-controls, and the panel is
 * labelled by it. Only one item is open at a time, which keeps the column from
 * growing past a screen and makes the motion legible.
 */
function Question({ item, isOpen, onToggle, index }) {
  const reduced = useReducedMotion();
  const { t } = useI18n();
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <motion.div
      initial={reduced ? false : 'hidden'}
      whileInView={reduced ? undefined : 'visible'}
      viewport={viewportOnce}
      variants={revealVariants}
      transition={{ ...revealTransition, delay: index * 0.06 }}
      className={`rounded-sm border bg-cream transition-colors duration-300 ${
        isOpen ? 'border-gold' : 'border-greige'
      }`}
    >
      <h3>
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 px-5 py-5 text-start sm:px-6"
        >
          <span
            className={`font-sans text-base leading-snug transition-colors duration-200 sm:text-lg ${
              isOpen ? 'text-gold-deep' : 'text-ink'
            }`}
          >
            {t(item.questionKey)}
          </span>

          {/* A plus that rotates into a minus. Cheaper to read than a chevron
              and it never looks like a back arrow at small sizes. */}
          <motion.span
            aria-hidden="true"
            animate={reduced ? undefined : { rotate: isOpen ? 135 : 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border transition-colors duration-200 ${
              isOpen ? 'border-gold text-gold-deep' : 'border-greige text-ink-muted'
            }`}
          >
            <Plus size={16} strokeWidth={1.5} />
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="panel"
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.34, ease: EASE_OUT },
              // Opacity trails the height slightly so the text does not appear
              // before there is room for it.
              opacity: { duration: 0.24, ease: EASE_OUT, delay: isOpen ? 0.06 : 0 },
            }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <span aria-hidden="true" className="mb-4 block h-px w-10 bg-gold" />
              <p className="text-base leading-relaxed text-ink-muted">{t(item.answerKey)}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const settings = useSettings();
  const { t } = useI18n();
  // Open the first question by default: an accordion where everything is shut
  // gives a first-time visitor nothing to read and no clue what a row does.
  const [openIndex, setOpenIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-10">
      <motion.div
        initial={reduced ? false : { opacity: 0, transform: 'translateY(16px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="font-sans text-[12px] uppercase tracking-[0.28em] text-gold-deep">
            {t('faq.eyebrow')}
          </p>

          <h1 className="mt-4 max-w-2xl font-display text-3xl leading-[1.15] tracking-[0.04em] text-ink sm:text-4xl">
            <WordReveal text={t('faq.title')} />
          </h1>
        </div>

        <Button to="/contact" variant="secondary" size="lg">
          {t('faq.contactCta')}
        </Button>
      </motion.div>

      <SectionDivider className="my-10" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-8">
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <Question
              key={item.questionKey}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>

        <motion.aside
          initial={reduced ? false : 'hidden'}
          whileInView={reduced ? undefined : 'visible'}
          viewport={viewportOnce}
          variants={revealVariants}
          transition={{ ...revealTransition, delay: 0.1 }}
          className="h-fit rounded-sm border border-greige bg-olive/[0.06] p-6 lg:sticky lg:top-24"
        >
          <p className="font-sans text-[12px] uppercase tracking-[0.18em] text-ink-muted">
            {t('faq.helpTitle')}
          </p>

          <span aria-hidden="true" className="mt-4 block h-px w-10 bg-gold" />

          <div className="mt-5 flex flex-col gap-3 text-base leading-relaxed text-ink">
            <p>
              {t('faq.callBefore')}{' '}
              <a
                href={`tel:+${toInternational(settings.telephone)}`}
                className="tabular-nums text-ink underline decoration-gold decoration-1 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2"
              >
                {formatPhone(settings.telephone)}
              </a>
              .
            </p>
            <p>
              {t('faq.orWriteBefore')}{' '}
              <Link
                to="/contact"
                className="text-ink underline decoration-gold decoration-1 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2"
              >
                {t('faq.contactPage')}
              </Link>
              .
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3">
            <Button to="/showroom" variant="secondary" size="md" full>
              {t('faq.seeShowroom')}
            </Button>
            <Button to="/catalogue" variant="primary" size="md" full>
              {t('faq.exploreCatalogue')}
            </Button>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
