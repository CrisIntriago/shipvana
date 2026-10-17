// Openly licensed ship photos from Wikimedia Commons, stored in public/images/ships.
// Every photo shown on screen must render its credit (author + licence). The full list is on /credits.
import photos from './ship-photos.json';

export type ShipPhoto = {
  file: string;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  width: number;
  height: number;
};

const PHOTOS = photos as Record<string, ShipPhoto>;

/** Photo for a vessel IMO, or null when we have none (never substitute another ship's photo). */
export const photoForImo = (imo: string): ShipPhoto | null => PHOTOS[imo] ?? null;

export const HERO_PHOTO = PHOTOS.hero;
export const PORT_PHOTO = PHOTOS['port-miami'];

export const ALL_PHOTOS = Object.entries(PHOTOS).map(([key, p]) => ({ key, ...p }));
