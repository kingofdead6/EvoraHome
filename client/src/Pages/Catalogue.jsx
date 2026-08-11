import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

import api from '../lib/api';
import { formatPrice } from '../lib/format';
import ProductGrid from '../Components/Products/ProductGrid';
import Button from '../Components/UI/Button';
import { Select } from '../Components/UI/Field';
import { EmptyState, ErrorState, ProductGridSkeleton } from '../Components/UI/States';
import { DISPONIBILITE_LABEL } from '../Components/UI/Badge';
import { EASE_OUT, useReducedMotion } from '../lib/motion';

/**
 * Category listing.
 *
 * Filters live in the URL, not in component state. A customer who filters to
 * "Salons under 200 000 DA" and sends that link to their partner should send
 * the results, not the empty page. It also makes the browser back button behave
 * the way people expect after they open a product and return.
 *
 * On a phone the filters are a sheet rather than a sidebar: a sidebar at 360px
 * either eats the grid or collapses into an accordion nobody opens.
 */

const SORTS = [
  { value: 'recent', label: 'Les plus récents' },
  { value: 'prix-asc', label: 'Prix croissant' },
  { value: 'prix-desc', label: 'Prix décroissant' },
  { value: 'nom', label: 'Nom (A-Z)' },
];

const DISPONIBILITES = ['EN_STOCK', 'SUR_COMMANDE', 'RUPTURE'];

/** Toggles one value inside a comma-separated URL parameter. */
function toggleInList(current, value) {
  const list = current ? current.split(',') : [];
  const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  return next.join(',');
}

function FilterPanel({ options, params, setParam, onReset, activeCount }) {
  const selectedDispo = params.get('disponibilite') || '';
  const selectedCouleurs = params.get('couleur') || '';

  return (
    <div className="flex flex-col gap-8">
      {/* Price */}
      <fieldset className="border-0 p-0">
        <legend className="mb-3 text-[11px] uppercase tracking-[0.18em] text-ink-muted">Prix</legend>

        <div className="flex items-center gap-3">
          <label className="flex-1">
            <span className="sr-only">Prix minimum</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={options.prixMin ? String(options.prixMin) : '0'}
              value={params.get('prixMin') || ''}
              onChange={(e) => setParam('prixMin', e.target.value)}
              className="min-h-[48px] w-full rounded-sm border border-greige bg-cream px-3 text-base tabular-nums text-ink placeholder:text-ink-muted/60 focus:border-gold focus:outline-none"
            />
          </label>

          <span aria-hidden="true" className="text-ink-muted">
            -
          </span>

          <label className="flex-1">
            <span className="sr-only">Prix maximum</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={options.prixMax ? String(options.prixMax) : ''}
              value={params.get('prixMax') || ''}
              onChange={(e) => setParam('prixMax', e.target.value)}
              className="min-h-[48px] w-full rounded-sm border border-greige bg-cream px-3 text-base tabular-nums text-ink placeholder:text-ink-muted/60 focus:border-gold focus:outline-none"
            />
          </label>
        </div>

        {options.prixMin || options.prixMax ? (
          <p className="mt-2 text-[13px] text-ink-muted">
            De {formatPrice(options.prixMin)} à {formatPrice(options.prixMax)}
          </p>
        ) : null}
      </fieldset>

      {/* Availability */}
      <fieldset className="border-0 p-0">
        <legend className="mb-3 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          Disponibilité
        </legend>

        <div className="flex flex-col gap-1">
          {DISPONIBILITES.map((value) => {
            const count = options.disponibilites?.find((d) => d.valeur === value)?.count ?? 0;
            const checked = selectedDispo.split(',').includes(value);

            return (
              <label
                key={value}
                className={`flex min-h-[44px] cursor-pointer items-center gap-3 ${
                  count === 0 ? 'opacity-45' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={count === 0}
                  onChange={() => setParam('disponibilite', toggleInList(selectedDispo, value))}
                  className="h-4 w-4 accent-[#3E4638]"
                />
                <span className="flex-1 text-base text-ink">{DISPONIBILITE_LABEL[value]}</span>
                <span className="text-[13px] tabular-nums text-ink-muted">{count}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Colours */}
      {options.couleurs?.length ? (
        <fieldset className="border-0 p-0">
          <legend className="mb-3 text-[11px] uppercase tracking-[0.18em] text-ink-muted">Couleur</legend>

          <div className="flex flex-col gap-1">
            {options.couleurs.map((couleur) => {
              const checked = selectedCouleurs.split(',').includes(couleur.nom);
              return (
                <label key={couleur.nom} className="flex min-h-[44px] cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setParam('couleur', toggleInList(selectedCouleurs, couleur.nom))}
                    className="h-4 w-4 accent-[#3E4638]"
                  />
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 rounded-xs border border-greige"
                    style={{ backgroundColor: couleur.hex }}
                  />
                  <span className="flex-1 text-base text-ink">{couleur.nom}</span>
                  <span className="text-[13px] tabular-nums text-ink-muted">{couleur.count}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {activeCount > 0 ? (
        <Button onClick={onReset} variant="ghost" size="sm" className="self-start px-0">
          Réinitialiser les filtres
        </Button>
      ) : null}
    </div>
  );
}

export default function Catalogue() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const reduced = useReducedMotion();

  const [categories, setCategories] = useState([]);
  const [options, setOptions] = useState({ couleurs: [], disponibilites: [] });
  const [data, setData] = useState({ products: [], total: 0, page: 1, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const category = useMemo(() => categories.find((c) => c.slug === slug), [categories, slug]);

  const query = useMemo(() => {
    const q = Object.fromEntries(params.entries());
    return { ...q, category: slug, limit: 24 };
  }, [params, slug]);

  const activeCount = useMemo(
    () => ['prixMin', 'prixMax', 'disponibilite', 'couleur'].filter((k) => params.get(k)).length,
    [params]
  );

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(params);
      if (value) next.set(key, value);
      else next.delete(key);
      // Any filter change returns to page one. Staying on page 3 of a result
      // set that now has one page shows an empty grid and reads as broken.
      next.delete('page');
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const reset = useCallback(() => {
    const next = new URLSearchParams();
    const sort = params.get('sort');
    if (sort) next.set('sort', sort);
    setParams(next, { replace: true });
  }, [params, setParams]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .categories(controller.signal)
      .then(setCategories)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    api
      .filterOptions({ category: slug }, controller.signal)
      .then(setOptions)
      .catch(() => {});
    return () => controller.abort();
  }, [slug]);

  const load = useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    api
      .products(query, controller.signal)
      .then(setData)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query]);

  useEffect(() => load(), [load]);

  const title = category?.nom || 'Tout le catalogue';

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-10">
      {/* Header */}
      <header>
        <h1 className="font-display text-xl tracking-[0.12em] text-ink sm:text-2xl">{title}</h1>
        {category?.description ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted">{category.description}</p>
        ) : null}
      </header>

      {/* Category tabs. Horizontal scroll on a phone, which beats a select for
          something the customer switches between constantly. */}
      <nav aria-label="Catégories" className="-mx-4 mt-7 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2 pb-1">
          <li>
            <Link
              to="/catalogue"
              className={`flex min-h-[44px] items-center rounded-sm border px-4 text-[13px] uppercase tracking-[0.1em] transition-colors duration-200 ${
                !slug ? 'border-gold bg-olive text-cream' : 'border-greige text-ink hover:border-sand'
              }`}
            >
              Tout
            </Link>
          </li>

          {categories.map((c) => (
            <li key={c._id}>
              <Link
                to={`/catalogue/${c.slug}`}
                className={`flex min-h-[44px] items-center rounded-sm border px-4 text-[13px] uppercase tracking-[0.1em] whitespace-nowrap transition-colors duration-200 ${
                  slug === c.slug ? 'border-gold bg-olive text-cream' : 'border-greige text-ink hover:border-sand'
                }`}
              >
                {c.nom}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Toolbar */}
      <div className="mt-8 flex items-center justify-between gap-3 border-y border-greige py-3">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex min-h-[44px] items-center gap-2 text-[13px] uppercase tracking-[0.1em] text-ink lg:hidden"
        >
          <SlidersHorizontal size={16} strokeWidth={1.5} />
          Filtrer
          {activeCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-olive px-1 text-[11px] text-cream">
              {activeCount}
            </span>
          ) : null}
        </button>

        <p className="hidden text-[13px] tabular-nums text-ink-muted lg:block" aria-live="polite">
          {loading ? 'Chargement' : `${data.total} pièce${data.total > 1 ? 's' : ''}`}
        </p>

        <label className="flex items-center gap-2">
          <span className="sr-only">Trier par</span>
          <select
            value={params.get('sort') || 'recent'}
            onChange={(e) => setParam('sort', e.target.value === 'recent' ? '' : e.target.value)}
            className="min-h-[44px] rounded-sm border border-greige bg-cream px-3 text-[13px] text-ink focus:border-gold focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 flex gap-10">
        {/* Desktop filters */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <FilterPanel
            options={options}
            params={params}
            setParam={setParam}
            onReset={reset}
            activeCount={activeCount}
          />
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <p className="mb-4 text-[13px] tabular-nums text-ink-muted lg:hidden" aria-live="polite">
            {loading ? 'Chargement' : `${data.total} pièce${data.total > 1 ? 's' : ''}`}
          </p>

          {error ? (
            <ErrorState message={error} onRetry={load} />
          ) : loading ? (
            <ProductGridSkeleton count={8} />
          ) : data.products.length === 0 ? (
            <EmptyState
              title={activeCount > 0 ? 'Aucune pièce ne correspond' : 'Cette collection arrive'}
              message={
                activeCount > 0
                  ? 'Essayez d\'élargir votre recherche, ou appelez-nous : nous avons peut-être la pièce en showroom.'
                  : 'Nous ajoutons les pièces de cette collection. Appelez-nous en attendant.'
              }
              actionLabel={activeCount > 0 ? 'Réinitialiser les filtres' : 'Voir tout le catalogue'}
              actionTo={activeCount > 0 ? undefined : '/catalogue'}
              onAction={activeCount > 0 ? reset : undefined}
            />
          ) : (
            <>
              <ProductGrid products={data.products} />

              {data.pages > 1 ? (
                <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
                  <Button
                    onClick={() => setParams(new URLSearchParams({ ...Object.fromEntries(params), page: data.page - 1 }))}
                    disabled={data.page <= 1}
                    variant="secondary"
                    size="sm"
                  >
                    Précédent
                  </Button>

                  <span className="px-3 text-[13px] tabular-nums text-ink-muted">
                    {data.page} / {data.pages}
                  </span>

                  <Button
                    onClick={() => setParams(new URLSearchParams({ ...Object.fromEntries(params), page: data.page + 1 }))}
                    disabled={data.page >= data.pages}
                    variant="secondary"
                    size="sm"
                  >
                    Suivant
                  </Button>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheetOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Fermer les filtres"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-50 cursor-default bg-forest/50 lg:hidden"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filtres"
              initial={reduced ? { opacity: 0 } : { transform: 'translateY(100%)' }}
              animate={reduced ? { opacity: 1 } : { transform: 'translateY(0%)' }}
              exit={reduced ? { opacity: 0 } : { transform: 'translateY(100%)' }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-md bg-cream lg:hidden"
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-greige bg-cream px-4 py-4">
                <h2 className="font-display text-base tracking-[0.12em] text-ink">Filtrer</h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Fermer les filtres"
                  className="-mr-2 flex h-11 w-11 items-center justify-center text-ink-muted"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <div className="px-4 py-6">
                <FilterPanel
                  options={options}
                  params={params}
                  setParam={setParam}
                  onReset={reset}
                  activeCount={activeCount}
                />
              </div>

              <div className="sticky bottom-0 border-t border-greige bg-cream px-4 py-4">
                <Button onClick={() => setSheetOpen(false)} variant="primary" size="lg" full>
                  Voir {data.total} pièce{data.total > 1 ? 's' : ''}
                </Button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
