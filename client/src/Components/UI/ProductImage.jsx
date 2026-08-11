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
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
  loading = 'lazy',
  priority = false,
  children,
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <div
      className={`relative aspect-[4/5] overflow-hidden rounded-sm border border-greige bg-greige/30 ${className}`}
    >
      {showFallback ? (
        <div className="h-full w-full bg-greige/40" />
      ) : (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : loading}
          // The frame reserves the box via aspect-ratio, so decoding async
          // costs no layout shift.
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      )}

      {children}
    </div>
  );
}
