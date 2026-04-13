"use client";

import type { ConditionSnapshot, LureType } from "@/engine/types";

type Speed = "CRAWL" | "SLOW" | "MODERATE" | "BURN";

const FINESSE: LureType[] = ["dropshot", "ned_rig", "neko_rig", "wacky_rig", "shaky_head", "underspun"];
const REACTION: LureType[] = ["chatterbait", "spinnerbait", "lipless_crank", "squarebill", "buzzbait"];

function getSpeed(snap: ConditionSnapshot, topLure?: LureType): Speed {
  const wt = snap.weather.water_temp_f ?? 60;
  const pt = snap.weather.pressure_trend;
  const isFinesse = topLure ? FINESSE.includes(topLure) : false;
  const isReaction = topLure ? REACTION.includes(topLure) : false;

  if (isFinesse) return wt < 55 ? "CRAWL" : "SLOW";

  if (wt < 50) return "CRAWL";
  if (wt < 60) return "SLOW";

  if (pt === "rising") {
    // post-front: drop one level from what conditions would say
    if (wt < 70) return "SLOW";
    return "MODERATE";
  }

  if (snap.spawn_stage === "fall_turnover" && snap.weather.cloud_cover_pct > 60 && pt !== ("rising" as string) && isReaction) {
    return "BURN";
  }

  if (wt >= 65 && snap.weather.cloud_cover_pct > 60) return "BURN";

  return "MODERATE";
}

const SPEED_META: Record<Speed, { color: string; bar: number; desc: string }> = {
  CRAWL:    { color: "#9d00ff", bar: 15, desc: "Long pauses, barely moving. Let the bait do nothing." },
  SLOW:     { color: "#00f0ff", bar: 35, desc: "Slow roll or drag. Count to 3 between movements." },
  MODERATE: { color: "#ffffff", bar: 60, desc: "Steady retrieve with occasional pauses." },
  BURN:     { color: "#ff0080", bar: 95, desc: "Fast and aggressive. Keep it moving — reaction bite is on." },
};

export function RetrieveAdvisor({ snap, topLure }: { snap: ConditionSnapshot; topLure?: LureType }) {
  const speed = getSpeed(snap, topLure);
  const meta = SPEED_META[speed];

  return (
    <div className="glass-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Retrieve Speed</p>
        <span className="font-orbitron text-sm font-bold" style={{ color: meta.color }}>{speed}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${meta.bar}%`, background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})` }} />
      </div>
      <p className="text-xs text-slate-400">{meta.desc}</p>
    </div>
  );
}
