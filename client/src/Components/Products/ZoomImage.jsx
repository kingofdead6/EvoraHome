import { useCallback, useRef, useState } from 'react';

/**
 * A product photo that magnifies wherever the pointer is.
 *
 * The frame stays exactly where it is and the image inside it scales up around
 * the cursor, so the customer inspects the weave of a fabric or the join of a
 * drawer without leaving the page. This is the one interaction on the site that
 * earns a large movement: judging a material is the thing a photograph is worst
 * at, and it is the reason people drive to the showroom.
 *
 * How the tracking works: the pointer position is converted to a percentage of
 * the frame, and that percentage becomes the image's `transform-origin`. At
 * origin 0% 0% the top-left corner stays put while everything else grows away
 * from it, so the pixel under the cursor is the pixel that stays under the
 * cursor at any scale. No offset maths and no dependency on the image's
 * intrinsic size.
 *
 * Deliberately pointer-only. On a phone this is disabled entirely: there is no
 * hover, a tap would fight the scroll, and pinch-to-zoom already does this job
 * better than any handler we could write. Touch users get the plain image.
 */
export default function ZoomImage({
  src,
  alt = '',
  scale = 2.4,
  className = '',
  imgClassName = '',
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority = false,
  children,
}) {
  const frameRef = useRef(null);
  const [origin, setOrigin] = useState('50% 50%');
  const [zoomed, setZoomed] = useState(false);
  const [failed, setFailed] = useState(false);
  // True only while the image is easing back to rest. Kept separate from
  // `zoomed` so the transition exists for the zoom-out but not while tracking.
  const [settling, setSettling] = useState(false);

  const track = useCallback((e) => {
    const frame = frameRef.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    // Clamped because a fast pointer can report a position a fraction outside
    // the frame before the leave handler fires, which would jerk the origin
    // past the edge and show the image's own border.
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);

    setOrigin(`${x * 100}% ${y * 100}%`);
  }, []);

  // A pointer that is not a mouse (touch, pen) never turns zoom on.
  const handleEnter = (e) => {
    if (e.pointerType !== 'mouse') return;
    track(e);
    setSettling(false);
    setZoomed(true);
  };

  const handleMove = (e) => {
    if (e.pointerType !== 'mouse' || !zoomed) return;
    track(e);
  };

  // The origin is left where it was so the image shrinks back toward the point
  // the customer was inspecting rather than snapping to centre first.
  const handleLeave = () => {
    setZoomed(false);
    setSettling(true);
  };

  const showFallback = !src || failed;

  return (
    <div
      ref={frameRef}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      // `cursor-zoom-in` is scoped to hover-capable pointers so a touch device,
      // where the interaction does not exist, never shows a magnifier cursor.
      className={`relative aspect-product overflow-hidden rounded-sm border border-greige bg-greige/30 [@media(hover:hover)]:cursor-zoom-in ${className}`}
    >
      {showFallback ? (
        <div className="h-full w-full bg-greige/40" />
      ) : (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          onError={() => setFailed(true)}
          draggable={false}
          style={{
            transformOrigin: origin,
            transform: zoomed ? `scale(${scale})` : 'scale(1)',
          }}
          onTransitionEnd={() => setSettling(false)}
          // The transform is deliberately not transitioned while tracking: the
          // origin changes on every pointer move, and easing that makes the
          // image swim behind the cursor instead of staying locked to it. The
          // transition exists only for the zoom-out, hence `settling`.
          className={`h-full w-full object-cover will-change-transform ${
            settling ? 'transition-transform duration-500 ease-out-strong' : ''
          } ${imgClassName}`}
        />
      )}

      {children}
    </div>
  );
}
