import { useCallback, useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Plus, X } from 'lucide-react';

import api from '../../lib/api';
import { PageHeader, Panel, AdminInput, AdminTextArea, StatusLine } from './AdminUI';
import Button from '../../Components/UI/Button';
import Badge from '../../Components/UI/Badge';
import ProductImage from '../../Components/UI/ProductImage';
import { Loading, ErrorState } from '../../Components/UI/States';

/**
 * Categories. CRUD plus ordering.
 *
 * Order is changed with explicit up/down buttons rather than drag and drop.
 * Drag reordering on a touch screen fights the page scroll, and this list is
 * seven items long and reordered about twice a year.
 */

const EMPTY = { nom: '', description: '', image: '', ordre: 0, isActive: true };

function CategoryEditor({ category, onClose, onSaved }) {
  const [form, setForm] = useState(category ? { ...EMPTY, ...category } : EMPTY);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (!form.nom.trim()) {
      setStatus({ ok: false, message: 'Le nom est requis' });
      return;
    }

    setSaving(true);

    const body = new FormData();
    body.append('nom', form.nom);
    body.append('description', form.description || '');
    body.append('image', form.image || '');
    body.append('isActive', String(form.isActive));
    if (form.ordre !== undefined) body.append('ordre', String(form.ordre));
    if (file) body.append('image', file);

    try {
      const saved = category
        ? await api.admin.updateCategory(category._id, body)
        : await api.admin.createCategory(body);
      onSaved(saved);
    } catch (err) {
      setStatus({ ok: false, message: err.message });
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-forest/50">
      <form
        onSubmit={handleSubmit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label={category ? `Modifier ${category.nom}` : 'Nouvelle catégorie'}
        className="flex w-full max-w-md flex-col overflow-y-auto bg-cream"
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-greige bg-cream px-4 py-4">
          <h2 className="font-display text-base tracking-[0.12em] text-ink">
            {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-mr-2 flex h-11 w-11 items-center justify-center text-ink-muted hover:text-ink"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex flex-col gap-5 px-4 py-5">
          <AdminInput label="Nom" value={form.nom} onChange={set('nom')} required />
          <AdminTextArea label="Description" rows={3} value={form.description} onChange={set('description')} />

          {form.image ? (
            <div className="rounded-sm border border-greige bg-cream p-3">
              <p className="mb-2 text-sm uppercase tracking-[0.12em] text-ink-muted">Photo actuelle</p>
              <ProductImage src={form.image} alt={form.nom || 'Image de catégorie'} sizes="180px" className="h-[180px] w-full rounded-sm object-cover" />
            </div>
          ) : null}

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] uppercase tracking-[0.12em] text-ink-muted">
              Téléverser une image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="min-h-[44px] rounded-sm border border-greige bg-cream px-3 py-2 text-sm text-ink file:mr-3 file:rounded-sm file:border file:border-greige file:bg-cream file:px-3 file:py-1.5 file:text-sm file:text-ink"
            />
            <span className="text-sm text-ink-muted">Laisser vide pour conserver la photo actuelle.</span>
          </label>

          <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="h-4 w-4 accent-[#3E4638]"
            />
            <span className="text-base text-ink">Visible sur la boutique</span>
          </label>

          <StatusLine status={status} />
        </div>

        <footer className="sticky bottom-0 flex gap-2 border-t border-greige bg-cream px-4 py-4">
          <Button type="submit" variant="primary" size="md" disabled={saving} className="flex-1">
            {saving ? 'Enregistrement' : 'Enregistrer'}
          </Button>
          <Button onClick={onClose} variant="secondary" size="md">
            Annuler
          </Button>
        </footer>
      </form>
    </div>
  );
}

export default function AdminCategories() {
  const [state, setState] = useState({ loading: true, error: null, categories: [] });
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState(null);

  const load = useCallback(() => {
    const controller = new AbortController();
    api
      .admin.categories(controller.signal)
      .then((categories) => setState({ loading: false, error: null, categories }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ loading: false, error: err.message, categories: [] });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => load(), [load]);

  async function move(index, direction) {
    const next = [...state.categories];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];
    // Optimistic: the list is tiny and a round trip per arrow tap would make
    // reordering feel broken.
    setState((s) => ({ ...s, categories: next }));

    try {
      await api.admin.reorderCategories(next.map((c, i) => ({ id: c._id, ordre: i + 1 })));
      setStatus({ ok: true, message: 'Ordre enregistré' });
    } catch (err) {
      setStatus({ ok: false, message: err.message });
      load();
    }
  }

  async function remove(category) {
    setStatus(null);
    try {
      await api.admin.deleteCategory(category._id);
      load();
    } catch (err) {
      // The server refuses to delete a category that still has products, and
      // says how many. Surface that verbatim.
      setStatus({ ok: false, message: err.message });
    }
  }

  if (state.loading) return <Loading />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  return (
    <>
      <PageHeader title="Catégories" description="L'ordre ci-dessous est celui de la boutique.">
        <Button onClick={() => setEditing('new')} variant="primary" size="sm">
          <Plus size={15} strokeWidth={1.5} />
          Nouvelle catégorie
        </Button>
      </PageHeader>

      <StatusLine status={status} />

      <Panel className="mt-3">
        <ul className="flex flex-col divide-y divide-greige">
          {state.categories.map((category, i) => (
            <li key={category._id} className="flex items-center gap-3 py-3">
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Monter ${category.nom}`}
                  className="flex h-8 w-8 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-30"
                >
                  <ArrowUp size={15} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === state.categories.length - 1}
                  aria-label={`Descendre ${category.nom}`}
                  className="flex h-8 w-8 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-30"
                >
                  <ArrowDown size={15} strokeWidth={1.5} />
                </button>
              </div>

              <div className="w-12 shrink-0">
                <ProductImage src={category.image} alt="" sizes="48px" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-base text-ink">{category.nom}</span>
                  {!category.isActive ? <Badge tone="muted">Masquée</Badge> : null}
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-ink-muted">
                  /{category.slug}
                </span>
              </div>

              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(category)}
                  className="min-h-[36px] text-sm underline decoration-gold underline-offset-4"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => remove(category)}
                  className="min-h-[36px] text-sm text-[#8C2F1F] underline decoration-[#8C2F1F]/50 underline-offset-4"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {editing ? (
        <CategoryEditor
          category={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      ) : null}
    </>
  );
}
