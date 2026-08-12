/**
 * Shared admin primitives. Denser than the storefront's: smaller type, tighter
 * padding, tables instead of cards. Tap targets stay at 44px because the client
 * will work through orders on a phone as often as on a laptop.
 */

export function PageHeader({ title, description, children }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-lg tracking-[0.12em] text-ink">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-ink-muted">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </header>
  );
}

export function Panel({ title, children, className = '' }) {
  return (
    <section className={`rounded-sm border border-greige bg-cream ${className}`}>
      {title ? (
        <h2 className="border-b border-greige px-4 py-3 text-[12px] uppercase tracking-[0.18em] text-ink-muted">
          {title}
        </h2>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

/**
 * A dashboard metric.
 *
 * The number shrinks a step on the narrowest screens: at 360px, two of these
 * side by side with a six-figure revenue figure in `text-2xl` pushed the digits
 * into the neighbouring cell.
 */
export function Metric({ label, value, hint }) {
  return (
    <div className="rounded-sm border border-greige px-4 py-4">
      <p className="text-[12px] uppercase tracking-[0.15em] text-ink-muted">{label}</p>
      <p className="mt-2 font-sans text-xl tabular-nums text-ink sm:text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-[12px] leading-snug text-ink-muted">{hint}</p> : null}
    </div>
  );
}

/**
 * Table wrapper. Scrolls horizontally inside its own container so a wide table
 * never makes the page itself scroll sideways at 360px.
 *
 * The negative margin cancels the 16px padding of the `Panel` it usually sits
 * in, so the scrollable strip runs to the panel's inner edges instead of
 * starting 16px in and leaving a dead gutter that looks like a rendering fault.
 * `px-4` on the inner element puts that padding back on the content itself, so
 * the first column is not flush against the border.
 */
export function TableWrap({ children, className = '' }) {
  return (
    <div className={`-mx-4 overflow-x-auto ${className}`}>
      <div className="inline-block min-w-full px-4 align-middle">
        <table className="min-w-full border-collapse text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

/**
 * The same rows as a table on desktop, as a stack of cards on a phone.
 *
 * A five-column order table at 360px means scrolling sideways to find out what
 * an order was worth, on the screen the client is most likely to check between
 * customers. Below `md` each row becomes its own bordered block with the label
 * beside each value; from `md` the table returns, because scanning twenty
 * orders is what a table is genuinely better at.
 */
export function CardList({ children, className = '' }) {
  return <div className={`flex flex-col gap-3 md:hidden ${className}`}>{children}</div>;
}

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-sm border border-greige px-3.5 py-3 ${className}`}>{children}</div>
  );
}

/** One labelled line inside a Card. `label` is omitted for the leading row. */
export function CardRow({ label, children, className = '' }) {
  if (!label) return <div className={className}>{children}</div>;

  return (
    <div className={`flex items-baseline justify-between gap-3 ${className}`}>
      <span className="shrink-0 text-[12px] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
      <span className="min-w-0 text-right text-sm text-ink">{children}</span>
    </div>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap border-b border-greige px-3 py-2.5 text-[12px] font-normal uppercase tracking-[0.12em] text-ink-muted ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = '' }) {
  return <td className={`border-b border-greige px-3 py-3 align-top text-ink ${className}`}>{children}</td>;
}

export function AdminInput({ label, className = '', ...rest }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label ? (
        <span className="text-[12px] uppercase tracking-[0.12em] text-ink-muted">{label}</span>
      ) : null}
      <input
        className={`min-h-[44px] rounded-sm border border-greige bg-cream px-3 text-base text-ink transition-colors focus:border-gold focus:outline-none ${className}`}
        {...rest}
      />
    </label>
  );
}

export function AdminTextArea({ label, rows = 3, className = '', ...rest }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label ? (
        <span className="text-[12px] uppercase tracking-[0.12em] text-ink-muted">{label}</span>
      ) : null}
      <textarea
        rows={rows}
        className={`rounded-sm border border-greige bg-cream px-3 py-2 text-base text-ink transition-colors focus:border-gold focus:outline-none ${className}`}
        {...rest}
      />
    </label>
  );
}

export function AdminSelect({ label, children, className = '', ...rest }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label ? (
        <span className="text-[12px] uppercase tracking-[0.12em] text-ink-muted">{label}</span>
      ) : null}
      <select
        className={`min-h-[44px] rounded-sm border border-greige bg-cream px-3 text-base text-ink transition-colors focus:border-gold focus:outline-none ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

/** Inline status line. Replaces toasts for save feedback, which stays put. */
export function StatusLine({ status }) {
  if (!status) return null;
  return (
    <p role="status" className={`text-sm ${status.ok ? 'text-ink' : 'text-[#8C2F1F]'}`}>
      {status.message}
    </p>
  );
}
