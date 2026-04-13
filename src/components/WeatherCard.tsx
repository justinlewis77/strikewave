"use client";

import type { WeatherConditions, ConditionSnapshot } from "@/engine/types";

interface Props {
  weather: WeatherConditions;
  snapshot: ConditionSnapshot;
  onRefresh: () => void;
}

function StatBox({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="glass-card p-3 text-center">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold text-white">
        {value}
        {unit && <span className="text-xs text-slate-400 ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}

export function WeatherCard({ weather, snapshot, onRefresh }: Props) {
  const { temp_f, water_temp_f, wind_mph, cloud_cover_pct, pressure_mb, description } = weather;
  const { spawn_stage, solunar } = snapshot;

  const stageLabel = spawn_stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">
            Conditions
          </p>
          <p className="text-sm text-slate-300 mt-0.5">{description}</p>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs text-slate-500 hover:text-neon-cyan transition-colors px-2 py-1 rounded border border-white/5 hover:border-neon-cyan/20"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Air Temp" value={Math.round(temp_f)} unit="°F" />
        <StatBox
          label="Water Temp"
          value={water_temp_f ? Math.round(water_temp_f) : "—"}
          unit={water_temp_f ? "°F" : ""}
        />
        <StatBox label="Wind" value={Math.round(wind_mph)} unit=" mph" />
        <StatBox label="Cloud" value={cloud_cover_pct} unit="%" />
        <StatBox label="Pressure" value={pressure_mb ? Math.round(pressure_mb) : "—"} unit={pressure_mb ? " mb" : ""} />
        <StatBox label="Solunar" value={(solunar.solunar_score * 10).toFixed(1)} unit="/10" />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neon-pink/10 text-neon-pink border border-neon-pink/20">
          {stageLabel}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
          {solunar.moon_phase_name}
        </span>
      </div>
    </div>
  );
}
