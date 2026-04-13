/**
 * Fetches water temperature from USGS NWIS nearest gauge.
 * Falls back to estimation if USGS is unavailable or no gauge nearby.
 */

const CACHE_KEY = "sw_watertemp_cache";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface WaterTempCache {
  temp_f: number;
  lat: number;
  lon: number;
  timestamp: number;
  source: "usgs" | "estimated";
}

function loadCache(lat: number, lon: number): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as WaterTempCache;
    if (
      Math.abs(c.lat - lat) < 0.5 &&
      Math.abs(c.lon - lon) < 0.5 &&
      Date.now() - c.timestamp < CACHE_TTL_MS
    ) {
      return c.temp_f;
    }
    return null;
  } catch {
    return null;
  }
}

function saveCache(lat: number, lon: number, temp_f: number, source: "usgs" | "estimated") {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ temp_f, lat, lon, timestamp: Date.now(), source }));
  } catch {
    //
  }
}

export async function fetchWaterTemp(lat: number, lon: number): Promise<number | null> {
  const cached = loadCache(lat, lon);
  if (cached !== null) return cached;

  try {
    // USGS NWIS: find nearest site with water temp parameter (00010)
    const url =
      `https://waterservices.usgs.gov/nwis/iv/?format=json&parameterCd=00010` +
      `&bBox=${(lon - 0.5).toFixed(3)},${(lat - 0.5).toFixed(3)},${(lon + 0.5).toFixed(3)},${(lat + 0.5).toFixed(3)}` +
      `&siteType=ST,LK&siteStatus=active`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error("USGS fetch failed");

    const json = await res.json();
    const timeSeries = json?.value?.timeSeries;
    if (!timeSeries || timeSeries.length === 0) throw new Error("No USGS gauge found");

    // Find the most recent reading
    for (const ts of timeSeries) {
      const vals = ts?.values?.[0]?.value;
      if (!vals || vals.length === 0) continue;
      const latest = vals[vals.length - 1];
      const tempC = parseFloat(latest.value);
      if (isNaN(tempC)) continue;
      const tempF = tempC * 9 / 5 + 32;
      saveCache(lat, lon, tempF, "usgs");
      return tempF;
    }

    throw new Error("No valid USGS readings");
  } catch {
    // USGS unavailable — return null, let caller estimate
    return null;
  }
}

/**
 * Rough water temp estimate from air temp + season offset.
 * Used when USGS fails.
 */
export function estimateWaterTemp(airTempF: number, month: number): number {
  const offsets: Record<number, number> = {
    1: -18, 2: -15, 3: -10, 4: -6, 5: -3, 6: 0,
    7: 2, 8: 2, 9: -2, 10: -6, 11: -12, 12: -16,
  };
  return Math.max(32, airTempF + (offsets[month] ?? -8));
}
