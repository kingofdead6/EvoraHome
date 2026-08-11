import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from './api';
import { contact as fallbackContact, brand } from '../brand';

/**
 * Shop settings, editable by the client from the admin.
 *
 * Falls back to the constants in brand.js while loading and if the request
 * fails, so the footer never renders a blank phone number. A customer with no
 * way to call the shop is the one failure this site cannot afford.
 */

const SettingsContext = createContext(null);

const FALLBACK = {
  telephone: fallbackContact.telephone,
  telephone2: fallbackContact.telephone2,
  whatsapp: fallbackContact.whatsapp,
  adresse: fallbackContact.adresse,
  horaires: fallbackContact.horaires,
  instagram: fallbackContact.instagram,
  facebook: fallbackContact.facebook,
  heroTitle: brand.tagline,
  heroSubtitle: 'Meuble et article de décoration. Showroom à El Khroub, livraison dans les 58 wilayas.',
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);

  useEffect(() => {
    const controller = new AbortController();
    api
      .settings(controller.signal)
      .then((data) => {
        if (!data) return;
        // Merge rather than replace: an empty field in the database should not
        // wipe out a working fallback.
        setSettings((prev) => {
          const merged = { ...prev };
          for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string' && value.trim()) merged[key] = value;
          }
          return merged;
        });
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const value = useMemo(() => ({ settings, setSettings }), [settings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings doit être utilisé dans un SettingsProvider');
  return ctx.settings;
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext doit être utilisé dans un SettingsProvider');
  return ctx;
}
