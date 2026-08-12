import { useState } from 'react';

/**
 * The 4:5 frame every product photo on this site sits in.
 *
 * This is the single most important component for how the site reads. The
 * client's photography is inconsistent: showroom tile floors, mixed white
 * balance, phone shots at every aspect ratio. A uniform frame with a greige
 * hairline is what makes a mismatched set look deliberate rather than
 * scraped together.
 *
 * A missing or broken image falls back to an empty greige field, not to a
 * broken-image glyph and deliberately not to the tree mark. The mark has four
 * sanctioned placements; putting it here would put seven of them on the home
 * page alone, which is exactly how one device stops reading as art direction
 * and starts reading as a template.
 */
export default function ProductImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  // The 4:5 crop is the default and the rule. It is a prop rather than
  // something callers override through className because two aspect utilities
  // on one element resolve by stylesheet order, not by class order, so an
  // override there wins or loses depending on which Tailwind emitted last.
  aspect = 'aspect-[4/5]',
  // A second URL to try when `src` 404s. The showroom page points at the
  // client's own files first and at a stand-in second, so the page is never
  // four empty frames before the photography arrives.
  fallbackSrc,
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
  loading = 'lazy',
  priority = false,
  children,
}) {
  // `stage` is 0 for src and 1 for fallbackSrc; anything past the last URL
  // means every candidate failed and the empty frame stands in.
  const [stage, setStage] = useState(0);
  const candidates = [src, fallbackSrc].filter(Boolean);
  const current = candidates[stage];

  // A new src is a new image: reset the ladder, or a card that recycles a
  // failed slot keeps showing the empty frame for a photo that is fine.
  const [seen, setSeen] = useState(src);
  if (seen !== src) {
    setSeen(src);
    setStage(0);
  }

  return (
    <div
      className={`relative ${aspect} overflow-hidden rounded-sm border border-greige bg-greige/30 ${className}`}
    >
      {!current ? (
        <div className="h-full w-full bg-greige/40" />
      ) : (
        <img
          // Keyed so that swapping to the fallback remounts rather than
          // leaving the browser's failed-image state on the element.
          key={current}
          src={current}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : loading}
          // The frame reserves the box via aspect-ratio, so decoding async
          // costs no layout shift.
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          onError={() => setStage((s) => s + 1)}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      )}

      {children}
    </div>
  );
}
