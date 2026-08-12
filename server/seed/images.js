/**
 * Photography for the seed catalogue.
 *
 * The seed used to point every image slot at `/products/<slug>-NN.jpg`, a file
 * the client had not delivered yet, so a freshly seeded site rendered forty
 * empty greige frames. That is a fine placeholder for a build with no data and
 * a terrible one for a demo, a client review or a staging deploy.
 *
 * Every product, category and showroom slot below now resolves to a real
 * photograph on the Unsplash CDN, sized and cropped by the CDN itself, so a
 * seeded database looks like a furniture catalogue immediately and nothing has
 * to be committed to the repository.
 *
 * THIS IS STILL SCAFFOLDING. The photographs are stock, not the client's
 * pieces, and `DESIGN.md` rules stock photography out of the final build.
 * Replacing them needs no code change: drop the client's files into
 * `client/public/products/` as `<slug>-01.jpg`, `<slug>-02.jpg` and so on, and
 * set `USE_LOCAL_PHOTOS=1` when running the seed.
 *
 * Run `npm run check:images` to confirm every URL below still resolves.
 */

const CDN = 'https://images.unsplash.com/';

/**
 * A gallery of several photographs per product would need several hundred
 * distinct images. Instead each product has one photograph and the CDN crops it
 * differently per slot, which is how a catalogue shoot actually presents one
 * piece: a full frame, then a tighter detail.
 */
const GALLERY_VIEWS = [
  { crop: 'entropy', w: 1200, h: 1500 },
  { crop: 'top', w: 1200, h: 1500 },
  { crop: 'bottom', w: 1200, h: 1500 },
  { crop: 'right', w: 1200, h: 1500 },
];

/** Build a CDN URL for one photo id at one crop. */
export function photoUrl(id, { w = 1200, h = 1500, crop = 'entropy' } = {}) {
  return `${CDN}${id}?auto=format&fit=crop&crop=${crop}&w=${w}&h=${h}&q=80`;
}

/** The `count` gallery slots for one product, as ordered image documents. */
export function galleryFor(id, count, nom, slug) {
  if (!id || process.env.USE_LOCAL_PHOTOS) {
    return Array.from({ length: count }, (_, i) => ({
      url: `/products/${slug}-${String(i + 1).padStart(2, '0')}.jpg`,
      alt: i === 0 ? nom : `${nom}, vue ${i + 1}`,
      ordre: i,
    }));
  }

  return Array.from({ length: count }, (_, i) => ({
    url: photoUrl(id, GALLERY_VIEWS[i % GALLERY_VIEWS.length]),
    alt: i === 0 ? nom : `${nom}, vue ${i + 1}`,
    ordre: i,
  }));
}

/** A wide crop, for the category tiles and the showroom plates. */
export function wideUrl(id, { w = 1400, h = 1000 } = {}) {
  return photoUrl(id, { w, h, crop: 'entropy' });
}

/** Product photography, keyed by the reference code the client already uses. */
export const PRODUCT_PHOTOS = {
  // Salons
  'LA CONNER': 'photo-1555041469-a586c61ea9bc',
  MONTEREY: 'photo-1567538096630-e0c55bd6374c',
  ASILAH: 'photo-1493663284031-b7e3aefcae8e',
  BENSALEM: 'photo-1540574163026-643ea20ade25',
  CADIZ: 'photo-1550226891-ef816aed4a98',
  'ORAN 7P': 'photo-1567016432779-094069958ea5',
  TIPAZA: 'photo-1560448204-e02f11c3d0e2',
  SEVILLE: 'photo-1583847268964-b28dc8f51f92',

  // Chambres
  ALMERIA: 'photo-1505693416388-ac5ce068fe85',
  NERJA: 'photo-1522708323590-d24dbb6b0267',
  CORDOBA: 'photo-1595526114035-0d45ed16cfbf',
  MERZOUGA: 'photo-1616594039964-ae9021a400a0',
  ESSAOUIRA: 'photo-1571508601891-ca5e7a713859',
  TAMANRA: 'photo-1560185893-a55cbc8c57e8',

  // Tables & chaises
  VALENCIA: 'photo-1617806118233-18e1de247200',
  CARRARE: 'photo-1615873968403-89e068629265',
  GRANADA: 'photo-1580480055273-228ff5388ef8',
  MALAGA: 'photo-1532372320572-cda25653a26d',
  TANGER: 'photo-1550581190-9c1c48d21d6c',
  RONDA: 'photo-1533090161767-e6ffed986c88',

  // Meubles TV
  HORIZON: 'photo-1593359677879-a4bb92f829d1',
  ANDALOUS: 'photo-1594026112284-02bb6f3352fe',
  'LOFT 40': 'photo-1598928506311-c55ded91a20c',
  BEJAIA: 'photo-1586023492125-27b2c045efd7',
  'STUDIO 12': 'photo-1616627561950-9f746e330187',

  // Consoles & miroirs
  ALHAMBRA: 'photo-1618220179428-22790b461013',
  'LUNA 90': 'photo-1595428774223-ef52624120d2',
  MIRAMAR: 'photo-1616486338812-3dadae4b4ace',
  PORTO: 'photo-1513694203232-719a280e022f',
  SAHEL: 'photo-1519710164239-da123dc03ef4',

  // Salon de jardin
  PALMA: 'photo-1600210492486-724fe5c67fb0',
  IBIZA: 'photo-1571902943202-507ec2618e8f',
  'SIDI FREDJ': 'photo-1613545325278-f24b0cae1224',
  ZERALDA: 'photo-1600585154340-be6161a56a0c',

  // Décoration
  'ATLAS 200': 'photo-1507473885765-e6ed057f782c',
  SOLEIL: 'photo-1602028915047-37269d1a73f7',
  DJEMILA: 'photo-1517705008128-361805f42e86',
  TASSILI: 'photo-1524484485831-a92ffc0de03f',
  KABYLIE: 'photo-1616486029423-aaa4789e8c9a',
  'MIROIR SOLEIL': 'photo-1556909212-d5b604d0c90d',
};

/** Category tiles, keyed by slug. */
export const CATEGORY_PHOTOS = {
  salons: 'photo-1556228453-efd6c1ff04f6',
  chambres: 'photo-1618221195710-dd6b41faaea6',
  'tables-et-chaises': 'photo-1611967164521-abae8fba4668',
  'meubles-tv': 'photo-1631049307264-da0ec9d70304',
  'consoles-et-miroirs': 'photo-1484154218962-a197022b5858',
  'salon-de-jardin': 'photo-1502005229762-cf1b2da7c5d6',
  decoration: 'photo-1524758631624-e2822e304c36',
};

/** The image for one category tile, or the client's own file when told to. */
export function categoryImage(slug) {
  if (process.env.USE_LOCAL_PHOTOS) return `/products/categories/${slug}.jpg`;
  const id = CATEGORY_PHOTOS[slug];
  return id ? wideUrl(id) : `/products/categories/${slug}.jpg`;
}

/** Every URL the seed would write, for the checker. */
export function allPhotoIds() {
  return [...Object.entries(PRODUCT_PHOTOS), ...Object.entries(CATEGORY_PHOTOS)];
}
