export type GeoResult = {
  lat: number;
  lon: number;
  displayName: string;
};

export type Attraction = {
  name: string;
  kind: string;
  emoji: string;
};

const KIND_EMOJI: Record<string, string> = {
  attraction: "🏛️",
  museum: "🖼️",
  viewpoint: "🌄",
  gallery: "🎨",
  artwork: "🗿",
  castle: "🏰",
  monument: "🗽",
  ruins: "🏚️",
  archaeological_site: "⛏️",
  building: "🏢",
  memorial: "🕊️",
  church: "⛪",
  mosque: "🕌",
  temple: "⛩️",
  historic: "📜",
};

function kindEmoji(kind: string): string {
  return KIND_EMOJI[kind] ?? "📍";
}

export async function geocodeCity(
  query: string,
  signal?: AbortSignal,
): Promise<GeoResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=0`;
  const res = await fetch(url, {
    headers: { "User-Agent": "PackEasy/1.0 (travel packing app)" },
    signal,
  });
  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  if (!data.length) return null;
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

export async function fetchAttractions(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<Attraction[]> {
  const radius = 8000;
  const overpassQuery = `[out:json][timeout:20];(node["tourism"~"attraction|museum|viewpoint|gallery|artwork"](around:${radius},${lat},${lon});node["historic"~"castle|monument|ruins|archaeological_site|memorial"](around:${radius},${lat},${lon});way["tourism"~"attraction|museum"](around:${radius},${lat},${lon}););out 20;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: overpassQuery,
    signal,
  });

  const data = (await res.json()) as {
    elements: Array<{
      tags?: { name?: string; tourism?: string; historic?: string };
    }>;
  };

  const seen = new Set<string>();
  const results: Attraction[] = [];

  for (const el of data.elements) {
    const name = el.tags?.name;
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const kind = el.tags?.tourism ?? el.tags?.historic ?? "attraction";
    results.push({ name, kind, emoji: kindEmoji(kind) });
    if (results.length >= 10) break;
  }

  return results;
}

export function googleFlightsUrl(destination: string): string {
  return `https://www.google.com/travel/flights?q=${encodeURIComponent("flights to " + destination)}`;
}

export function skyscannerUrl(destination: string): string {
  return `https://www.skyscanner.net/transport/flights-from/anywhere/${encodeURIComponent(destination.toLowerCase().replace(/\s+/g, "-"))}/`;
}

export function bookingUrl(destination: string): string {
  return `https://www.booking.com/search.html?ss=${encodeURIComponent(destination)}`;
}

export function airbnbUrl(destination: string): string {
  return `https://www.airbnb.com/s/${encodeURIComponent(destination)}/homes`;
}
