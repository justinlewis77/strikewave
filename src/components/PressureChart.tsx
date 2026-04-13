"use client";

import { useEffect, useState } from "react";

interface Props { lat: number | null; lon: number | null; currentMb?: number; trend?: string }

export function PressureChart({ lat, lon, currentMb, trend }: Props) {
  const [data, setData] = useState<number[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [nowIdx, setNowIdx] = useState(12);

  useEffect(() => {
    if (!lat || !lon) return;
    setLoading(true);
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat.toFixed(4));
    url.searchParams.set("longitude", lon.toFixed(4));
    url.searchParams.set("hourly", "surface_pressure");
    url.searchParams.set("past_hours", "12");
    url.searchParams.set("forecast_hours", "12");
    url.searchParams.set("timezone", "auto");

    fetch(url.toString())
      .then((r) => r.json())
      .then((j) => {
        const pressures: number[] = j.hourly?.surface_pressure ?? [];
        const timeStrs: string[] = j.hourly?.time ?? [];
        if (pressures.length === 0) return;
        setData(pressures);
        setTimes(timeStrs.map((t: string) => {
          const d = new Date(t);
          return d.getHours().toString().padStart(2, "0") + ":00";
        }));
        // Find "now" index
        const now = new Date();
        const idx = timeStrs.findIndex((t: string) => new Date(t) >= now);
        setNowIdx(idx >= 0 ? idx : 12);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lat, lon]);

  if (!lat || !lon) return null;
  if (loading || data.length < 2) return (
    <div className="h-20 flex items-center justify-center">
      <p className="text-xs text-slate-600">{loading ? "Loading pressure chart..." : ""}</p>
    </div>
  );

  const min = Math.min(...data) - 1;
  const max = Math.max(...data) + 1;
  const W = 300; const H = 60;
  const pts = data.map((p, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((p - min) / (max - min)) * H;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");

  const lineColor = trend === "falling" ? "#ff0080" : trend === "rising" ? "#00f0ff" : "#ffffff66";
  const trendNote = trend === "falling" ? "Pre-storm — reaction bite on" : trend === "rising" ? "Post-front — slow down, finesse" : "Stable — no adjustment needed";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{times[0] ?? "12h ago"}</span>
        <span className="text-slate-400">{currentMb ? `${Math.round(currentMb)} hPa` : ""}</span>
        <span>{times[times.length - 1] ?? "+12h"}</span>
      </div>
      <div className="relative overflow-hidden rounded-lg bg-white/3" style={{ height: H }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,${H} ${polyline} ${W},${H}`} fill="url(#pg)" />
          <polyline points={polyline} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinejoin="round" />
          {/* Now marker */}
          {nowIdx > 0 && (
            <line
              x1={(nowIdx / (data.length - 1)) * W}
              y1={0}
              x2={(nowIdx / (data.length - 1)) * W}
              y2={H}
              stroke="rgba(255,255,255,0.3)"
              strokeDasharray="2,2"
              strokeWidth="1"
            />
          )}
        </svg>
      </div>
      <p className="text-xs text-slate-500">{trendNote}</p>
    </div>
  );
}
