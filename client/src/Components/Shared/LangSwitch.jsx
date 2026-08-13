import { useI18n, LANGS } from '../../lib/i18n';

/**
 * The French / Arabic toggle.
 *
 * A two-state segmented control rather than a dropdown: with exactly two
 * options a select costs a tap to discover what a glance already shows, and the
 * inactive label doubles as the affordance.
 *
 * Each label is rendered in its own language — "Français" and "العربية", never
 * "Arabe" or "الفرنسية". Somebody looking for their language is scanning for
 * the shape of their own script, not for its name in a language they may not
 * read.
 */
export default function LangSwitch({ className = '', tone = 'light' }) {
  const { lang, setLang, t } = useI18n();

  const base =
    tone === 'onOlive'
      ? { idle: 'text-sand hover:text-cream', active: 'bg-cream/15 text-cream', ring: 'border-sand/30' }
      : { idle: 'text-ink-muted hover:text-ink', active: 'bg-olive text-cream', ring: 'border-greige' };

  return (
    <div
      role="group"
      aria-label={t('lang.switch')}
      className={`overflow-hidden rounded-sm border ${base.ring} ${className}`}
    >
      {LANGS.map((l) => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            // The full language name is the accessible name; the button shows
            // the short form to stay inside a navbar.
            aria-label={l.label}
            lang={l.code}
            className={`flex min-h-[36px] min-w-[38px] items-center justify-center px-2.5 text-[12px] tracking-[0.08em] transition-colors duration-200 ${
              active ? base.active : base.idle
            }`}
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}
