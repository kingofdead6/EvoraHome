import { useEffect, useState } from 'react';

import api from '../../lib/api';
import { useSettingsContext } from '../../lib/settings';
import { PageHeader, Panel, AdminInput, AdminTextArea, StatusLine } from './AdminUI';
import Button from '../../Components/UI/Button';
import { Loading } from '../../Components/UI/States';

/**
 * Shop settings.
 *
 * Everything the client will want to change without calling anyone: phone
 * numbers, address, hours, social links and the hero copy. Saving updates the
 * live SettingsProvider immediately, so the footer reflects the change without
 * a reload.
 */
export default function AdminSettings() {
  const { settings, setSettings } = useSettingsContext();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api
      .settings(controller.signal)
      .then((data) => setForm(data || settings))
      .catch(() => setForm(settings));
    return () => controller.abort();
    // Loads once. `settings` is only the fallback for a failed request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const saved = await api.admin.updateSettings(form);
      setForm(saved);
      setSettings((prev) => ({ ...prev, ...saved }));
      setStatus({ ok: true, message: 'Réglages enregistrés' });
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <Loading />;

  return (
    <>
      <PageHeader
        title="Réglages"
        description="Ces informations apparaissent dans le pied de page, sur la page contact et sur l'accueil."
      />

      <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
        <Panel title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Téléphone principal"
              type="tel"
              value={form.telephone || ''}
              onChange={set('telephone')}
              placeholder="0540870382"
            />
            <AdminInput
              label="Téléphone secondaire"
              type="tel"
              value={form.telephone2 || ''}
              onChange={set('telephone2')}
            />
            <AdminInput
              label="WhatsApp (format international)"
              value={form.whatsapp || ''}
              onChange={set('whatsapp')}
              placeholder="213540870382"
            />
            <AdminInput label="Adresse" value={form.adresse || ''} onChange={set('adresse')} />
          </div>

          <div className="mt-4">
            <AdminTextArea
              label="Horaires"
              rows={2}
              value={form.horaires || ''}
              onChange={set('horaires')}
              placeholder="Samedi au jeudi, 9h00 à 18h00. Vendredi fermé."
            />
          </div>
        </Panel>

        <Panel title="Réseaux sociaux">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Instagram (identifiant sans @)"
              value={form.instagram || ''}
              onChange={set('instagram')}
              placeholder="evorahomealgeria"
            />
            <AdminInput
              label="Facebook (adresse complète)"
              value={form.facebook || ''}
              onChange={set('facebook')}
              placeholder="https://facebook.com/..."
            />
            <AdminInput
              label="TikTok (identifiant sans @)"
              value={form.tiktok || ''}
              onChange={set('tiktok')}
              placeholder="evorahome"
            />
          </div>
        </Panel>

        <Panel title="Accueil">
          <div className="flex flex-col gap-4">
            <AdminInput
              label="Titre principal"
              value={form.heroTitle || ''}
              onChange={set('heroTitle')}
            />
            <AdminTextArea
              label="Sous-titre"
              rows={2}
              value={form.heroSubtitle || ''}
              onChange={set('heroSubtitle')}
            />
          </div>
        </Panel>

        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? 'Enregistrement' : 'Enregistrer'}
          </Button>
          <StatusLine status={status} />
        </div>
      </form>
    </>
  );
}
