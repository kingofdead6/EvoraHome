import { Check, X, Truck, Package, ClipboardCheck, FileText } from 'lucide-react';

import { formatDateTime } from '../../lib/format';
import { useI18n } from '../../lib/i18n';

/**
 * The progress line for one order.
 *
 * Five steps in a fixed sequence, with the current one marked. A cancelled
 * order leaves the sequence rather than continuing along it, so it is drawn as
 * a separate terminal state showing how far it got before being stopped —
 * flattening ANNULEE into the same line would either imply it was delivered or
 * lose the information about where it stopped.
 *
 * Two orientations: a horizontal rail for wide containers (the admin drawer,
 * the customer's order page on desktop) and a vertical list below `sm`, where
 * five French labels across a 360px screen would be unreadable. The vertical
 * form also carries the timestamp of each completed step, which is the thing
 * the client actually gets asked on the phone.
 */

export const STEPS = [
  { statut: 'NOUVELLE', icon: FileText },
  { statut: 'CONFIRMEE', icon: ClipboardCheck },
  { statut: 'EN_PREPARATION', icon: Package },
  { statut: 'EXPEDIEE', icon: Truck },
  { statut: 'LIVREE', icon: Check },
];

const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.statut, i]));

/** When each status was reached, from the order's history. */
function datesByStatut(historique) {
  const map = {};
  for (const entry of historique || []) {
    // First occurrence wins: a status re-entered after a correction should show
    // when it was originally reached.
    if (!map[entry.statut]) map[entry.statut] = entry.date;
  }
  return map;
}

/**
 * How far a cancelled order got.
 *
 * The history holds the states it passed through, so the last non-cancelled
 * entry is where it stopped. Falls back to "Reçue", since every order is at
 * least that.
 */
function reachedBeforeCancel(historique) {
  const passed = (historique || [])
    .filter((h) => h.statut !== 'ANNULEE')
    .map((h) => STEP_INDEX[h.statut])
    .filter((i) => i !== undefined);
  return passed.length ? Math.max(...passed) : 0;
}

export default function OrderTracker({ statut, historique = [], className = '' }) {
  const { t } = useI18n();
  const cancelled = statut === 'ANNULEE';
  const dates = datesByStatut(historique);
  const currentIndex = cancelled ? reachedBeforeCancel(historique) : STEP_INDEX[statut] ?? 0;
  const cancelDate = (historique || []).find((h) => h.statut === 'ANNULEE')?.date;

  return (
    <div className={className}>
      {/*
        ── Horizontal rail, sm and up ────────────────────────────────────
        `flex` follows the document direction, so under RTL the steps lay
        themselves out right-to-left and the progress reads from the right
        without any extra work. That is correct: an Arabic reader expects the
        first step where their eye starts.
      */}
      <ol className="hidden sm:flex sm:items-start">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const current = i === currentIndex && !cancelled;
          const reached = done || current;
          const Icon = step.icon;

          return (
            <li key={step.statut} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {/* Left half-connector. Hidden on the first step so the rail
                    starts at the marker rather than off the edge. */}
                <span
                  aria-hidden="true"
                  className={`h-px flex-1 ${i === 0 ? 'invisible' : ''} ${
                    i <= currentIndex && !cancelled ? 'bg-gold' : 'bg-greige'
                  }`}
                />

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    current
                      ? 'border-gold bg-gold text-cream'
                      : done
                        ? 'border-gold bg-cream text-gold-deep'
                        : 'border-greige bg-cream text-ink-muted/60'
                  } ${cancelled && reached ? 'border-greige text-ink-muted/60' : ''}`}
                >
                  <Icon size={14} strokeWidth={1.8} />
                </span>

                <span
                  aria-hidden="true"
                  className={`h-px flex-1 ${i === STEPS.length - 1 ? 'invisible' : ''} ${
                    i < currentIndex && !cancelled ? 'bg-gold' : 'bg-greige'
                  }`}
                />
              </div>

              <span
                className={`mt-2 px-1 text-center text-[11px] leading-tight ${
                  current && !cancelled ? 'text-ink' : 'text-ink-muted'
                }`}
              >
                {t(`order.steps.${step.statut}`)}
              </span>

              {dates[step.statut] ? (
                <span className="mt-0.5 px-1 text-center text-[10px] tabular-nums text-ink-muted/80">
                  {formatDateTime(dates[step.statut])}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* ── Vertical list, below sm ─────────────────────────────────────── */}
      <ol className="flex flex-col sm:hidden">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const current = i === currentIndex && !cancelled;
          const Icon = step.icon;
          const last = i === STEPS.length - 1;

          return (
            <li key={step.statut} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                    current
                      ? 'border-gold bg-gold text-cream'
                      : done
                        ? 'border-gold bg-cream text-gold-deep'
                        : 'border-greige bg-cream text-ink-muted/60'
                  } ${cancelled && (done || current) ? 'border-greige text-ink-muted/60' : ''}`}
                >
                  <Icon size={13} strokeWidth={1.8} />
                </span>

                {!last ? (
                  <span
                    aria-hidden="true"
                    className={`w-px flex-1 ${
                      i < currentIndex && !cancelled ? 'bg-gold' : 'bg-greige'
                    }`}
                  />
                ) : null}
              </div>

              <div className={`min-w-0 ${last ? 'pb-0' : 'pb-4'}`}>
                <p className={`text-sm leading-tight ${current ? 'text-ink' : 'text-ink-muted'}`}>
                  {t(`order.steps.${step.statut}`)}
                </p>
                {dates[step.statut] ? (
                  <p className="mt-0.5 text-[11px] tabular-nums text-ink-muted/80">
                    {formatDateTime(dates[step.statut])}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {cancelled ? (
        <p className="mt-3 flex items-start gap-2 rounded-sm border border-[#8C2F1F]/35 bg-[#8C2F1F]/5 px-3 py-2 text-sm text-[#8C2F1F]">
          <X size={15} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>
            {cancelDate
              ? t('order.cancelledAt', {
                  date: formatDateTime(cancelDate),
                  step: t(`order.steps.${STEPS[currentIndex].statut}`),
                })
              : t('order.cancelled', {
                  step: t(`order.steps.${STEPS[currentIndex].statut}`),
                })}
          </span>
        </p>
      ) : null}
    </div>
  );
}
