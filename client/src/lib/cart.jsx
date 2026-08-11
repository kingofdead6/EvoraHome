import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

/**
 * The cart.
 *
 * Persisted to localStorage so a customer who closes the tab mid-decision, or
 * loses signal on the bus, still has their basket. The stored shape is
 * deliberately minimal: id, quantity, colour and a display snapshot. Prices are
 * shown from the snapshot but the server recomputes every one of them at
 * checkout, so a stale cart can never produce a wrong total.
 */

const STORAGE_KEY = 'evora.cart.v1';

const CartContext = createContext(null);

/** A product plus a chosen colour is a distinct line. */
const lineKey = (productId, couleur) => `${productId}::${couleur || ''}`;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { item, quantite } = action;
      const key = lineKey(item.productId, item.couleur);
      const existing = state.find((l) => lineKey(l.productId, l.couleur) === key);

      if (existing) {
        return state.map((l) =>
          lineKey(l.productId, l.couleur) === key
            ? { ...l, quantite: Math.min(l.quantite + quantite, 20) }
            : l
        );
      }
      return [...state, { ...item, quantite: Math.min(quantite, 20) }];
    }

    case 'setQuantity': {
      const quantite = Math.max(1, Math.min(action.quantite, 20));
      return state.map((l) =>
        lineKey(l.productId, l.couleur) === action.key ? { ...l, quantite } : l
      );
    }

    case 'remove':
      return state.filter((l) => lineKey(l.productId, l.couleur) !== action.key);

    case 'clear':
      return [];

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load);

  // Counts how many times something was added, so the navbar badge can animate
  // on add without also animating on quantity edits or removals.
  const addCount = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Private browsing on iOS throws here. The cart still works in memory.
    }
  }, [items]);

  const value = useMemo(() => {
    const nbArticles = items.reduce((sum, l) => sum + l.quantite, 0);
    const sousTotal = items.reduce((sum, l) => sum + l.prix * l.quantite, 0);

    return {
      items,
      nbArticles,
      sousTotal,
      addCount: addCount.current,

      add(product, { quantite = 1, couleur = '' } = {}) {
        addCount.current += 1;
        dispatch({
          type: 'add',
          quantite,
          item: {
            productId: product._id,
            ref: product.ref,
            nom: product.nom,
            slug: product.slug,
            prix: product.prix,
            image: product.images?.[0]?.url || '',
            couleur,
          },
        });
      },

      setQuantity: (key, quantite) => dispatch({ type: 'setQuantity', key, quantite }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
      lineKey,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans un CartProvider');
  return ctx;
}
