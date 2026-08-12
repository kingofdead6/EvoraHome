import { Link } from 'react-router-dom';

/**
 * The only button on the site.
 *
 * Every variant is checked for contrast against the surface it sits on, and
 * every one is at least 44px tall so it is a legal tap target on a phone.
 * Corners are 4px. There is no shadow and no gradient.
 */

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-sm font-sans tracking-[0.08em] uppercase ' +
  'transition-[background-color,border-color,color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 text-center';

const VARIANTS = {
  // Cream on olive: 8.80:1
  primary: 'bg-olive text-cream hover:bg-forest',
  // Ink on cream with a greige hairline. Separation comes from the border.
  secondary: 'bg-transparent text-ink border border-greige hover:border-gold hover:bg-greige/25',
  // On olive surfaces. Sand on olive: 5.93:1
  onOlive: 'bg-transparent text-sand border border-sand/40 hover:border-gold hover:text-cream',
  // The filled counterpart, for the primary action on an olive band. Ink on
  // cream: 14.4:1. This is a variant rather than a className override because
  // Tailwind resolves conflicting utilities by stylesheet order, not by the
  // order they appear in the class attribute, so `bg-cream` after
  // `bg-transparent` is not reliably the winner.
  onOliveSolid: 'bg-cream text-ink border border-cream hover:bg-sand hover:border-sand',
  // Text-only. Underline is the affordance, not a colour change.
  ghost: 'bg-transparent text-ink underline decoration-gold decoration-1 underline-offset-4 hover:decoration-2',
  danger: 'bg-transparent text-[#8C2F1F] border border-[#8C2F1F]/40 hover:bg-[#8C2F1F]/8',
};

const SIZES = {
  // 44px floor on every size. `sm` is dense but still tappable.
  sm: 'min-h-[44px] px-4 text-sm',
  md: 'min-h-[48px] px-6 text-sm',
  lg: 'min-h-[54px] px-8 text-sm',
};

export default function Button({
  as,
  to,
  href,
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [BASE, VARIANTS[variant] || VARIANTS.primary, SIZES[size], full ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const Component = as || 'button';

  return (
    <Component
      // A bare <button> inside a <form> defaults to type="submit", so every
      // secondary action placed in a form — "add a colour", "cancel" — silently
      // submitted it. Defaulting to "button" makes submitting opt-in, which is
      // the safe direction: a missed type="submit" is a button that does
      // nothing and is noticed immediately, while a missed type="button" saves
      // a half-filled record and closes the form. Callers that mean to submit
      // pass type="submit" and it overrides this via {...rest}.
      {...(Component === 'button' ? { type: 'button' } : null)}
      className={classes}
      {...rest}
    >
      {children}
    </Component>
  );
}
