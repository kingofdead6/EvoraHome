import { useId } from 'react';

/**
 * Form fields.
 *
 * Label above the input, always. Error below. Never a placeholder standing in
 * for a label: the label disappears exactly when the customer needs it, and on
 * a checkout form that costs orders.
 *
 * Inputs are 48px tall and use 16px text, which is what stops iOS Safari
 * zooming the page when a field takes focus.
 */

const CONTROL =
  'w-full min-h-[48px] rounded-sm border bg-cream px-3 py-2 text-base text-ink ' +
  'placeholder:text-ink-muted/70 transition-colors duration-200 ' +
  'focus:border-gold focus:outline-none focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-1';

function Wrapper({ id, label, error, hint, required, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm uppercase tracking-[0.12em] text-ink-muted">
        {label}
        {required ? <span className="text-gold-deep"> *</span> : null}
      </label>

      {children}

      {hint && !error ? <p className="text-sm text-ink-muted">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-[#8C2F1F]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Field({ label, error, hint, required, className = '', ...rest }) {
  const generated = useId();
  const id = rest.id || generated;

  return (
    <Wrapper id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        aria-invalid={error ? 'true' : undefined}
        className={`${CONTROL} ${error ? 'border-[#8C2F1F]' : 'border-greige'} ${className}`}
        {...rest}
      />
    </Wrapper>
  );
}

export function TextArea({ label, error, hint, required, rows = 4, className = '', ...rest }) {
  const generated = useId();
  const id = rest.id || generated;

  return (
    <Wrapper id={id} label={label} error={error} hint={hint} required={required}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        className={`${CONTROL} resize-y ${error ? 'border-[#8C2F1F]' : 'border-greige'} ${className}`}
        {...rest}
      />
    </Wrapper>
  );
}

export function Select({ label, error, hint, required, children, className = '', ...rest }) {
  const generated = useId();
  const id = rest.id || generated;

  return (
    <Wrapper id={id} label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        aria-invalid={error ? 'true' : undefined}
        className={`${CONTROL} appearance-none bg-[length:14px] bg-[right_0.9rem_center] bg-no-repeat pe-10 ${
          error ? 'border-[#8C2F1F]' : 'border-greige'
        } ${className}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%236B7065' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
        }}
        {...rest}
      >
        {children}
      </select>
    </Wrapper>
  );
}

/** Radio group used for the delivery mode choice at checkout. */
export function RadioCards({ label, name, value, onChange, options, error }) {
  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="mb-2 text-sm uppercase tracking-[0.12em] text-ink-muted">{label}</legend>

      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex min-h-[64px] cursor-pointer items-start gap-3 rounded-sm border p-4 transition-colors duration-200 ${
                selected ? 'border-gold bg-greige/25' : 'border-greige hover:border-sand'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#3E4638]"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-base text-ink">{option.label}</span>
                {option.hint ? <span className="text-sm text-ink-muted">{option.hint}</span> : null}
              </span>
            </label>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[#8C2F1F]">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export default Field;
