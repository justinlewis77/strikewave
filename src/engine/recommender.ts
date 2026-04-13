import type { RodSetup, ConditionSnapshot, RodRecommendation, LureScore } from "./types";
import { ALL_LURE_TYPES, scoreLure } from "./scorer";
import { filterLuresForRod } from "./filter";

export function getRecommendations(
  rods: RodSetup[],
  snap: ConditionSnapshot
): RodRecommendation[] {
  return rods.map((rod) => {
    const validLures = filterLuresForRod(rod, ALL_LURE_TYPES);

    const scored: LureScore[] = validLures
      .map((lure) => scoreLure(lure, snap, rod.gear_ratio))
      .sort((a, b) => b.score - a.score);

    const top = scored[0] ?? {
      lure_type: rod.primary_lures[0] ?? "jig",
      score: 0,
      reasons: ["No strong conditions match — default pick"],
    };

    return { rod, lures: scored.slice(0, 5), top_pick: top };
  });
}

export function detectSpawnStage(waterTempF: number | null, month: number): import("./types").SpawnStage {
  const wt = waterTempF ?? 60;

  if (wt < 48 || month === 12 || month <= 2) return "winter_pattern";
  if (wt >= 48 && wt < 58) return "early_pre_spawn";
  if (wt >= 58 && wt < 63) return "late_pre_spawn";
  if (wt >= 63 && wt <= 72 && month >= 3 && month <= 6) return "active_spawn";
  if (wt > 68 && wt <= 78 && month >= 5 && month <= 7) return "post_spawn";
  if (wt > 75 || (month >= 6 && month <= 9)) return "summer_pattern";
  if (month >= 10 && month <= 11) return "fall_turnover";
  return "summer_pattern";
}

export function detectSeason(month: number): import("./types").Season {
  if (month <= 2 || month === 12) return "winter";
  if (month <= 4) return "pre_spawn";
  if (month <= 5) return "spawn";
  if (month <= 6) return "post_spawn";
  if (month <= 9) return "summer";
  return "fall";
}
