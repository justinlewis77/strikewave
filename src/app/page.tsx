"use client";

import { useMemo } from "react";
import { useDB } from "@/hooks/useDB";
import { useLocation } from "@/hooks/useLocation";
import { useWeather } from "@/hooks/useWeather";
import { getRecommendations, detectSpawnStage, detectSeason } from "@/engine/recommender";
import { calculateSolunar } from "@/engine/solunar";
import type { ConditionSnapshot } from "@/engine/types";
import { WeatherCard } from "@/components/WeatherCard";
import { RecommendationCard } from "@/components/RecommendationCard";
import { SolunarCard } from "@/components/SolunarCard";

export default function DashboardPage() {
  const { rods, settings, ready } = useDB();
  const location = useLocation(settings.use_gps);

  const lat = location.lat ?? settings.location_lat ?? null;
  const lon = location.lon ?? settings.location_lon ?? null;

  const { weather, loading: weatherLoading, error: weatherError, refresh } = useWeather(lat, lon);

  const snapshot = useMemo<ConditionSnapshot | null>(() => {
    if (!weather) return null;
    const now = new Date();
    const month = now.getMonth() + 1;
    const season = detectSeason(month);
    const spawn_stage = detectSpawnStage(weather.water_temp_f, month);
    const solunar = calculateSolunar(now);
    return {
      weather,
      solunar,
      season,
      spawn_stage,
      water_clarity: settings.water_clarity,
      timestamp: Date.now(),
      location: lat && lon ? { lat, lon } : undefined,
    };
  }, [weather, settings.water_clarity, lat, lon]);

  const recommendations = useMemo(() => {
    if (!snapshot || rods.length === 0) return [];
    return getRecommendations(rods, snapshot);
  }, [snapshot, rods]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="font-orbitron neon-pulse neon-cyan text-sm tracking-widest">LOADING...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-orbitron text-2xl font-bold tracking-wider text-white">
          STRIKE<span className="neon-pink">WAVE</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {location.name ? `${location.name}` : "Locating..."}
          {snapshot && (
            <span className="ml-2 text-xs text-slate-500">
              · {snapshot.spawn_stage.replace(/_/g, " ")}
            </span>
          )}
        </p>
      </div>

      {/* No location */}
      {!lat && !weatherLoading && (
        <div className="glass-card p-4 border-neon-cyan/20">
          <p className="text-sm text-slate-300">
            Enable GPS or set a location in{" "}
            <a href="/settings" className="neon-cyan underline">Settings</a>{" "}
            to get real-time recommendations.
          </p>
        </div>
      )}

      {/* Weather error */}
      {weatherError && (
        <div className="glass-card p-4 border border-red-500/20">
          <p className="text-sm text-red-400">Weather unavailable: {weatherError}</p>
          <button onClick={refresh} className="text-xs neon-cyan mt-1 underline">Retry</button>
        </div>
      )}

      {/* Loading */}
      {weatherLoading && (
        <div className="glass-card p-4">
          <p className="text-sm neon-pulse text-slate-400">Fetching conditions...</p>
        </div>
      )}

      {/* Weather card */}
      {weather && snapshot && (
        <WeatherCard weather={weather} snapshot={snapshot} onRefresh={refresh} />
      )}

      {/* Solunar */}
      {snapshot && <SolunarCard solunar={snapshot.solunar} />}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-orbitron text-sm font-bold tracking-widest text-slate-300 uppercase">
            Rod Recommendations
          </h2>
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.rod.id} recommendation={rec} />
          ))}
        </div>
      )}

      {rods.length === 0 && ready && (
        <div className="glass-card p-6 text-center">
          <p className="text-slate-400 text-sm">
            No rod setups found.{" "}
            <a href="/inventory" className="neon-cyan underline">Add rods in Inventory</a>.
          </p>
        </div>
      )}
    </div>
  );
}
