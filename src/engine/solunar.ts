import type { SolunarData } from "./types";

function getMoonPhase(date: Date): number {
  // Days since known new moon (Jan 6, 2000)
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");
  const lunarCycle = 29.53058867;
  const diff = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((diff % lunarCycle) + lunarCycle) % lunarCycle;
  return phase / lunarCycle; // 0–1
}

function getPhaseName(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return "New Moon";
  if (phase < 0.22) return "Waxing Crescent";
  if (phase < 0.28) return "First Quarter";
  if (phase < 0.47) return "Waxing Gibbous";
  if (phase < 0.53) return "Full Moon";
  if (phase < 0.72) return "Waning Gibbous";
  if (phase < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

function getSolunarScore(phase: number): number {
  // New moon and full moon = peak activity
  const distFromNew = Math.min(phase, 1 - phase);
  const distFromFull = Math.abs(phase - 0.5);
  const moonBonus = 1 - Math.min(distFromNew, distFromFull) * 4;
  return Math.max(0, Math.min(1, moonBonus));
}

function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60 * 1000);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function calculateSolunar(date: Date = new Date()): SolunarData {
  const phase = getMoonPhase(date);

  // Approximate transit times based on phase offset from midnight
  const moonTransitHour = (phase * 24 + 12) % 24;
  const transit = new Date(date);
  transit.setHours(Math.floor(moonTransitHour), (moonTransitHour % 1) * 60, 0, 0);

  const opposing = addMinutes(transit, 12 * 60);

  // Major periods: 2hr windows around transit and opposing
  const major_periods: [string, string][] = [
    [formatTime(addMinutes(transit, -60)), formatTime(addMinutes(transit, 60))],
    [formatTime(addMinutes(opposing, -60)), formatTime(addMinutes(opposing, 60))],
  ];

  // Minor periods: 1hr windows 6hr offset
  const minor1 = addMinutes(transit, 6 * 60);
  const minor2 = addMinutes(transit, -6 * 60);
  const minor_periods: [string, string][] = [
    [formatTime(addMinutes(minor1, -30)), formatTime(addMinutes(minor1, 30))],
    [formatTime(addMinutes(minor2, -30)), formatTime(addMinutes(minor2, 30))],
  ];

  return {
    moon_phase: phase,
    moon_phase_name: getPhaseName(phase),
    major_periods,
    minor_periods,
    solunar_score: getSolunarScore(phase),
  };
}
