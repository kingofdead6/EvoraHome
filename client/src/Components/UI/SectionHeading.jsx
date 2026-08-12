import { Link } from 'react-router-dom';

/**
 * A section masthead: the title in Cinzel, a gold hairline running out to the
 * edge of the column, and an optional link parked at the end of that rule.
 *
 * The rule is the whole idea. It is what stops a page of stacked sections from
 * reading as a list of headings with paragraphs under them, and it is built
 * from the one decorative element this brand allows itself.
 */
export default function SectionHeading({
  title,
  intro,
  eyebrow,
  actionLabel,
  actionTo,
  as: Heading = 'h2',
  tone = 'ink',
  className = '',
}) {
  const onOlive = tone === 'cream';

  return (
    <div className={className}>
      {eyebrow ? (
        <p
          className={`mb-3 text-[12px] uppercase tracking-[0.22em] ${
            onOlive ? 'text-sand' : 'text-gold-deep'
          }`}
        >
          {eyebrow}
        </p>
      ) : null}

      <div className="flex items-center gap-4 sm:gap-5">
        {/* The heading must be allowed to wrap. Holding it at its intrinsic
            width so the rule always sits on the same line pushed "Venez voir,
            toucher, vous asseoir" 118px past the right edge at 360px and panned
            the whole document sideways. */}
        <Heading
          className={`min-w-0 font-display text-xl leading-tight tracking-[0.12em] sm:text-2xl ${
            onOlive ? 'text-cream' : 'text-ink'
          }`}
        >
          {title}
        </Heading>

        <span
          aria-hidden="true"
          className={`h-px w-8 shrink-0 sm:w-auto sm:min-w-0 sm:flex-1 ${
            onOlive ? 'bg-gold/40' : 'bg-gold/55'
          }`}
        />

        {actionLabel && actionTo ? (
          <Link
            to={actionTo}
            className={`hidden shrink-0 items-center text-sm uppercase tracking-[0.15em] underline decoration-gold decoration-1 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-2 sm:inline-flex ${
              onOlive ? 'text-sand hover:text-cream' : 'text-ink'
            }`}
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>

      {intro ? (
        <p className={`mt-4 max-w-xl text-base leading-relaxed ${onOlive ? 'text-sand' : 'text-ink-muted'}`}>
          {intro}
        </p>
      ) : null}

      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className={`mt-4 inline-flex min-h-[44px] items-center text-sm uppercase tracking-[0.15em] underline decoration-gold decoration-1 underline-offset-4 sm:hidden ${
            onOlive ? 'text-sand' : 'text-ink'
          }`}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
