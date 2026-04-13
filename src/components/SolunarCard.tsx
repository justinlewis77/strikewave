"use client";

import type { SolunarData } from "@/engine/types";

interface Props {
  solunar: SolunarData;
}

export function SolunarCard({ solunar }: Props) {
  const scorePct = Math.round(solunar.solunar_score * 100);
  const barColor = scorePct > 70 ? "#00f0ff" : scorePct > 40 ? "#9d00ff" : "#ff0080";

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">
          Solunar Activity
        </p>
        <span className="text-xs font-bold" style={{ color: barColor }}>
          {scorePct}%
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${scorePct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}88)` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Major Periods</p>
          {solunar.major_periods.map(([start, end], i) => (
            <p key={i} className="text-xs text-neon-cyan font-medium">
              {start} – {end}
            </p>
          ))}
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Minor Periods</p>
          {solunar.minor_periods.map(([start, end], i) => (
            <p key={i} className="text-xs text-slate-300">
              {start} – {end}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
