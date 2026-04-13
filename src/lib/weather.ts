import type { WeatherConditions } from "@/engine/types";

const CACHE_KEY = "sw_weather_cache";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface WeatherCache {
  data: WeatherConditions;
  lat: number;
  lon: number;
  timestamp: number;
}

function loadCache(): WeatherCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WeatherCache;
  } catch {
    return null;
  }
}

function saveCache(data: WeatherConditions, lat: number, lon: number) {
  try {
    const cache: WeatherCache = { data, lat, lon, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage unavailable
  }
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherConditions> {
  // Check cache
  const cached = loadCache();
  if (
    cached &&
    Math.abs(cached.lat - lat) < 0.01 &&
    Math.abs(cached.lon - lon) < 0.01 &&
    Date.now() - cached.timestamp < CACHE_TTL_MS
  ) {
    return cached.data;
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toFixed(4));
  url.searchParams.set("longitude", lon.toFixed(4));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,cloud_cover,pressure_msl,uv_index,weather_code"
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("precipitation_unit", "mm");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);

  const json = await res.json();
  const c = json.current;

  const data: WeatherConditions = {
    temp_f: c.temperature_2m,
    feels_like_f: c.apparent_temperature,
    water_temp_f: null, // fetched separately
    wind_mph: c.wind_speed_10m,
    wind_dir_deg: c.wind_direction_10m,
    cloud_cover_pct: c.cloud_cover,
    precip_mm: c.precipitation,
    pressure_mb: c.pressure_msl,
    uv_index: c.uv_index,
    description: weatherCodeToDescription(c.weather_code),
  };

  saveCache(data, lat, lon);
  return data;
}

function weatherCodeToDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 9) return "Foggy";
  if (code <= 19) return "Drizzle";
  if (code <= 29) return "Rain";
  if (code <= 39) return "Snow";
  if (code <= 49) return "Fog";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 84) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}
