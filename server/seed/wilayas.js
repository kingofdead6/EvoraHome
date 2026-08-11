/**
 * The 58 Algerian wilayas with delivery fees.
 *
 * Fees are banded by distance from the shop in El Khroub (Constantine, code 25)
 * and are sized for furniture, not for parcels: a three-seat sofa needs a van,
 * so these are thousands of dinars rather than the 400-800 DA a courier charges
 * for a phone. Stop-desk is cheaper than home delivery in every band because it
 * drops the last leg and the two-person carry.
 *
 * These are plausible starting values, NOT the client's real tariff. They are
 * editable per wilaya from the admin and the client must set their real numbers
 * before launch.
 */

const BANDS = {
  // Constantine and the wilayas around it: a same-day round trip.
  local: { domicile: 2000, stopDesk: 1200 },
  // Rest of the east and the near Kabylie.
  est: { domicile: 3500, stopDesk: 2400 },
  // Algiers, the centre and the coast west of it.
  centre: { domicile: 5000, stopDesk: 3600 },
  // Oran and the west.
  ouest: { domicile: 6500, stopDesk: 4800 },
  // Hauts plateaux and the steppe.
  hautsPlateaux: { domicile: 6000, stopDesk: 4400 },
  // The north Sahara.
  sudNord: { domicile: 9500, stopDesk: 7000 },
  // The deep south. Long haul, and some of it is a two-day drive.
  sudProfond: { domicile: 15000, stopDesk: 11000 },
};

const WILAYA_LIST = [
  [1, 'Adrar', 'sudProfond'],
  [2, 'Chlef', 'centre'],
  [3, 'Laghouat', 'hautsPlateaux'],
  [4, 'Oum El Bouaghi', 'local'],
  [5, 'Batna', 'local'],
  [6, 'Béjaïa', 'est'],
  [7, 'Biskra', 'est'],
  [8, 'Béchar', 'sudProfond'],
  [9, 'Blida', 'centre'],
  [10, 'Bouira', 'centre'],
  [11, 'Tamanrasset', 'sudProfond'],
  [12, 'Tébessa', 'est'],
  [13, 'Tlemcen', 'ouest'],
  [14, 'Tiaret', 'hautsPlateaux'],
  [15, 'Tizi Ouzou', 'est'],
  [16, 'Alger', 'centre'],
  [17, 'Djelfa', 'hautsPlateaux'],
  [18, 'Jijel', 'local'],
  [19, 'Sétif', 'local'],
  [20, 'Saïda', 'ouest'],
  [21, 'Skikda', 'local'],
  [22, 'Sidi Bel Abbès', 'ouest'],
  [23, 'Annaba', 'est'],
  [24, 'Guelma', 'local'],
  [25, 'Constantine', 'local'],
  [26, 'Médéa', 'centre'],
  [27, 'Mostaganem', 'ouest'],
  [28, "M'Sila", 'est'],
  [29, 'Mascara', 'ouest'],
  [30, 'Ouargla', 'sudNord'],
  [31, 'Oran', 'ouest'],
  [32, 'El Bayadh', 'hautsPlateaux'],
  [33, 'Illizi', 'sudProfond'],
  [34, 'Bordj Bou Arréridj', 'local'],
  [35, 'Boumerdès', 'centre'],
  [36, 'El Tarf', 'est'],
  [37, 'Tindouf', 'sudProfond'],
  [38, 'Tissemsilt', 'hautsPlateaux'],
  [39, 'El Oued', 'sudNord'],
  [40, 'Khenchela', 'local'],
  [41, 'Souk Ahras', 'local'],
  [42, 'Tipaza', 'centre'],
  [43, 'Mila', 'local'],
  [44, 'Aïn Defla', 'centre'],
  [45, 'Naâma', 'hautsPlateaux'],
  [46, 'Aïn Témouchent', 'ouest'],
  [47, 'Ghardaïa', 'sudNord'],
  [48, 'Relizane', 'ouest'],
  [49, 'Timimoun', 'sudProfond'],
  [50, 'Bordj Badji Mokhtar', 'sudProfond'],
  [51, 'Ouled Djellal', 'sudNord'],
  [52, 'Béni Abbès', 'sudProfond'],
  [53, 'In Salah', 'sudProfond'],
  [54, 'In Guezzam', 'sudProfond'],
  [55, 'Touggourt', 'sudNord'],
  [56, 'Djanet', 'sudProfond'],
  [57, "El M'Ghair", 'sudNord'],
  [58, 'El Meniaa', 'sudNord'],
];

export const WILAYAS = WILAYA_LIST.map(([code, nom, band]) => ({
  code,
  nom,
  fraisDomicile: BANDS[band].domicile,
  fraisStopDesk: BANDS[band].stopDesk,
  isActive: true,
}));

export default WILAYAS;
