"use client";

import { useState } from "react";
import type { RodRecommendation, LureScore, LureType, WaterClarity, FishingMode } from "@/engine/types";

const HOOK_SET: Partial<Record<LureType, string>> = {
  chatterbait: "Reel down, hard sideways sweep — keep rod low",
  frog: "Wait for weight, then set hard twice",
  jig: "Rod tip down, sharp upward sweep",
  texas_rig: "Rod tip down, sharp upward sweep — bury the hook",
  carolina_rig: "Long, hard sweep — big gap to cover",
  dropshot: "Light side sweep, keep tension — small hook",
  ned_rig: "Light upward sweep — small jig hook",
  shaky_head: "Sharp upward sweep, they're hooked on the fall",
  wacky_rig: "Light sideways sweep — let them load",
  neko_rig: "Light side sweep — finesse hook",
  spinnerbait: "Reel down, hard sweep — they hook themselves",
  topwater: "Wait for weight, then reel down and sweep hard",
  buzzbait: "Wait a half second, sweep hard",
  fluke: "Reel down, hard sweep on the pause bite",
  swimbait_paddle: "Reel down, sweep — usually self-hooking",
  squarebill: "Reel down, sweep — trebles do the work",
  lipless_crank: "Reel down, sweep on the fall bite",
  diving_crank: "Reel down, sweep — let the rod load",
  underspun: "Light sweep on pause bite",
  swimbait_glide: "Wait for turn, sweep hard",
};

function getLineAdvice(lure: LureType, clarity: WaterClarity, mode: FishingMode): string {
  const shore = mode === "shore";
  if (lure === "frog") return shore ? "50lb braid (heavy mat control)" : "65lb braid (max penetration)";
  if (lure === "chatterbait") return shore ? "15lb fluoro (less noise in clear shallows)" : "17lb fluoro";
  if (lure === "spinnerbait") return shore ? "14lb fluoro" : "15lb fluoro";
  if (lure === "texas_rig") return shore ? "14lb fluoro (open), 50lb braid (heavy cover)" : "17lb fluoro or 50lb braid for mats";
  if (lure === "carolina_rig") return "17lb fluoro main, 12lb fluoro leader";
  if (lure === "dropshot") return clarity === "clear" ? (shore ? "6lb fluoro" : "8lb fluoro") : "10lb fluoro";
  if (lure === "ned_rig" || lure === "shaky_head") return clarity === "clear" ? (shore ? "6lb fluoro" : "8lb fluoro") : "10lb fluoro";
  if (lure === "wacky_rig" || lure === "neko_rig") return clarity === "clear" ? "6-8lb fluoro" : "10lb fluoro";
  if (lure === "fluke") return shore ? "10lb fluoro" : "12lb fluoro";
  if (lure === "squarebill" || lure === "diving_crank" || lure === "lipless_crank") return "12-15lb fluoro (stretch helps on trebles)";
  if (lure === "topwater" || lure === "buzzbait") return shore ? "14lb mono or braid" : "17lb braid";
  if (lure === "swimbait_paddle" || lure === "swimbait_glide") return shore ? "14lb fluoro" : "17lb fluoro";
  if (lure === "jig") return shore ? "15lb fluoro" : "17lb fluoro";
  return clarity === "clear" ? (shore ? "10lb fluoro" : "12lb fluoro") : "15lb fluoro";
}

interface Props {
  recommendation: RodRecommendation;
  clarity?: WaterClarity;
  mode?: FishingMode;
}

function LureRow({ lure, rank, clarity, mode }: { lure: LureScore; rank: number; clarity?: WaterClarity; mode?: FishingMode }) {
  const [expanded, setExpanded] = useState(false);
  const maxScore = 30;
  const pct = Math.min(100, Math.round((lure.score / maxScore) * 100));
  const barColor = rank === 0 ? "#ff0080" : rank === 1 ? "#9d00ff" : "#00f0ff";

  return (
    <div className="border-b border-white/5 last:border-0 pb-3 last:pb-0">
      <button
        className="w-full text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            {rank === 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-neon-pink/20 text-neon-pink border border-neon-pink/30">
                TOP
              </span>
            )}
            <span className="text-sm font-semibold text-white capitalize">
              {lure.lure_type.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: barColor }}>
              {lure.score}pts
            </span>
            <span className="text-slate-500 text-xs">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>

        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
      </button>

      {expanded && (
        <div className="mt-2.5 space-y-1.5 pl-1">
          {lure.color_suggestion && (
            <p className="text-xs text-slate-400">
              <span className="text-slate-500">Color: </span>
              {lure.color_suggestion}
            </p>
          )}
          {lure.depth_suggestion && (
            <p className="text-xs text-slate-400">
              <span className="text-slate-500">Depth: </span>
              {lure.depth_suggestion}
            </p>
          )}
          {lure.retrieve_suggestion && (
            <p className="text-xs text-slate-400">
              <span className="text-slate-500">Retrieve: </span>
              {lure.retrieve_suggestion}
            </p>
          )}
          {lure.reasons.length > 0 && (
            <div className="pt-1">
              <p className="text-xs text-slate-500 mb-1">Why:</p>
              <ul className="space-y-0.5">
                {lure.reasons.slice(0, 4).map((r, i) => (
                  <li key={i} className="text-xs text-slate-400 flex gap-1.5">
                    <span className="text-neon-cyan mt-0.5">·</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {HOOK_SET[lure.lure_type] && (
            <div className="mt-1.5 px-2 py-1.5 rounded-md bg-neon-purple/8 border border-neon-purple/15">
              <span className="text-xs text-neon-purple font-semibold">Hook Set: </span>
              <span className="text-xs text-slate-300">{HOOK_SET[lure.lure_type]}</span>
            </div>
          )}
          {(clarity && mode) && (
            <div className="mt-1 px-2 py-1.5 rounded-md bg-neon-cyan/6 border border-neon-cyan/12">
              <span className="text-xs text-neon-cyan font-semibold">Line: </span>
              <span className="text-xs text-slate-300">{getLineAdvice(lure.lure_type, clarity, mode)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RecommendationCard({ recommendation, clarity, mode }: Props) {
  const { rod, lures } = recommendation;

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Rod header */}
      <div>
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">
          {rod.name}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded">
            {rod.rod_power.replace(/_/g, " ")} · {rod.rod_action.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded">
            {rod.line_lb}lb {rod.line_type.replace(/_/g, " ")}
          </span>
          {rod.gear_ratio && (
            <span className="text-xs text-neon-purple bg-neon-purple/10 px-2 py-0.5 rounded border border-neon-purple/20">
              {rod.gear_ratio}
            </span>
          )}
        </div>
        {(rod.rod_brand || rod.reel_brand) && (
          <p className="text-xs text-slate-600 mt-1">
            {[rod.rod_brand, rod.rod_model].filter(Boolean).join(" ")}
            {rod.reel_brand && ` · ${[rod.reel_brand, rod.reel_model].filter(Boolean).join(" ")}`}
          </p>
        )}
      </div>

      {/* Lure list */}
      <div className="space-y-3">
        {lures.map((lure, i) => (
          <LureRow key={lure.lure_type} lure={lure} rank={i} clarity={clarity} mode={mode} />
        ))}
      </div>
    </div>
  );
}
