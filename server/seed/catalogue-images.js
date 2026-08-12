/**
 * Catalogue seed data with real, working photography.
 *
 * WHY THIS FILE EXISTS
 * The original `catalogue.js` points every image at `/products/<slug>-NN.jpg`
 * under the client's public directory. Those files were never added, so the
 * whole storefront rendered as empty greige frames: the product grid, the
 * category tiles and the home page all showed the ProductImage fallback. That
 * made the site impossible to review or demo.
 *
 * Every URL below was checked with an HTTP request and returned 200 at the time
 * this file was written. One candidate came back 404 and was removed rather
 * than left in place. Re-run `node seed/check-images.js` to re-verify them all
 * before a demo; the script exits non-zero if any image has gone away.
 *
 * These are Unsplash photographs, which makes them placeholders with real
 * pixels, not the client's own catalogue. Swapping in the client's photos means
 * replacing the `img()` URLs here — or uploading through the admin, which
 * writes absolute Cloudinary URLs and takes precedence over anything seeded.
 */

/**
 * Unsplash delivers a resized, cropped JPEG from these parameters, so one
 * source photo serves both the 4:5 card and the larger detail frame. `w=1200`
 * is enough for the product page's zoom at 2.4x without shipping a 4MB file to
 * a phone on mobile data.
 */
const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const COULEURS = {
  beigeSable: { nom: 'Beige sable', hex: '#D8CDB8' },
  grisPerle: { nom: 'Gris perle', hex: '#B9B7B0' },
  taupeFonce: { nom: 'Taupe foncé', hex: '#7A6E60' },
  vertOlive: { nom: 'Vert olive', hex: '#5A6350' },
  bleuNuit: { nom: 'Bleu nuit', hex: '#2E3A4A' },
  creme: { nom: 'Crème', hex: '#EDE5D6' },
  terracotta: { nom: 'Terracotta', hex: '#A9614A' },
  noyer: { nom: 'Noyer', hex: '#5C4433' },
  chene: { nom: 'Chêne clair', hex: '#C4A882' },
  anthracite: { nom: 'Anthracite', hex: '#3A3A3C' },
  blancCasse: { nom: 'Blanc cassé', hex: '#EFEBE3' },
  rouille: { nom: 'Rouille', hex: '#96502F' },
};

const c = (...keys) => keys.map((k) => COULEURS[k]);

export const CATEGORIES = [
  {
    nom: 'Salons',
    slug: 'salons',
    ordre: 1,
    description:
      "Canapés d'angle, ensembles trois pièces et fauteuils. Assises en tissu ou en velours, structures en bois massif.",
    image: img('1555041469-a586c61ea9bc'),
  },
  {
    nom: 'Chambres',
    slug: 'chambres',
    ordre: 2,
    description:
      'Lits, armoires, commodes et chevets. Ensembles complets ou pièces séparées, en placage ou en bois massif.',
    image: img('1505693416388-ac5ce068fe85'),
  },
  {
    nom: 'Tables & Chaises',
    slug: 'tables-et-chaises',
    ordre: 3,
    description:
      'Tables à manger fixes ou extensibles, tables basses et chaises. Plateaux en bois, en verre trempé et en marbre.',
    image: img('1533090161767-e6ffed986c88'),
  },
  {
    nom: 'Meubles TV',
    slug: 'meubles-tv',
    ordre: 4,
    description: 'Bancs TV et ensembles muraux, avec rangement fermé et passage de câbles.',
    image: img('1567016432779-094069958ea5'),
  },
  {
    nom: 'Consoles & Miroirs',
    slug: 'consoles-et-miroirs',
    ordre: 5,
    description: "Consoles d'entrée, coiffeuses et miroirs. Pour les entrées et les couloirs.",
    image: img('1519710164239-da123dc03ef4'),
  },
  {
    nom: 'Salon de Jardin',
    slug: 'salon-de-jardin',
    ordre: 6,
    description:
      'Ensembles de terrasse et de jardin en résine tressée et en aluminium, avec coussins déhoussables.',
    image: img('1600121848594-d8644e57abab'),
  },
  {
    nom: 'Décoration',
    slug: 'decoration',
    ordre: 7,
    description:
      "Tapis, luminaires, vases et objets. Les pièces qui terminent une pièce une fois les meubles en place.",
    image: img('1513694203232-719a280e022f'),
  },
];

/**
 * `images` is an explicit list of URLs per product rather than a count, because
 * these are real photographs chosen per piece instead of a naming convention.
 * The first is the card image; the second is what the card cross-fades to on
 * hover and what the gallery opens as the second thumbnail.
 */
export const PRODUITS = [
  // ── Salons ────────────────────────────────────────────────────────────────
  {
    ref: 'LA CONNER',
    nom: "Canapé d'angle La Conner",
    categorie: 'salons',
    prix: 289000,
    ancienPrix: 325000,
    description:
      "Angle réversible six places, assise en mousse haute résilience et dossiers déhoussables. La structure est en hêtre massif : c'est ce qui fait la différence entre un canapé qui tient dix ans et un qui s'affaisse en deux.",
    dimensions: { largeur: 310, profondeur: 180, hauteur: 85 },
    materiaux: ['Hêtre massif', 'Tissu chenille', 'Mousse HR 35 kg/m³'],
    couleurs: c('beigeSable', 'grisPerle', 'taupeFonce'),
    images: [img('1555041469-a586c61ea9bc'), img('1550226891-ef816aed4a98')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '7 à 10 jours',
    isFeatured: true,
    isNouveau: true,
  },
  {
    ref: 'MILANO',
    nom: 'Ensemble salon Milano',
    categorie: 'salons',
    prix: 342000,
    description:
      'Trois pièces : un canapé trois places, un deux places et un fauteuil. Piètement en bois tourné et velours côtelé.',
    dimensions: { largeur: 220, profondeur: 95, hauteur: 88 },
    materiaux: ['Bois massif', 'Velours côtelé', 'Ressorts ensachés'],
    couleurs: c('vertOlive', 'bleuNuit', 'terracotta'),
    images: [img('1550226891-ef816aed4a98'), img('1493663284031-b7e3aefcae8e')],
    disponibilite: 'SUR_COMMANDE',
    delaiLivraison: '3 à 4 semaines',
    isFeatured: true,
  },
  {
    ref: 'OSLO',
    nom: 'Canapé trois places Oslo',
    categorie: 'salons',
    prix: 168000,
    description:
      'Lignes droites et piètement compas. Assise ferme, pensée pour un salon de taille moyenne où un angle ne passerait pas.',
    dimensions: { largeur: 205, profondeur: 88, hauteur: 82 },
    materiaux: ['Chêne massif', 'Tissu bouclé'],
    couleurs: c('creme', 'grisPerle'),
    images: [img('1493663284031-b7e3aefcae8e'), img('1540518614846-7eded433c457')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '5 à 7 jours',
    isFeatured: true,
  },
  {
    ref: 'ATLAS',
    nom: 'Fauteuil Atlas',
    categorie: 'salons',
    prix: 62000,
    description:
      'Fauteuil enveloppant à dossier haut. Se place seul dans un coin lecture ou par paire face au canapé.',
    dimensions: { largeur: 78, profondeur: 82, hauteur: 96 },
    materiaux: ['Hêtre', 'Velours'],
    couleurs: c('rouille', 'vertOlive', 'anthracite'),
    images: [img('1540518614846-7eded433c457'), img('1586023492125-27b2c045efd7')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '5 à 7 jours',
    isNouveau: true,
  },
  {
    ref: 'SIENNE',
    nom: 'Canapé convertible Sienne',
    categorie: 'salons',
    prix: 198000,
    description:
      "Convertible avec coffre de rangement sous l'assise. Le couchage fait 140 sur 200, de quoi accueillir sans improviser.",
    dimensions: { largeur: 230, profondeur: 100, hauteur: 84 },
    materiaux: ['Pin massif', 'Tissu polyester', 'Mécanisme clic-clac'],
    couleurs: c('grisPerle', 'bleuNuit'),
    images: [img('1586023492125-27b2c045efd7'), img('1555041469-a586c61ea9bc')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '7 à 10 jours',
  },

  // ── Chambres ──────────────────────────────────────────────────────────────
  {
    ref: 'VERONE',
    nom: 'Lit Vérone 160x200',
    categorie: 'chambres',
    prix: 145000,
    description:
      'Tête de lit capitonnée et sommier à lattes inclus. Le cadre est en panneau plaqué chêne avec une finition mate qui ne marque pas les doigts.',
    dimensions: { largeur: 178, profondeur: 215, hauteur: 110 },
    materiaux: ['Placage chêne', 'Tissu capitonné', 'Lattes hêtre'],
    couleurs: c('beigeSable', 'taupeFonce', 'chene'),
    images: [img('1505693416388-ac5ce068fe85'), img('1522771739844-6a9f6d5f14af')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '7 à 10 jours',
    isFeatured: true,
  },
  {
    ref: 'AURORE',
    nom: 'Chambre complète Aurore',
    categorie: 'chambres',
    prix: 385000,
    ancienPrix: 420000,
    description:
      "Lit 160, armoire quatre portes, commode et deux chevets. L'ensemble est fabriqué en une seule teinte pour éviter les écarts de nuance entre pièces.",
    dimensions: { largeur: 240, profondeur: 60, hauteur: 220 },
    materiaux: ['MDF plaqué', 'Charnières à fermeture douce'],
    couleurs: c('blancCasse', 'noyer'),
    images: [img('1522771739844-6a9f6d5f14af'), img('1560448204-e02f11c3d0e2')],
    disponibilite: 'SUR_COMMANDE',
    delaiLivraison: '4 à 5 semaines',
    isFeatured: true,
  },
  {
    ref: 'NORDIQUE',
    nom: 'Armoire Nordique quatre portes',
    categorie: 'chambres',
    prix: 172000,
    description:
      'Quatre portes battantes, penderie et six étagères. Les charnières sont à fermeture amortie sur toute la largeur.',
    dimensions: { largeur: 200, profondeur: 58, hauteur: 215 },
    materiaux: ['MDF plaqué', 'Chêne massif'],
    couleurs: c('chene', 'blancCasse'),
    images: [img('1560448204-e02f11c3d0e2'), img('1595428774223-ef52624120d2')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '10 à 14 jours',
  },
  {
    ref: 'CASSIS',
    nom: 'Commode Cassis six tiroirs',
    categorie: 'chambres',
    prix: 78000,
    description:
      'Six tiroirs sur coulisses métalliques. Assez basse pour passer sous une fenêtre standard.',
    dimensions: { largeur: 120, profondeur: 45, hauteur: 82 },
    materiaux: ['Pin massif', 'Coulisses métal'],
    couleurs: c('blancCasse', 'noyer', 'chene'),
    images: [img('1595428774223-ef52624120d2'), img('1567538096630-e0c55bd6374c')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '5 à 7 jours',
    isNouveau: true,
  },
  {
    ref: 'LUNE',
    nom: 'Table de chevet Lune',
    categorie: 'chambres',
    prix: 24000,
    description: 'Deux tiroirs et une niche ouverte. Se vend à l’unité ou par paire.',
    dimensions: { largeur: 45, profondeur: 40, hauteur: 55 },
    materiaux: ['MDF plaqué'],
    couleurs: c('chene', 'blancCasse', 'noyer'),
    images: [img('1567538096630-e0c55bd6374c'), img('1505693416388-ac5ce068fe85')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '3 à 5 jours',
  },

  // ── Tables & Chaises ──────────────────────────────────────────────────────
  {
    ref: 'TOSCANE',
    nom: 'Table à manger Toscane',
    categorie: 'tables-et-chaises',
    prix: 132000,
    description:
      'Plateau en chêne massif de 25 mm sur un piètement central en métal thermolaqué. Huit places sans rallonge.',
    dimensions: { largeur: 220, profondeur: 100, hauteur: 76 },
    materiaux: ['Chêne massif', 'Acier thermolaqué'],
    couleurs: c('chene', 'noyer'),
    images: [img('1533090161767-e6ffed986c88'), img('1615529182904-14819c35db37')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '10 à 14 jours',
    isFeatured: true,
  },
  {
    ref: 'ROMA',
    nom: 'Table extensible Roma',
    categorie: 'tables-et-chaises',
    prix: 98000,
    description:
      'Passe de 160 à 210 cm avec une rallonge escamotable rangée sous le plateau, donc jamais à chercher dans un placard.',
    dimensions: { largeur: 160, profondeur: 90, hauteur: 75 },
    materiaux: ['MDF plaqué', 'Métal'],
    couleurs: c('blancCasse', 'chene'),
    images: [img('1615529182904-14819c35db37'), img('1526057565006-20beab8dd2ed')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '7 à 10 jours',
  },
  {
    ref: 'CARRARE',
    nom: 'Table basse Carrare',
    categorie: 'tables-et-chaises',
    prix: 54000,
    description:
      'Plateau effet marbre sur un piètement doré. Le plateau est traité anti-taches, ce qui compte sur une table où l’on pose du café.',
    dimensions: { largeur: 110, profondeur: 60, hauteur: 42 },
    materiaux: ['Céramique effet marbre', 'Acier doré'],
    couleurs: c('blancCasse', 'anthracite'),
    images: [img('1526057565006-20beab8dd2ed'), img('1449247709967-d4461a6a6103')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '5 à 7 jours',
    isFeatured: true,
    isNouveau: true,
  },
  {
    ref: 'VIENNE',
    nom: 'Chaise Vienne (lot de 2)',
    categorie: 'tables-et-chaises',
    prix: 38000,
    description:
      'Assise cannée et piètement en hêtre. Vendues par deux, empilables pour le rangement.',
    dimensions: { largeur: 46, profondeur: 52, hauteur: 84 },
    materiaux: ['Hêtre massif', 'Cannage rotin'],
    couleurs: c('chene', 'anthracite'),
    images: [img('1449247709967-d4461a6a6103'), img('1503602642458-232111445657')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '5 à 7 jours',
  },
  {
    ref: 'BISTROT',
    nom: 'Chaise Bistrot velours (lot de 2)',
    categorie: 'tables-et-chaises',
    prix: 44000,
    description: 'Dossier arrondi en velours et pieds métal noir. Vendues par deux.',
    dimensions: { largeur: 48, profondeur: 55, hauteur: 88 },
    materiaux: ['Velours', 'Acier laqué'],
    couleurs: c('vertOlive', 'bleuNuit', 'terracotta'),
    images: [img('1503602642458-232111445657'), img('1533090161767-e6ffed986c88')],
    disponibilite: 'SUR_COMMANDE',
    delaiLivraison: '2 à 3 semaines',
  },

  // ── Meubles TV ────────────────────────────────────────────────────────────
  {
    ref: 'HORIZON',
    nom: 'Meuble TV Horizon 180',
    categorie: 'meubles-tv',
    prix: 68000,
    description:
      'Deux portes battantes et une niche centrale pour la box. Le passage de câbles est percé à l’arrière sur toute la longueur.',
    dimensions: { largeur: 180, profondeur: 40, hauteur: 45 },
    materiaux: ['MDF plaqué', 'Métal'],
    couleurs: c('noyer', 'anthracite', 'blancCasse'),
    images: [img('1567016432779-094069958ea5'), img('1592078615290-033ee584e267')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '5 à 7 jours',
    isFeatured: true,
  },
  {
    ref: 'MURAL',
    nom: 'Ensemble mural Cordoue',
    categorie: 'meubles-tv',
    prix: 124000,
    description:
      'Banc TV, colonnes et étagères suspendues. Se monte en plusieurs configurations selon la largeur du mur.',
    dimensions: { largeur: 260, profondeur: 38, hauteur: 180 },
    materiaux: ['MDF laqué', 'LED intégrées'],
    couleurs: c('blancCasse', 'anthracite'),
    images: [img('1592078615290-033ee584e267'), img('1618221195710-dd6b41faaea6')],
    disponibilite: 'SUR_COMMANDE',
    delaiLivraison: '3 à 4 semaines',
  },
  {
    ref: 'NOVA',
    nom: 'Banc TV Nova 140',
    categorie: 'meubles-tv',
    prix: 42000,
    description: 'Format compact à deux tiroirs, pour un salon où le mur TV est court.',
    dimensions: { largeur: 140, profondeur: 38, hauteur: 42 },
    materiaux: ['MDF plaqué'],
    couleurs: c('chene', 'blancCasse'),
    images: [img('1618221195710-dd6b41faaea6'), img('1567016432779-094069958ea5')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '3 à 5 jours',
    isNouveau: true,
  },

  // ── Consoles & Miroirs ────────────────────────────────────────────────────
  {
    ref: 'GALERIE',
    nom: "Console d'entrée Galerie",
    categorie: 'consoles-et-miroirs',
    prix: 46000,
    description:
      'Profondeur de 32 cm seulement : elle passe dans un couloir sans gêner le passage. Deux tiroirs et une tablette basse.',
    dimensions: { largeur: 110, profondeur: 32, hauteur: 78 },
    materiaux: ['Chêne massif', 'Acier noir'],
    couleurs: c('chene', 'noyer'),
    images: [img('1519710164239-da123dc03ef4'), img('1556228453-efd6c1ff04f6')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '5 à 7 jours',
    isFeatured: true,
  },
  {
    ref: 'SOLEIL',
    nom: 'Miroir Soleil doré',
    categorie: 'consoles-et-miroirs',
    prix: 28000,
    description: 'Miroir rond de 90 cm avec un cadre en métal doré brossé. Fixations murales fournies.',
    dimensions: { largeur: 90, profondeur: 4, hauteur: 90 },
    materiaux: ['Métal doré', 'Verre'],
    couleurs: c('chene'),
    images: [img('1556228453-efd6c1ff04f6'), img('1512212621149-107ffe572d2f')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '3 à 5 jours',
    isNouveau: true,
  },
  {
    ref: 'BOUDOIR',
    nom: 'Coiffeuse Boudoir',
    categorie: 'consoles-et-miroirs',
    prix: 62000,
    description: 'Coiffeuse avec miroir, trois tiroirs et un tabouret assorti.',
    dimensions: { largeur: 100, profondeur: 40, hauteur: 140 },
    materiaux: ['MDF laqué', 'Verre'],
    couleurs: c('blancCasse', 'beigeSable'),
    images: [img('1512212621149-107ffe572d2f'), img('1519710164239-da123dc03ef4')],
    disponibilite: 'SUR_COMMANDE',
    delaiLivraison: '2 à 3 semaines',
  },

  // ── Salon de Jardin ───────────────────────────────────────────────────────
  {
    ref: 'PALMA',
    nom: 'Salon de jardin Palma',
    categorie: 'salon-de-jardin',
    prix: 158000,
    ancienPrix: 179000,
    description:
      'Canapé, deux fauteuils et une table basse en résine tressée sur armature aluminium. Les coussins sont déhoussables et lavables.',
    dimensions: { largeur: 200, profondeur: 75, hauteur: 65 },
    materiaux: ['Résine tressée', 'Aluminium', 'Tissu outdoor'],
    couleurs: c('anthracite', 'beigeSable'),
    images: [img('1600121848594-d8644e57abab'), img('1602872030219-ad2b9a54315c')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '7 à 10 jours',
    isFeatured: true,
  },
  {
    ref: 'TERRASSE',
    nom: 'Ensemble repas Terrasse',
    categorie: 'salon-de-jardin',
    prix: 96000,
    description:
      'Table six places et six chaises empilables. L’aluminium ne rouille pas, ce qui compte pour un salon qui reste dehors toute l’année.',
    dimensions: { largeur: 180, profondeur: 90, hauteur: 74 },
    materiaux: ['Aluminium', 'Verre trempé'],
    couleurs: c('anthracite', 'blancCasse'),
    images: [img('1602872030219-ad2b9a54315c'), img('1631679706909-1844bbd07221')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '7 à 10 jours',
  },
  {
    ref: 'HAMAC',
    nom: 'Fauteuil suspendu Hamac',
    categorie: 'salon-de-jardin',
    prix: 52000,
    description: 'Fauteuil œuf suspendu avec support acier et coussin déhoussable.',
    dimensions: { largeur: 100, profondeur: 100, hauteur: 195 },
    materiaux: ['Résine tressée', 'Acier'],
    couleurs: c('creme', 'anthracite'),
    images: [img('1631679706909-1844bbd07221'), img('1600121848594-d8644e57abab')],
    disponibilite: 'SUR_COMMANDE',
    delaiLivraison: '3 à 4 semaines',
    isNouveau: true,
  },

  // ── Décoration ────────────────────────────────────────────────────────────
  {
    ref: 'BERBERE',
    nom: 'Tapis Berbère 200x300',
    categorie: 'decoration',
    prix: 46000,
    description:
      'Tapis à poils longs tissé main, motif berbère. Assez grand pour passer sous les pieds avant d’un canapé et de deux fauteuils.',
    dimensions: { largeur: 200, profondeur: 300, hauteur: 3 },
    materiaux: ['Laine', 'Coton'],
    couleurs: c('creme', 'beigeSable'),
    images: [img('1513694203232-719a280e022f'), img('1584285405429-136bf988919c')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '3 à 5 jours',
    isFeatured: true,
  },
  {
    ref: 'ROTIN',
    nom: 'Suspension Rotin',
    categorie: 'decoration',
    prix: 18000,
    description: 'Abat-jour en rotin tressé, diamètre 45 cm. Douille E27, ampoule non fournie.',
    dimensions: { largeur: 45, profondeur: 45, hauteur: 38 },
    materiaux: ['Rotin naturel'],
    couleurs: c('chene'),
    images: [img('1524758631624-e2822e304c36'), img('1513694203232-719a280e022f')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '3 à 5 jours',
    isNouveau: true,
  },
  {
    ref: 'ARGILE',
    nom: 'Vase Argile (lot de 3)',
    categorie: 'decoration',
    prix: 12000,
    description: 'Trois vases en céramique mate de hauteurs différentes, à grouper sur une console.',
    dimensions: { largeur: 18, profondeur: 18, hauteur: 32 },
    materiaux: ['Céramique'],
    couleurs: c('creme', 'terracotta', 'anthracite'),
    images: [img('1584285405429-136bf988919c'), img('1524758631624-e2822e304c36')],
    disponibilite: 'EN_STOCK',
    delaiLivraison: '3 à 5 jours',
  },
];
