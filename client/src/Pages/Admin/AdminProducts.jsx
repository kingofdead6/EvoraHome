import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

import api from '../../lib/api';
import { formatPriceShort } from '../../lib/format';

import {
  PageHeader,
  Panel,
  TableWrap,
  Th,
  Td,
  AdminInput,
  AdminTextArea,
  AdminSelect,
  StatusLine,
} from './AdminUI';
import Button from '../../Components/UI/Button';
import Badge, { DISPONIBILITE_LABEL } from '../../Components/UI/Badge';
import ProductImage from '../../Components/UI/ProductImage';
import { Loading, ErrorState, EmptyState } from '../../Components/UI/States';

/**
 * Products. Full CRUD with multi-image upload and reordering.
 *
 * The editor is a full-height panel rather than a modal, because a furniture
 * product carries a lot of fields (reference, three dimensions, materials,
 * colours, images) and a modal at 360px turns that into a scroll trap.
 */

const EMPTY = {
  ref: '',
  nom: '',
  description: '',
  categoryId: '',
  prix: '',
  ancienPrix: '',
  dimensions: { largeur: '', profondeur: '', hauteur: '', unite: 'cm' },
  materiaux: [],
  couleurs: [],
  images: [],
  disponibilite: 'EN_STOCK',
  delaiLivraison: '',
  isFeatured: false,
  isNouveau: false,
};

const MATERIAUX_SUGGESTIONS = [
  'Tissu',
  'Tissu bouclé',
  'Velours',
  'Bois massif',
  'MDF',
  'Placage bois',
  'Métal',
  'Aluminium',
  'Verre trempé',
  'Marbre',
  'Résine tressée',
  'Rotin',
  'Céramique',
  'Mousse haute densité',
];

function ProductEditor({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    product
      ? {
          ...EMPTY,
          ...product,
          categoryId: product.categoryId?._id || product.categoryId || '',
          ancienPrix: product.ancienPrix ?? '',
          dimensions: { ...EMPTY.dimensions, ...(product.dimensions || {}) },
          materiaux: product.materiaux || [],
          couleurs: product.couleurs || [],
          images: [...(product.images || [])].sort((a, b) => a.ordre - b.ordre),
        }
      : EMPTY
  );

  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const setDim = (key) => (e) =>
    setForm((p) => ({ ...p, dimensions: { ...p.dimensions, [key]: e.target.value } }));

  const toggleMateriau = (m) =>
    setForm((p) => ({
      ...p,
      materiaux: p.materiaux.includes(m) ? p.materiaux.filter((x) => x !== m) : [...p.materiaux, m],
    }));

  const addCouleur = () =>
    setForm((p) => ({ ...p, couleurs: [...p.couleurs, { nom: '', hex: '#D8CDB8' }] }));

  const setCouleur = (i, key, value) =>
    setForm((p) => ({
      ...p,
      couleurs: p.couleurs.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)),
    }));

  const removeCouleur = (i) =>
    setForm((p) => ({ ...p, couleurs: p.couleurs.filter((_, idx) => idx !== i) }));

  /** Reordering rewrites the array; `ordre` is re-derived on save. */
  const moveImage = (index, direction) => {
    setForm((p) => {
      const next = [...p.images];
      const target = index + direction;
      if (target < 0 || target >= next.length) return p;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...p, images: next };
    });
  };

  const removeImage = (index) =>
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));

  const addImagePath = () => {
    const url = form.newImagePath?.trim();
    if (!url) return;
    setForm((p) => ({
      ...p,
      images: [...p.images, { url, alt: '', ordre: p.images.length }],
      newImagePath: '',
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (!form.ref.trim() || !form.nom.trim() || !form.categoryId || form.prix === '') {
      setStatus({ ok: false, message: 'Référence, nom, catégorie et prix sont requis' });
      return;
    }

    setSaving(true);

    // Multipart, because the same request carries both fields and new files.
    const body = new FormData();
    body.append('ref', form.ref);
    body.append('nom', form.nom);
    body.append('description', form.description || '');
    body.append('categoryId', form.categoryId);
    body.append('prix', String(form.prix));
    body.append('ancienPrix', form.ancienPrix === '' ? '' : String(form.ancienPrix));
    body.append('disponibilite', form.disponibilite);
    body.append('delaiLivraison', form.delaiLivraison || '');
    body.append('isFeatured', String(form.isFeatured));
    body.append('isNouveau', String(form.isNouveau));
    body.append('dimensions', JSON.stringify(form.dimensions));
    body.append('materiaux', JSON.stringify(form.materiaux));
    body.append('couleurs', JSON.stringify(form.couleurs.filter((c) => c.nom.trim())));
    body.append('images', JSON.stringify(form.images.map((img, i) => ({ ...img, ordre: i }))));

    for (const file of files) body.append('images', file);

    try {
      const saved = product
        ? await api.admin.updateProduct(product._id, body)
        : await api.admin.createProduct(body);
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
        aria-label={product ? `Modifier ${product.nom}` : 'Nouveau produit'}
        className="flex w-full max-w-2xl flex-col overflow-y-auto bg-cream"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-greige bg-cream px-4 py-4">
          <h2 className="font-display text-base tracking-[0.12em] text-ink">
            {product ? 'Modifier le produit' : 'Nouveau produit'}
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

        <div className="flex flex-col gap-6 px-4 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Référence"
              value={form.ref}
              onChange={set('ref')}
              placeholder="LA CONNER"
              required
            />
            <AdminSelect label="Catégorie" value={form.categoryId} onChange={set('categoryId')} required>
              <option value="">Choisir</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nom}
                </option>
              ))}
            </AdminSelect>
          </div>

          <AdminInput label="Nom" value={form.nom} onChange={set('nom')} required />

          <AdminTextArea label="Description" rows={4} value={form.description} onChange={set('description')} />

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Prix (DA)"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.prix}
              onChange={set('prix')}
              required
            />
            <AdminInput
              label="Ancien prix (promo, facultatif)"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.ancienPrix}
              onChange={set('ancienPrix')}
            />
          </div>

          {/* Dimensions */}
          <fieldset className="border-0 p-0">
            <legend className="mb-2 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              Dimensions (cm)
            </legend>
            <div className="grid grid-cols-3 gap-3">
              <AdminInput
                label="Largeur"
                type="number"
                inputMode="numeric"
                min={0}
                value={form.dimensions.largeur ?? ''}
                onChange={setDim('largeur')}
              />
              <AdminInput
                label="Profondeur"
                type="number"
                inputMode="numeric"
                min={0}
                value={form.dimensions.profondeur ?? ''}
                onChange={setDim('profondeur')}
              />
              <AdminInput
                label="Hauteur"
                type="number"
                inputMode="numeric"
                min={0}
                value={form.dimensions.hauteur ?? ''}
                onChange={setDim('hauteur')}
              />
            </div>
          </fieldset>

          {/* Materials */}
          <fieldset className="border-0 p-0">
            <legend className="mb-2 text-[11px] uppercase tracking-[0.12em] text-ink-muted">Matériaux</legend>
            <div className="flex flex-wrap gap-1.5">
              {MATERIAUX_SUGGESTIONS.map((m) => {
                const selected = form.materiaux.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMateriau(m)}
                    aria-pressed={selected}
                    className={`min-h-[36px] rounded-sm border px-2.5 text-[12px] transition-colors ${
                      selected ? 'border-gold bg-greige/40 text-ink' : 'border-greige text-ink-muted hover:border-sand'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Colours */}
          <fieldset className="border-0 p-0">
            <legend className="mb-2 text-[11px] uppercase tracking-[0.12em] text-ink-muted">Coloris</legend>

            <div className="flex flex-col gap-2">
              {form.couleurs.map((couleur, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={couleur.hex}
                    onChange={(e) => setCouleur(i, 'hex', e.target.value)}
                    aria-label="Couleur"
                    className="h-11 w-12 shrink-0 cursor-pointer rounded-sm border border-greige bg-cream p-1"
                  />
                  <input
                    type="text"
                    value={couleur.nom}
                    onChange={(e) => setCouleur(i, 'nom', e.target.value)}
                    placeholder="Nom du coloris"
                    aria-label="Nom du coloris"
                    className="min-h-[44px] flex-1 rounded-sm border border-greige bg-cream px-3 text-base text-ink focus:border-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeCouleur(i)}
                    aria-label="Retirer ce coloris"
                    className="flex h-11 w-11 shrink-0 items-center justify-center text-ink-muted hover:text-[#8C2F1F]"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>

            <Button onClick={addCouleur} variant="secondary" size="sm" className="mt-2">
              <Plus size={15} strokeWidth={1.5} />
              Ajouter un coloris
            </Button>
          </fieldset>

          {/* Images */}
          <fieldset className="border-0 p-0">
            <legend className="mb-2 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              Photos (la première est la photo principale)
            </legend>

            {form.images.length ? (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {form.images.map((image, i) => (
                  <li key={image.url} className="flex flex-col gap-1">
                    <ProductImage src={image.url} alt="" sizes="120px" />
                    <div className="flex items-center justify-between">
                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => moveImage(i, -1)}
                          disabled={i === 0}
                          aria-label="Déplacer avant"
                          className="flex h-9 w-9 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-30"
                        >
                          <ArrowUp size={14} strokeWidth={1.5} className="-rotate-90" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(i, 1)}
                          disabled={i === form.images.length - 1}
                          aria-label="Déplacer après"
                          className="flex h-9 w-9 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-30"
                        >
                          <ArrowDown size={14} strokeWidth={1.5} className="-rotate-90" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        aria-label="Retirer la photo"
                        className="flex h-9 w-9 items-center justify-center text-ink-muted hover:text-[#8C2F1F]"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-ink-muted">Aucune photo.</p>
            )}

            <div className="mt-3 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                  Téléverser des photos
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles([...e.target.files])}
                  className="min-h-[44px] rounded-sm border border-greige bg-cream px-3 py-2 text-[13px] text-ink file:mr-3 file:rounded-sm file:border file:border-greige file:bg-cream file:px-3 file:py-1.5 file:text-[13px] file:text-ink"
                />
              </label>

              <div className="flex items-end gap-2">
                <AdminInput
                  label="Ou chemin d'une photo déjà déposée"
                  value={form.newImagePath || ''}
                  onChange={(e) => setForm((p) => ({ ...p, newImagePath: e.target.value }))}
                  placeholder="/products/mon-produit-01.jpg"
                  className="flex-1"
                />
                <Button onClick={addImagePath} variant="secondary" size="sm">
                  Ajouter
                </Button>
              </div>
            </div>
          </fieldset>

          {/* Availability */}
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminSelect label="Disponibilité" value={form.disponibilite} onChange={set('disponibilite')}>
              {Object.entries(DISPONIBILITE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </AdminSelect>

            <AdminInput
              label="Délai de livraison"
              value={form.delaiLivraison}
              onChange={set('delaiLivraison')}
              placeholder="5 à 8 jours"
            />
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                className="h-4 w-4 accent-[#3E4638]"
              />
              <span className="text-base text-ink">En vedette sur l&apos;accueil</span>
            </label>

            <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={form.isNouveau}
                onChange={(e) => setForm((p) => ({ ...p, isNouveau: e.target.checked }))}
                className="h-4 w-4 accent-[#3E4638]"
              />
              <span className="text-base text-ink">Marquer comme nouveauté</span>
            </label>
          </div>

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

export default function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [confirmDelete, setConfirmDelete] = useState(null);

  const q = params.get('q') || '';
  const disponibilite = params.get('disponibilite') || '';
  const category = params.get('category') || '';

  const load = useCallback(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true }));

    api
      .admin.products({ q, disponibilite, category, limit: 60 }, controller.signal)
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ loading: false, error: err.message, data: null });
      });

    return () => controller.abort();
  }, [q, disponibilite, category]);

  useEffect(() => load(), [load]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .admin.categories(controller.signal)
      .then(setCategories)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  async function handleDelete(product) {
    try {
      await api.admin.deleteProduct(product._id);
      setConfirmDelete(null);
      load();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    }
  }

  if (state.loading && !state.data) return <Loading />;
  if (state.error && !state.data) return <ErrorState message={state.error} onRetry={load} />;

  const products = state.data?.products || [];

  return (
    <>
      <PageHeader title="Produits" description={`${state.data?.total ?? 0} produits`}>
        <Button onClick={() => setEditing('new')} variant="primary" size="sm">
          <Plus size={15} strokeWidth={1.5} />
          Nouveau produit
        </Button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setParam('q', e.target.value)}
          placeholder="Nom ou référence"
          aria-label="Rechercher un produit"
          className="min-h-[44px] w-full max-w-xs rounded-sm border border-greige bg-cream px-3 text-base text-ink focus:border-gold focus:outline-none"
        />

        <select
          value={category}
          onChange={(e) => setParam('category', e.target.value)}
          aria-label="Filtrer par catégorie"
          className="min-h-[44px] rounded-sm border border-greige bg-cream px-3 text-base text-ink focus:border-gold focus:outline-none"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.nom}
            </option>
          ))}
        </select>

        <select
          value={disponibilite}
          onChange={(e) => setParam('disponibilite', e.target.value)}
          aria-label="Filtrer par disponibilité"
          className="min-h-[44px] rounded-sm border border-greige bg-cream px-3 text-base text-ink focus:border-gold focus:outline-none"
        >
          <option value="">Toutes les disponibilités</option>
          {Object.entries(DISPONIBILITE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Aucun produit"
          message={q || category || disponibilite ? 'Aucun résultat pour ce filtre.' : 'Ajoutez votre premier produit.'}
          actionLabel="Nouveau produit"
          onAction={() => setEditing('new')}
        />
      ) : (
        <Panel>
          <TableWrap>
            <thead>
              <tr>
                <Th>Produit</Th>
                <Th>Catégorie</Th>
                <Th className="text-right">Prix</Th>
                <Th>Disponibilité</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <Td>
                    <div className="flex items-start gap-3">
                      <div className="w-12 shrink-0">
                        <ProductImage src={product.images?.[0]?.url} alt="" sizes="48px" />
                      </div>
                      <div className="min-w-0">
                        <span className="block leading-snug text-ink">{product.nom}</span>
                        <span className="mt-0.5 block text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                          Réf {product.ref}
                        </span>
                        {product.isFeatured || product.isNouveau ? (
                          <span className="mt-1 flex gap-1">
                            {product.isFeatured ? <Badge tone="gold">Vedette</Badge> : null}
                            {product.isNouveau ? <Badge tone="neutral">Nouveau</Badge> : null}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">{product.categoryId?.nom || ''}</Td>
                  <Td className="whitespace-nowrap text-right tabular-nums">
                    {formatPriceShort(product.prix)}
                    {product.ancienPrix ? (
                      <span className="mt-0.5 block text-[12px] text-ink-muted line-through">
                        {formatPriceShort(product.ancienPrix)}
                      </span>
                    ) : null}
                  </Td>
                  <Td>
                    <Badge tone={product.disponibilite === 'RUPTURE' ? 'muted' : 'neutral'}>
                      {DISPONIBILITE_LABEL[product.disponibilite]}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex gap-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditing(product)}
                        className="min-h-[36px] text-[13px] underline decoration-gold underline-offset-4"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(product)}
                        className="min-h-[36px] text-[13px] text-[#8C2F1F] underline decoration-[#8C2F1F]/50 underline-offset-4"
                      >
                        Supprimer
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Panel>
      )}

      {editing ? (
        <ProductEditor
          product={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      ) : null}

      {/* Deletion is the one place a confirmation is warranted. */}
      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/50 px-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirmer la suppression"
            className="w-full max-w-md rounded-sm border border-greige bg-cream p-5"
          >
            <h2 className="font-display text-base tracking-[0.12em] text-ink">Supprimer ce produit ?</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">
              {confirmDelete.nom} (Réf {confirmDelete.ref}) sera retiré du catalogue. Les commandes
              déjà passées ne sont pas modifiées.
            </p>

            <div className="mt-5 flex gap-2">
              <Button onClick={() => handleDelete(confirmDelete)} variant="danger" size="md" className="flex-1">
                Supprimer
              </Button>
              <Button onClick={() => setConfirmDelete(null)} variant="secondary" size="md" className="flex-1">
                Annuler
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
