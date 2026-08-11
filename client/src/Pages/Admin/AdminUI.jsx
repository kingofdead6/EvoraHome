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
        {description ? <p className="mt-1.5 text-[13px] text-ink-muted">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </header>
  );
}

export function Panel({ title, children, className = '' }) {
  return (
    <section className={`rounded-sm border border-greige bg-cream ${className}`}>
      {title ? (
        <h2 className="border-b border-greige px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          {title}
        </h2>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

/** A dashboard metric. Plain layout, no card chrome around the number. */
export function Metric({ label, value, hint }) {
  return (
    <div className="rounded-sm border border-greige px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.15em] text-ink-muted">{label}</p>
      <p className="mt-2 font-sans text-2xl tabular-nums text-ink">{value}</p>
      {hint ? <p className="mt-1 text-[12px] text-ink-muted">{hint}</p> : null}
    </div>
  );
}

/**
 * Table wrapper. Scrolls horizontally inside its own container so a wide order
 * table never makes the page itself scroll sideways at 360px.
 */
export function TableWrap({ children }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <div className="inline-block min-w-full align-middle sm:px-0">
        <table className="min-w-full border-collapse text-left text-[13px]">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap border-b border-greige px-3 py-2.5 text-[11px] font-normal uppercase tracking-[0.12em] text-ink-muted ${className}`}
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
        <span className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">{label}</span>
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
        <span className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">{label}</span>
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
        <span className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">{label}</span>
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
    <p role="status" className={`text-[13px] ${status.ok ? 'text-ink' : 'text-[#8C2F1F]'}`}>
      {status.message}
    </p>
  );
}
