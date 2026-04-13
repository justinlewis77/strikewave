"use client";

import { useState } from "react";
import type { RodRecommendation, LureScore } from "@/engine/types";

interface Props {
  recommendation: RodRecommendation;
}

function LureRow({ lure, rank }: { lure: LureScore; rank: number }) {
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
        </div>
      )}
    </div>
  );
}

export function RecommendationCard({ recommendation }: Props) {
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
          <LureRow key={lure.lure_type} lure={lure} rank={i} />
        ))}
      </div>
    </div>
  );
}
