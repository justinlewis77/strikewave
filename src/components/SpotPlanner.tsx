"use client";

import type { ConditionSnapshot, FishingSpot } from "@/engine/types";

function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

interface ScoredSpot { spot: FishingSpot; score: number; reasons: string[] }

function rankSpots(spots: FishingSpot[], snap: ConditionSnapshot): ScoredSpot[] {
  const hour = new Date().getHours();
  const dawn = hour >= 5 && hour <= 8;
  const dusk = hour >= 18 && hour <= 21;
  const midday = hour >= 10 && hour <= 14;
  const { wind_dir_deg, wind_mph } = snap.weather;

  return spots.map((spot) => {
    let score = 0;
    const reasons: string[] = [];

    // Wind into bank
    if (wind_dir_deg !== undefined && wind_mph > 8) {
      const bearing = Math.atan2(spot.lon - 0, spot.lat - 0) * 180 / Math.PI;
      const diff = angleDiff(wind_dir_deg, (bearing + 360) % 360);
      if (diff <= 60) { score += 3; reasons.push("Wind pushing bait to this bank"); }
    }

    // Dawn/dusk + shallow spots
    if ((dawn || dusk) && (spot.type === "shore" || spot.type === "weed_edge")) {
      score += 2; reasons.push("Low light prime for shallow bite");
    }

    // Spawn + flat/shore
    if (["late_pre_spawn", "active_spawn"].includes(snap.spawn_stage) && spot.type === "shore") {
      score += 2; reasons.push("Spawn activity in shallow water");
    }

    // Summer midday + dock
    if (snap.spawn_stage === "summer_pattern" && midday && spot.type === "boat") {
      score += 2; reasons.push("Shaded midday structure");
    }

    // Weed edge bonus fall turnover
    if (snap.spawn_stage === "fall_turnover" && spot.type === "weed_edge") {
      score += 2; reasons.push("Fall shad migration along weed edges");
    }

    // Structure is year-round good
    if (spot.type === "structure") { score += 1; reasons.push("Reliable holding spot"); }

    return { spot, score, reasons };
  }).sort((a, b) => b.score - a.score);
}

export function SpotPlanner({ snap, spots }: { snap: ConditionSnapshot; spots: FishingSpot[] }) {
  if (spots.length === 0) return (
    <div className="glass-card p-4">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Shore Spot Planner</p>
      <p className="text-xs text-slate-500">No saved spots yet. Drop pins on the Map page to get recommendations here.</p>
    </div>
  );

  const ranked = rankSpots(spots, snap).slice(0, 2);
  const typeColors: Record<FishingSpot["type"], string> = { shore: "#ff0080", boat: "#00f0ff", structure: "#9d00ff", weed_edge: "#22c55e" };

  return (
    <div className="glass-card p-4 space-y-3">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Shore Spot Planner</p>
      {ranked.map(({ spot, score, reasons }) => (
        <div key={spot.id} className="border border-white/8 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: typeColors[spot.type] }} />
              <span className="text-sm font-semibold text-white">{spot.name}</span>
            </div>
            <span className="text-xs font-bold text-neon-cyan">{score}pt</span>
          </div>
          {reasons.slice(0, 2).map((r, i) => (
            <p key={i} className="text-xs text-slate-400 flex gap-1.5"><span className="text-neon-cyan">·</span>{r}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
