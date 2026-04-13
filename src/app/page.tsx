"use client";

import { useMemo, useState, useEffect } from "react";
import { useDB } from "@/hooks/useDB";
import { useLocation } from "@/hooks/useLocation";
import { useWeather } from "@/hooks/useWeather";
import { getRecommendations, detectSpawnStage, detectSeason } from "@/engine/recommender";
import { calculateSolunar } from "@/engine/solunar";
import type { ConditionSnapshot } from "@/engine/types";
import { WeatherCard } from "@/components/WeatherCard";
import { RecommendationCard } from "@/components/RecommendationCard";
import { SolunarCard } from "@/components/SolunarCard";
import { CastingAdvisor } from "@/components/CastingAdvisor";
import { CatchLog } from "@/components/CatchLog";
import { ActivityScore } from "@/components/ActivityScore";
import { RetrieveAdvisor } from "@/components/RetrieveAdvisor";
import { StructureFinder } from "@/components/StructureFinder";
import { LureRotation } from "@/components/LureRotation";
import { SpotPlanner } from "@/components/SpotPlanner";
import { PressureChart } from "@/components/PressureChart";

const BANK_FACING_KEY = "sw_bank_facing";

export default function DashboardPage() {
  const { rods, lures, catches, spots, settings, ready, saveCatch, removeCatch, saveSettings } = useDB();
  const location = useLocation(settings.use_gps);

  const lat = location.lat ?? settings.location_lat ?? null;
  const lon = location.lon ?? settings.location_lon ?? null;

  const { weather, loading: weatherLoading, error: weatherError, refresh } = useWeather(lat, lon);

  const [bankFacingDeg, setBankFacingDeg] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(BANK_FACING_KEY);
    if (stored) setBankFacingDeg(parseInt(stored));
  }, []);

  const handleBankFacing = (deg: number) => {
    setBankFacingDeg(deg);
    localStorage.setItem(BANK_FACING_KEY, String(deg));
  };

  const snapshot = useMemo<ConditionSnapshot | null>(() => {
    if (!weather) return null;
    const now = new Date();
    const month = now.getMonth() + 1;
    return {
      weather,
      solunar: calculateSolunar(now),
      season: detectSeason(month),
      spawn_stage: detectSpawnStage(weather.water_temp_f, month),
      water_clarity: settings.water_clarity,
      fishing_mode: settings.fishing_mode ?? "shore",
      bank_facing_deg: bankFacingDeg,
      lake_profile: settings.lake_profile,
      timestamp: Date.now(),
      location: lat && lon ? { lat, lon } : undefined,
    };
  }, [weather, settings, bankFacingDeg, lat, lon]);

  const recommendations = useMemo(() => {
    if (!snapshot || rods.length === 0) return [];
    return getRecommendations(rods, snapshot);
  }, [snapshot, rods]);

  const toggleFishingMode = async () => {
    const newMode = settings.fishing_mode === "shore" ? "boat" : "shore";
    await saveSettings({ ...settings, fishing_mode: newMode });
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold tracking-wider text-white">
            STRIKE<span className="neon-pink">WAVE</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {location.name ? location.name : lat ? "Locating..." : "No location set"}
            {snapshot && (
              <span className="ml-2 text-xs text-slate-500">
                · {snapshot.spawn_stage.replace(/_/g, " ")}
              </span>
            )}
          </p>
        </div>

        {/* Fishing mode toggle */}
        <button
          onClick={toggleFishingMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            settings.fishing_mode === "boat"
              ? "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30"
              : "bg-neon-pink/10 text-neon-pink border-neon-pink/20"
          }`}
        >
          {settings.fishing_mode === "boat" ? "⛵ Boat" : "🚶 Shore"}
        </button>
      </div>

      {/* No location */}
      {!lat && !weatherLoading && (
        <div className="glass-card p-4">
          <p className="text-sm text-slate-300">
            Enable GPS or set a location in{" "}
            <a href="/settings" className="neon-cyan underline">Settings</a> to get real-time recommendations.
          </p>
        </div>
      )}

      {weatherError && (
        <div className="glass-card p-4 border border-red-500/20">
          <p className="text-sm text-red-400">Weather unavailable: {weatherError}</p>
          <button onClick={refresh} className="text-xs neon-cyan mt-1 underline">Retry</button>
        </div>
      )}

      {weatherLoading && (
        <div className="glass-card p-4">
          <p className="text-sm neon-pulse text-slate-400">Fetching conditions...</p>
        </div>
      )}

      {weather && snapshot && (
        <WeatherCard weather={weather} snapshot={snapshot} onRefresh={refresh} />
      )}

      {snapshot && <SolunarCard solunar={snapshot.solunar} />}

      {/* Activity Score */}
      {snapshot && <ActivityScore snap={snapshot} />}

      {/* Pressure Chart */}
      {snapshot && lat && lon && (
        <div className="glass-card p-4">
          <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Pressure Trend</p>
          <PressureChart lat={lat} lon={lon} currentMb={snapshot.weather.pressure_mb} trend={snapshot.weather.pressure_trend} />
        </div>
      )}

      {/* Casting Advisor — shore only */}
      {snapshot && settings.fishing_mode === "shore" && (
        <CastingAdvisor
          wind_mph={snapshot.weather.wind_mph}
          wind_dir_deg={snapshot.weather.wind_dir_deg}
          bank_facing_deg={bankFacingDeg}
          onChangeBankFacing={handleBankFacing}
        />
      )}

      {/* Retrieve Advisor */}
      {snapshot && (
        <div className="glass-card p-4">
          <RetrieveAdvisor snap={snapshot} topLure={recommendations[0]?.lures[0]?.lure_type} />
        </div>
      )}

      {/* Structure Finder */}
      {snapshot && (
        <div className="glass-card p-4">
          <StructureFinder snap={snapshot} />
        </div>
      )}

      {/* Rod Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-orbitron text-sm font-bold tracking-widest text-slate-300 uppercase">
            Rod Recommendations
          </h2>
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.rod.id} recommendation={rec} clarity={settings.water_clarity} mode={settings.fishing_mode ?? "shore"} />
          ))}
        </div>
      )}

      {/* Lure Rotation */}
      {snapshot && (
        <div className="glass-card p-4">
          <LureRotation snap={snapshot} inventory={lures} />
        </div>
      )}

      {/* Spot Planner */}
      {snapshot && spots.length > 0 && (
        <div className="glass-card p-4">
          <SpotPlanner snap={snapshot} spots={spots} />
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

      {/* Catch Log */}
      <CatchLog
        catches={catches}
        fishing_mode={settings.fishing_mode ?? "shore"}
        current_spawn_stage={snapshot?.spawn_stage}
        current_temp_f={weather?.temp_f}
        current_water_temp_f={weather?.water_temp_f}
        current_wind_mph={weather?.wind_mph}
        onSave={saveCatch}
        onDelete={removeCatch}
      />
    </div>
  );
}
