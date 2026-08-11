// postcodes.io is a free, open-source, open-data UK postcode API.
// No API key, no cost, no rate-limit charges — safe for an MVP.
const POSTCODES_IO_BASE = 'https://api.postcodes.io/postcodes';

export interface Coords {
  lat: number;
  lng: number;
}

export async function geocodePostcode(postcode: string): Promise<Coords | null> {
  const cleaned = postcode.trim().replace(/\s+/g, '');
  if (!cleaned) return null;
  try {
    const res = await fetch(`${POSTCODES_IO_BASE}/${encodeURIComponent(cleaned)}`);
    const json = await res.json();
    if (json.status === 200 && json.result) {
      return { lat: json.result.latitude, lng: json.result.longitude };
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Free, open, no-key UK places (town/city/village) lookup — same provider as postcodes.io.
const PLACES_BASE = 'https://api.postcodes.io/places';

export async function geocodePlace(query: string): Promise<Coords | null> {
  const cleaned = query.trim();
  if (!cleaned) return null;
  try {
    const res = await fetch(`${PLACES_BASE}?q=${encodeURIComponent(cleaned)}`);
    const json = await res.json();
    if (json.status === 200 && Array.isArray(json.result) && json.result.length > 0) {
      const top = json.result[0];
      return { lat: top.latitude, lng: top.longitude };
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Looks roughly like a UK postcode (full or partial), e.g. "M1 1AE", "M11AE", "SW1A".
function looksLikePostcode(input: string): boolean {
  const cleaned = input.trim().replace(/\s+/g, '');
  return /^[A-Za-z]{1,2}[0-9][A-Za-z0-9]?[0-9]?[A-Za-z]{0,2}$/.test(cleaned) && cleaned.length <= 8;
}

// Tries postcode first if the input looks like one, otherwise (or on failure) falls
// back to a town/city/village name search. Covers both input styles with one field.
export async function searchLocation(query: string): Promise<Coords | null> {
  const cleaned = query.trim();
  if (!cleaned) return null;

  if (looksLikePostcode(cleaned)) {
    const byPostcode = await geocodePostcode(cleaned);
    if (byPostcode) return byPostcode;
  }
  return geocodePlace(cleaned);
}

// Haversine formula — distance in miles between two lat/lng points.
export function distanceMiles(a: Coords, b: Coords): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
