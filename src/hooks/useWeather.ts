"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWeather } from "@/lib/weather";
import { fetchWaterTemp, estimateWaterTemp } from "@/lib/waterTemp";
import type { WeatherConditions } from "@/engine/types";

interface WeatherState {
  weather: WeatherConditions | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export function useWeather(lat: number | null, lon: number | null) {
  const [state, setState] = useState<WeatherState>({
    weather: null, loading: false, error: null, lastUpdated: null,
  });

  const refresh = useCallback(async () => {
    if (lat === null || lon === null) return;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const [weather, waterTemp] = await Promise.all([
        fetchWeather(lat, lon),
        fetchWaterTemp(lat, lon),
      ]);

      const month = new Date().getMonth() + 1;
      const water_temp_f = waterTemp ?? estimateWaterTemp(weather.temp_f, month);

      setState({
        weather: { ...weather, water_temp_f },
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Weather fetch failed",
      }));
    }
  }, [lat, lon]);

  useEffect(() => {
    if (lat !== null && lon !== null) {
      refresh();
    }
  }, [lat, lon, refresh]);

  return { ...state, refresh };
}
