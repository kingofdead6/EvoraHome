import EvoraTree from './EvoraTree';

/**
 * The tree mark centred between two gold hairlines. This is the only thing that
 * separates major page sections. Use it sparingly: if two dividers end up
 * within one screen of each other, one of the sections between them did not
 * need to exist.
 */
export default function SectionDivider({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-5 ${className}`} aria-hidden="true">
      <span className="h-px w-full max-w-[8rem] bg-gold/45 sm:max-w-[12rem]" />
      <EvoraTree size={34} variant="compact" className="shrink-0 text-gold" />
      <span className="h-px w-full max-w-[8rem] bg-gold/45 sm:max-w-[12rem]" />
    </div>
  );
}
