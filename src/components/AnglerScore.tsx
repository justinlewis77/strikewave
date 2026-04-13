"use client";

import { useMemo } from "react";
import type { CatchEntry, FishingReport } from "@/engine/types";

interface Props { catches: CatchEntry[]; reports: FishingReport[] }

interface MonthStats {
  catchRate: number;   // 0-25
  lureDiversity: number; // 0-25
  conditionsVariety: number; // 0-25
  journalConsistency: number; // 0-25
  total: number; // 0-100
}

function getYM(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function calcMonth(ym: string, catches: CatchEntry[], reports: FishingReport[]): MonthStats {
  const mc = catches.filter((c) => c.date.slice(0, 7) === ym);
  const mr = reports.filter((r) => r.date.slice(0, 7) === ym);

  const sessions = Math.max(mr.length, 1);
  const fishCaught = mc.length + mr.reduce((s, r) => s + (r.fish_caught ?? 0), 0);
  const catchPerSession = fishCaught / sessions;
  const catchRate = Math.min(25, Math.round((catchPerSession / 5) * 25));

  const lures = new Set(mc.map((c) => c.lure_name.toLowerCase()).filter(Boolean));
  const lureDiversity = Math.min(25, Math.round((lures.size / 5) * 25));

  const stages = new Set(mc.map((c) => c.conditions?.spawn_stage).filter(Boolean));
  const conditionsVariety = Math.min(25, Math.round((stages.size / 3) * 25));

  const journalConsistency = Math.min(25, Math.round((mr.length / 8) * 25));

  const total = catchRate + lureDiversity + conditionsVariety + journalConsistency;
  return { catchRate, lureDiversity, conditionsVariety, journalConsistency, total };
}

function getTier(score: number): { label: string; color: string } {
  if (score >= 76) return { label: "ELITE", color: "#ff0080" };
  if (score >= 51) return { label: "SKILLED", color: "#9d00ff" };
  if (score >= 26) return { label: "DEVELOPING", color: "#00f0ff" };
  return { label: "ROOKIE", color: "#ffffff44" };
}

const SUB_LABELS = [
  { key: "catchRate" as const, label: "Catch Rate" },
  { key: "lureDiversity" as const, label: "Lure Diversity" },
  { key: "conditionsVariety" as const, label: "Conditions Variety" },
  { key: "journalConsistency" as const, label: "Journal Consistency" },
];

export function AnglerScore({ catches, reports }: Props) {
  const { current, prev, months } = useMemo(() => {
    const now = new Date();
    const ymCurrent = getYM(now);
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const ymPrev = getYM(prevDate);

    const current = calcMonth(ymCurrent, catches, reports);
    const prev = calcMonth(ymPrev, catches, reports);

    // 6-month sparkline data
    const months: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(calcMonth(getYM(d), catches, reports).total);
    }
    return { current, prev, months };
  }, [catches, reports]);

  const tier = getTier(current.total);
  const trend = current.total - prev.total;

  // SVG sparkline
  const W = 200; const H = 36;
  const pts = months.map((v, i) => {
    const x = (i / (months.length - 1)) * W;
    const y = H - (v / 100) * H;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const firstPt = pts[0]?.split(",") ?? ["0", String(H)];
  const lastPt = pts[pts.length - 1]?.split(",") ?? [String(W), String(H)];

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Angler Score</p>
          <p className="text-xs text-slate-500 mt-0.5">This month vs last</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="font-orbitron text-2xl font-bold" style={{ color: tier.color }}>{current.total}</span>
            <div>
              <p className="font-orbitron text-xs font-bold" style={{ color: tier.color }}>{tier.label}</p>
              <p className={`text-xs font-bold ${trend > 0 ? "text-neon-cyan" : trend < 0 ? "text-neon-pink" : "text-slate-500"}`}>
                {trend > 0 ? `↑ +${trend}` : trend < 0 ? `↓ ${trend}` : "— stable"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="space-y-2">
        {SUB_LABELS.map(({ key, label }) => {
          const val = current[key];
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="text-xs text-slate-500">{val}/25</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(val / 25) * 100}%`, background: tier.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 6-month sparkline */}
      <div>
        <p className="text-xs text-slate-500 mb-1">6-Month Trend</p>
        <div className="relative overflow-hidden rounded-lg bg-white/3" style={{ height: H + 4 }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H + 4 }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="asg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tier.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={tier.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points={`${firstPt[0]},${H} ${polyline} ${lastPt[0]},${H}`}
              fill="url(#asg)"
            />
            <polyline points={polyline} fill="none" stroke={tier.color} strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>6mo ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* Breakdown hint */}
      <p className="text-xs text-slate-600 text-center">
        Based on {catches.length} catches · {reports.length} sessions logged
      </p>
    </div>
  );
}
