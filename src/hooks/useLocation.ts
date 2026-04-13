"use client";

import { useState, useEffect } from "react";

export interface LocationState {
  lat: number | null;
  lon: number | null;
  name: string | null;
  error: string | null;
  loading: boolean;
}

export function useLocation(enabled: boolean = true) {
  const [state, setState] = useState<LocationState>({
    lat: null, lon: null, name: null, error: null, loading: false,
  });

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation not supported" }));
      return;
    }

    setState((s) => ({ ...s, loading: true }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        let name: string | null = null;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const json = await res.json();
            const a = json.address;
            name = a.city || a.town || a.village || a.county || json.display_name || null;
          }
        } catch {
          // Geocoding failed — coords are still valid
        }

        setState({ lat, lon, name, error: null, loading: false });
      },
      (err) => {
        setState((s) => ({
          ...s,
          error: err.message || "Location access denied",
          loading: false,
        }));
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, [enabled]);

  return state;
}
