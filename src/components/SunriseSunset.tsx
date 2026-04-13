"use client";

import { useEffect, useState } from "react";

interface SunTimes { sunrise: Date; sunset: Date }

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

function calcSunTimes(lat: number, lon: number, date: Date): SunTimes | null {
  const D = getDayOfYear(date);
  const B = ((360 / 365) * (D - 81)) * (Math.PI / 180);
  const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  // Solar noon in UTC minutes from midnight
  const solarNoonUTC = 720 - 4 * lon - EoT;
  const dec = Math.asin(Math.sin(23.45 * Math.PI / 180) * Math.sin(B));
  const latRad = lat * (Math.PI / 180);
  const cosHA = (Math.cos(90.833 * Math.PI / 180) - Math.sin(latRad) * Math.sin(dec)) / (Math.cos(latRad) * Math.cos(dec));
  if (cosHA < -1 || cosHA > 1) return null;
  const HA_min = Math.acos(cosHA) * (180 / Math.PI) * 4;
  const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return {
    sunrise: new Date(utcMidnight + (solarNoonUTC - HA_min) * 60000),
    sunset: new Date(utcMidnight + (solarNoonUTC + HA_min) * 60000),
  };
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function fmtCountdown(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface Props { lat: number | null; lon: number | null }

export function SunriseSunset({ lat, lon }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const useLat = lat ?? 42.9634;
  const useLon = lon ?? -83.6875;
  const times = calcSunTimes(useLat, useLon, now);
  if (!times) return null;

  const { sunrise, sunset } = times;
  const nowMs = now.getTime();
  const sunriseMs = sunrise.getTime();
  const sunsetMs = sunset.getTime();
  const GOLDEN = 30 * 60000;

  // Determine phase
  const isBefore = nowMs < sunriseMs;
  const isDay = nowMs >= sunriseMs && nowMs < sunsetMs;
  const isGoldenMorning = isDay && nowMs < sunriseMs + GOLDEN;
  const isGoldenEvening = isDay && nowMs > sunsetMs - GOLDEN;
  const isGoldenHour = isGoldenMorning || isGoldenEvening;

  // Tomorrow sunrise if after sunset
  let label = "";
  let remaining = 0;
  let isSunrisePhase = false;
  if (isBefore) {
    label = "SUNRISE IN";
    remaining = sunriseMs - nowMs;
    isSunrisePhase = true;
  } else if (isDay) {
    label = "SUNSET IN";
    remaining = sunsetMs - nowMs;
    isSunrisePhase = false;
  } else {
    // After sunset — calc tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tmr = calcSunTimes(useLat, useLon, tomorrow);
    label = "SUNRISE TOMORROW IN";
    remaining = tmr ? tmr.sunrise.getTime() - nowMs : 0;
    isSunrisePhase = true;
  }

  const gradient = isSunrisePhase
    ? "from-yellow-500/20 via-orange-500/10 to-transparent"
    : "from-neon-pink/20 via-neon-purple/10 to-transparent";
  const textColor = isSunrisePhase ? "text-yellow-400" : "text-neon-pink";
  const subColor = isSunrisePhase ? "text-orange-300" : "text-neon-purple";

  return (
    <div className={`glass-card p-4 bg-gradient-to-r ${gradient}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-orbitron text-xs font-bold tracking-widest ${subColor} uppercase`}>{label}</p>
          <p className={`font-orbitron text-2xl font-bold tracking-wider ${textColor} mt-0.5`}>{fmtCountdown(remaining)}</p>
          <div className="flex gap-3 mt-1.5 text-xs text-slate-400">
            <span>🌅 {fmtTime(sunrise)}</span>
            <span>🌇 {fmtTime(sunset)}</span>
          </div>
        </div>
        <div className="text-right">
          {isGoldenHour ? (
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-yellow-400 font-orbitron">⚡ GOLDEN HOUR</p>
              <p className="text-xs text-slate-400">Best topwater &</p>
              <p className="text-xs text-slate-400">shallow bite window</p>
            </div>
          ) : isBefore && sunriseMs - nowMs <= GOLDEN ? (
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-yellow-400 font-orbitron">⚡ GOLDEN HOUR</p>
              <p className="text-xs text-slate-400">Rig up now —</p>
              <p className="text-xs text-slate-400">bite window opening</p>
            </div>
          ) : (
            <div className="text-2xl opacity-60">{isSunrisePhase ? "🌄" : "🌆"}</div>
          )}
        </div>
      </div>
    </div>
  );
}
