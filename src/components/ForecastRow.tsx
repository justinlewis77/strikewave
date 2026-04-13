"use client";

import { useEffect, useState } from "react";
import { calculateSolunar } from "@/engine/solunar";

interface DayForecast {
  date: Date;
  dayName: string;
  bestScore: number;
  bestWindow: string; // "6 AM – 8 AM"
  icon: string;
  label: string;
}

function scoreHour(hour: number, cloudCover: number, windMph: number, tempF: number): number {
  let s = 0;
  // Time of day
  if (hour >= 5 && hour <= 8) s += 30;
  else if (hour >= 18 && hour <= 21) s += 25;
  else if (hour >= 9 && hour <= 11) s += 15;
  else if (hour >= 15 && hour <= 17) s += 10;
  else s += 5;
  // Cloud cover
  if (cloudCover >= 50 && cloudCover <= 80) s += 20;
  else if (cloudCover >= 30) s += 10;
  else if (cloudCover > 80) s += 5;
  // Wind
  if (windMph >= 8 && windMph <= 15) s += 20;
  else if (windMph >= 5 && windMph < 8) s += 12;
  else if (windMph > 15 && windMph <= 20) s += 10;
  else if (windMph < 5) s += 5;
  // Temp
  if (tempF >= 65 && tempF <= 82) s += 15;
  else if ((tempF >= 55 && tempF < 65) || (tempF > 82 && tempF <= 90)) s += 10;
  else if (tempF >= 45 && tempF < 55) s += 5;

  return Math.min(100, s);
}

function getLabel(score: number) {
  if (score >= 75) return { label: "FIRE", color: "#ff0080", icon: "🔥" };
  if (score >= 55) return { label: "GOOD", color: "#9d00ff", icon: "✅" };
  if (score >= 35) return { label: "FAIR", color: "#00f0ff", icon: "🎣" };
  return { label: "SLOW", color: "#475569", icon: "😴" };
}

function fmtHour(h: number) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

export function ForecastRow({ lat, lon }: { lat: number | null; lon: number | null }) {
  const [days, setDays] = useState<DayForecast[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const useLat = lat ?? 42.9634;
    const useLon = lon ?? -83.6875;
    setLoading(true);
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", useLat.toFixed(4));
    url.searchParams.set("longitude", useLon.toFixed(4));
    url.searchParams.set("hourly", "temperature_2m,cloud_cover,wind_speed_10m");
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("wind_speed_unit", "mph");
    url.searchParams.set("forecast_days", "5");
    url.searchParams.set("timezone", "auto");

    fetch(url.toString())
      .then((r) => r.json())
      .then((j) => {
        const temps: number[] = j.hourly?.temperature_2m ?? [];
        const clouds: number[] = j.hourly?.cloud_cover ?? [];
        const winds: number[] = j.hourly?.wind_speed_10m ?? [];
        const times: string[] = j.hourly?.time ?? [];
        if (!temps.length) return;

        // Group by date
        const byDay = new Map<string, { scores: { score: number; hour: number }[] }>();
        times.forEach((t, i) => {
          const d = t.slice(0, 10);
          const hour = parseInt(t.slice(11, 13));
          const score = scoreHour(hour, clouds[i] ?? 50, winds[i] ?? 10, temps[i] ?? 65);
          if (!byDay.has(d)) byDay.set(d, { scores: [] });
          byDay.get(d)!.scores.push({ score, hour });
        });

        const result: DayForecast[] = [];
        const now = new Date();
        byDay.forEach((v, dateStr) => {
          const date = new Date(dateStr + "T12:00:00");
          // Add solunar bonus
          const sol = calculateSolunar(date);
          const solBonus = Math.round(sol.solunar_score * 15);

          // Find best 2-hour window
          const scores = v.scores.filter((s) => s.hour >= 5 && s.hour <= 21);
          let bestScore = 0;
          let bestHour = 6;
          for (let i = 0; i < scores.length - 1; i++) {
            const twoHrScore = Math.round((scores[i].score + (scores[i + 1]?.score ?? scores[i].score)) / 2) + solBonus;
            if (twoHrScore > bestScore) { bestScore = twoHrScore; bestHour = scores[i].hour; }
          }
          bestScore = Math.min(100, bestScore);

          const { label, color, icon } = getLabel(bestScore);
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const isToday = dateStr === now.toISOString().slice(0, 10);

          result.push({
            date,
            dayName: isToday ? "Today" : days[date.getDay()],
            bestScore,
            bestWindow: `${fmtHour(bestHour)}–${fmtHour(bestHour + 2)}`,
            icon,
            label,
          });
        });
        setDays(result.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lat, lon]);

  if (loading) return (
    <div className="glass-card p-4">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">5-Day Forecast</p>
      <p className="text-xs text-slate-600 neon-pulse">Loading forecast...</p>
    </div>
  );

  if (!days.length) return null;

  return (
    <div className="glass-card p-4 space-y-3">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">5-Day Fishing Forecast</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {days.map((d, i) => {
          const { color } = getLabel(d.bestScore);
          const isToday = d.dayName === "Today";
          const isSel = selected === i;
          return (
            <button
              key={i}
              onClick={() => setSelected(isSel ? null : i)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border transition-all ${
                isToday ? "border-white/20 bg-white/8" : "border-white/8 bg-white/3"
              } ${isSel ? "ring-1 ring-white/20" : ""}`}
              style={{ minWidth: "68px" }}
            >
              <span className="text-xs font-bold text-slate-300">{d.dayName}</span>
              <span className="text-lg">{d.icon}</span>
              <span className="font-orbitron text-sm font-bold" style={{ color }}>{d.bestScore}</span>
              <span className="text-xs font-bold" style={{ color }}>{d.label}</span>
            </button>
          );
        })}
      </div>
      {selected !== null && days[selected] && (
        <div className="glass-card px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{days[selected].dayName} best window</p>
            <p className="text-sm font-bold text-white">{days[selected].bestWindow}</p>
          </div>
          <p className="text-xs text-slate-500">{days[selected].icon} {days[selected].label}</p>
        </div>
      )}
    </div>
  );
}
