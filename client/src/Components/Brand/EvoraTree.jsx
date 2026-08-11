/**
 * EvoraTree — the tree mark from the Evora Home logo card.
 *
 * The one repeating design element of this site. It is used in exactly four
 * places and nowhere else:
 *   1. the loading state
 *   2. the SectionDivider between major page sections
 *   3. the empty-state illustration
 *   4. an oversized low-opacity watermark behind the footer
 * One device used four times reads as art direction. The same device used
 * fifteen times reads as a template.
 *
 * Geometry is traced from the printed card: two vertical trunks stand as the
 * house walls, one long 45 degree branch from each meets at the gable apex,
 * and a 2x2 window glyph sits centred between them. Every branch tip is
 * clipped to a circle so the canopy reads round.
 *
 * The strokes are one path made of many subpaths, which lets the whole mark be
 * drawn on with a single stroke-dashoffset tween (see Hero) and keeps it to
 * two DOM nodes instead of 154.
 */

// Three levels of branching. Legible at 64px and up.
const FULL_D =
  'M140 188L140 29M140 154L124.4 138.4M135.3 149.3L126.5 149.3M132.2 146.2L132.2 137.4' +
  'M129.1 143.1L120.3 143.1M126.3 140.3L126.3 131.5M140 124L106 90M128.4 112.4L115.9 112.4' +
  'M123.4 112.4L119.4 116.5M119.2 112.4L115.1 108.4M116.9 100.9L116.9 88.4M116.9 95.9L112.8 91.8' +
  'M116.9 91.6L120.9 87.6M140 118L176.6 81.4M151 107L151 86.3M151 98.7L144.2 92M151 91.7L157.7 84.9' +
  'M158.3 99.7L177.9 99.7M166.2 99.7L172.5 93.3M172.8 99.7L177.5 104.4M165.6 92.4L165.6 71.7' +
  'M165.6 84.1L158.9 77.3M165.6 77L172.4 70.3M172.2 85.8L177.3 85.8M140 96L118.8 74.8' +
  'M133.6 89.6L121.6 89.6M128.8 89.6L124.9 93.5M124.8 89.6L120.9 85.7M129.4 85.4L129.4 73.4' +
  'M129.4 80.6L125.5 76.7M129.4 76.5L133.3 72.6M125.2 81.2L113.2 81.2M120.4 81.2L116.4 85.1' +
  'M116.3 81.2L112.4 77.2M121.3 77.3L121.3 65.3M121.3 72.5L117.4 68.6M121.3 68.5L125.2 64.5' +
  'M140 84L167.3 56.7M148.2 75.8L148.2 60.3M148.2 69.6L143.2 64.6M148.2 64.3L153.2 59.3' +
  'M153.7 70.3L169.1 70.3M159.9 70.3L164.9 65.3M165.1 70.3L170.2 75.4M159.1 64.9L159.1 49.4' +
  'M159.1 58.7L154.1 53.6M159.1 53.4L162.8 49.7M164.1 59.9L169.2 59.9M140 66L108.9 34.9' +
  'M130.7 56.7L113.1 56.7M123.6 56.7L117.9 62.4M117.6 56.7L111.9 50.9M124.4 50.4L124.4 32.8' +
  'M124.4 43.4L118.7 37.7M124.4 37.4L130.2 31.7M118.2 44.2L100.6 44.2M111.2 44.2L105.5 49.9' +
  'M105.2 44.2L99.5 38.5M112.6 38.6L112.6 21M112.6 31.6L106.9 25.9M112.6 25.6L118.1 20.1' +
  'M140 52L153.1 38.9M143.9 48.1L143.9 40.6M146.6 45.4L154 45.4M149.2 42.8L149.2 35.5' +
  'M140 40L120.8 20.8M134.3 34.3L123.4 34.3M130.4 30.4L130.4 24.2M126.6 26.6L115.7 26.6' +
  'M72 188L72 23.2M72 170L28 126M58.8 156.8L51.1 156.8M50 148L50 123.1M50 138L41.9 129.9' +
  'M50 129.6L58.1 121.5M41.2 139.2L35.1 139.2M33.3 131.3L33.3 106.4M33.3 121.3L25.2 113.2' +
  'M33.3 112.9L41.4 104.8M72 150L84.7 137.3M75.8 146.2L75.8 139M78.4 143.6L85.6 143.6' +
  'M80.9 141.1L80.9 133.9M83.2 138.8L90.4 138.8M72 124L106 90M83.6 112.4L83.6 99.9' +
  'M83.6 107.4L79.5 103.4M83.6 103.2L87.6 99.1M95.1 100.9L107.6 100.9M100.1 100.9L104.2 96.8' +
  'M104.4 100.9L108.4 104.9M72 130L23.4 81.4M57.4 115.4L29.9 115.4M46.4 115.4L37.5 124.4' +
  'M37.1 115.4L28.1 106.5M47.7 105.7L47.7 78.2M47.7 94.7L38.7 85.7M47.7 85.3L56.6 76.4M38 96L22 96' +
  'M31.6 96L26.4 101.2M26.2 96L22.1 91.9M29.2 87.2L29.2 63.2M29.2 77.6L25.3 73.7M29.2 69.5L37 61.7' +
  'M72 106L29.2 63.2M59.2 93.2L35 93.2M49.5 93.2L41.6 101M41.3 93.2L33.4 85.3M50.6 84.6L50.6 60.4' +
  'M50.6 74.9L42.7 67.1M50.6 66.7L58.5 58.8M42.1 76.1L24.6 76.1M35.1 76.1L29.4 81.7' +
  'M29.1 76.1L25.6 72.5M34.4 68.4L34.4 53.9M34.4 62.6L31.1 59.4M34.4 57.6L39.1 52.9M72 92L90.4 73.6' +
  'M77.5 86.5L77.5 76.1M81.2 82.8L91.6 82.8M84.9 79.1L84.9 68.7M88.2 75.8L98.6 75.8M72 74L41.9 43.9' +
  'M63 65L46 65M56.2 65L50.6 70.5M50.4 65L44.9 59.4M57 59L57 42M57 52.2L51.4 46.6M57 46.4L62.5 40.8' +
  'M50.9 52.9L35 52.9M44.6 52.9L39.4 58.2M45.5 47.5L45.5 40.2M72 60L104.5 27.5M81.8 50.2L81.8 31.8' +
  'M81.8 42.9L75.8 36.9M81.8 36.6L87.7 30.6M88.3 43.7L106.7 43.7M95.6 43.7L101.6 37.8' +
  'M101.9 43.7L107.9 49.7M94.8 37.2L94.8 18.8M94.8 29.9L88.8 23.9M94.8 23.6L100.4 18' +
  'M100.6 31.4L119 31.4M108 31.4L114 25.4M114.2 31.4L120.2 37.4M72 42L59.4 29.4M68.2 38.2L61.1 38.2' +
  'M65.7 35.7L65.7 28.6M63.2 33.2L56.1 33.2M72 34L86.9 19.1M76.5 29.5L76.5 21.6M79.4 26.6L87.9 26.6' +
  'M82.4 23.6L82.4 20M85.1 20.9L93.5 20.9';

// Two levels. Used below 64px, where the full canopy collapses into a blob.
const COMPACT_D =
  'M140 188L140 29M140 154L124.4 138.4M134.4 148.4L125.6 148.4M130 144L130 135.2' +
  'M126.3 140.3L117.5 140.3M140 124L106 90M128.4 112.4L115.9 112.4M116.9 100.9L116.9 88.4' +
  'M140 118L176.6 81.4M153.2 104.8L153.2 84.1M163.4 94.6L178 94.6M172.2 85.8L172.2 66.5' +
  'M140 96L118.8 74.8M132.4 88.4L120.4 88.4M126.4 82.4L126.4 70.4M121.3 77.3L109.3 77.3' +
  'M140 84L167.3 56.7M149.8 74.2L149.8 58.7M157.5 66.5L172.2 66.5M164.1 59.9L164.1 51.5' +
  'M140 66L108.9 34.9M128.8 54.8L111.2 54.8M120.1 46.1L120.1 28.5M112.6 38.6L95 38.6' +
  'M140 52L153.1 38.9M144.7 47.3L144.7 39.9M148.4 43.6L155.8 43.6M140 40L120.8 20.8' +
  'M133.1 33.1L122.3 33.1M127.7 27.7L127.7 23.1M123.1 23.1L112.3 23.1M72 188L72 23.2M72 170L28 126' +
  'M56.2 154.2L48 154.2M43.8 141.8L43.8 116.9M72 150L84.7 137.3M76.6 145.4L76.6 138.2' +
  'M80.1 141.9L87.3 141.9M83.2 138.8L83.2 131.6M72 124L106 90M83.6 112.4L83.6 99.9' +
  'M95.1 100.9L107.6 100.9M72 130L23.4 81.4M54.5 112.5L27 112.5M40.9 98.9L40.9 71.4' +
  'M29.2 87.2L22.5 87.2M72 106L29.2 63.2M56.6 90.6L32.4 90.6M44.6 78.6L44.6 54.4' +
  'M34.4 68.4L27.1 68.4M72 92L90.4 73.6M78.6 85.4L78.6 75M83.8 80.2L94.2 80.2M88.2 75.8L88.2 65.4' +
  'M72 74L41.9 43.9M61.2 63.2L44.2 63.2M52.8 54.8L52.8 37.7M45.5 47.5L38.9 47.5M72 60L104.5 27.5' +
  'M83.7 48.3L83.7 29.9M92.8 39.2L111.2 39.2M100.6 31.4L100.6 18M72 42L59.4 29.4' +
  'M67.5 37.5L60.3 37.5M63.9 33.9L63.9 26.8M60.9 30.9L57 30.9M72 34L86.9 19.1M77.4 28.6L77.4 21.4' +
  'M81.5 24.5L90 24.5';

const WINDOW_PANES = [
  { x: 93.8, y: 145.8 },
  { x: 107.8, y: 145.8 },
  { x: 93.8, y: 159.8 },
  { x: 107.8, y: 159.8 },
];

export default function EvoraTree({
  size = 96,
  variant = 'auto',
  strokeWidth,
  className = '',
  title,
  pathRef,
  windowStyle,
  ...rest
}) {
  const compact = variant === 'compact' || (variant === 'auto' && size < 64);
  const d = compact ? COMPACT_D : FULL_D;
  const sw = strokeWidth ?? (compact ? 4.6 : 3.2);

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill="none"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path
        ref={pathRef}
        d={d}
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* The window panes are fills, so a stroke-dashoffset draw does not touch
          them. The Intro passes windowStyle to fade them in after the strokes
          finish, otherwise the window pops in before its house exists. */}
      <g fill="currentColor" style={windowStyle}>
        {WINDOW_PANES.map((p) => (
          <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width="10.5" height="10.5" rx="1.8" />
        ))}
      </g>
    </svg>
  );
}
