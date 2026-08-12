/**
 * Stand-in photography for the two slots the API does not own.
 *
 * Product and category photographs come from the database, so the seed fills
 * them. The showroom page's header and its three plates are page furniture
 * rather than catalogue data, and the original build pointed them at files in
 * `public/products/` that do not exist yet, so the page shipped with four empty
 * greige frames on it.
 *
 * These are stock photographs, which `DESIGN.md` rules out of the final build.
 * They are here so a fresh deploy looks like a shop instead of a wireframe.
 * When the client delivers their own photography, drop the files into
 * `client/public/products/` under the names in `LOCAL` below; that path is
 * tried first and these URLs are only the fallback.
 */

const CDN = 'https://images.unsplash.com/';

const photo = (id, w, h) => `${CDN}${id}?auto=format&fit=crop&crop=entropy&w=${w}&h=${h}&q=80`;

export const showroom = {
  header: {
    local: '/products/showroom-header.jpg',
    remote: photo('photo-1600607687939-ce8a6c25118c', 1800, 900),
    alt: '',
  },
  plates: [
    {
      local: '/products/showroom-01.jpg',
      remote: photo('photo-1616486338812-3dadae4b4ace', 1200, 900),
      alt: 'Salons exposés dans le showroom Evora Home',
    },
    {
      local: '/products/showroom-02.jpg',
      remote: photo('photo-1616594039964-ae9021a400a0', 900, 1125),
      alt: 'Coin chambre du showroom',
    },
    {
      local: '/products/showroom-03.jpg',
      remote: photo('photo-1615873968403-89e068629265', 900, 1125),
      alt: 'Tables et chaises exposées',
    },
  ],
};
