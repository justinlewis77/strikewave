"use client";

import type { ConditionSnapshot } from "@/engine/types";

export function calcActivityScore(snap: ConditionSnapshot): number {
  let score = 0;
  const { weather, solunar, spawn_stage } = snap;
  const hour = new Date().getHours();
  const dawn = hour >= 5 && hour <= 8;
  const dusk = hour >= 18 && hour <= 21;
  const wt = weather.water_temp_f ?? 60;

  // Solunar 0–30
  score += Math.round(solunar.solunar_score * 30);

  // Pressure trend
  if (weather.pressure_trend === "falling") score += 20;
  else if (weather.pressure_trend === "stable") score += 10;

  // Cloud cover 60–80%
  if (weather.cloud_cover_pct >= 60 && weather.cloud_cover_pct <= 80) score += 15;
  else if (weather.cloud_cover_pct > 80) score += 8;

  // Temp vs spawn ideal (0–15)
  const idealMap: Record<string, [number, number]> = {
    winter_pattern: [45, 52], early_pre_spawn: [52, 60], late_pre_spawn: [58, 65],
    active_spawn: [63, 72], post_spawn: [68, 76], summer_pattern: [72, 82], fall_turnover: [55, 70],
  };
  const [lo, hi] = idealMap[spawn_stage] ?? [60, 75];
  if (wt >= lo && wt <= hi) score += 15;
  else if (wt >= lo - 5 && wt <= hi + 5) score += 7;

  // Wind 8–15mph
  if (weather.wind_mph >= 8 && weather.wind_mph <= 15) score += 10;
  else if (weather.wind_mph > 15) score += 4;

  // Dawn / dusk
  if (dawn || dusk) score += 10;

  return Math.min(100, score);
}

export function ActivityScore({ snap }: { snap: ConditionSnapshot }) {
  const score = calcActivityScore(snap);
  const label = score >= 80 ? "FIRE" : score >= 60 ? "GOOD" : score >= 40 ? "FAIR" : "SLOW";
  const color = score >= 80 ? "#00ff88" : score >= 60 ? "#00f0ff" : score >= 40 ? "#ffffff" : "#475569";

  return (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className="flex-shrink-0 text-center">
        <p className="font-orbitron text-3xl font-black" style={{ color }}>{score}</p>
        <p className="font-orbitron text-xs font-bold mt-0.5" style={{ color }}>{label}</p>
      </div>
      <div className="flex-1">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Fish Activity</p>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}66, ${color})` }} />
        </div>
      </div>
    </div>
  );
}
