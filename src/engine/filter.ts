import type { RodSetup, LureType } from "./types";
import { parseGearRatio } from "./scorer";

/**
 * Given a rod setup, returns the lure types that are valid for it.
 * Filters by: primary_lures list, rod power, rod action, line type.
 */
export function filterLuresForRod(rod: RodSetup, lureTypes: LureType[]): LureType[] {
  return lureTypes.filter((lure) => {
    // If primary_lures is set, only allow those
    if (rod.primary_lures.length > 0 && !rod.primary_lures.includes(lure)) {
      return false;
    }

    // Rod type hard gates
    if (rod.rod_type === "spinning") {
      const baitcasterOnly: LureType[] = ["chatterbait", "spinnerbait", "frog", "swimbait_glide", "buzzbait"];
      if (baitcasterOnly.includes(lure)) return false;
    }

    if (rod.rod_type === "baitcaster") {
      const spinningOnly: LureType[] = ["dropshot", "ned_rig", "neko_rig", "wacky_rig", "underspun"];
      // Allow on heavy baitcasters if explicitly listed
      if (spinningOnly.includes(lure) && !rod.primary_lures.includes(lure)) return false;
    }

    // Power gates
    if ((rod.rod_power === "ultralight" || rod.rod_power === "light") &&
      ["jig", "chatterbait", "spinnerbait", "texas_rig", "carolina_rig", "frog", "swimbait_glide"].includes(lure)) {
      return false;
    }

    if ((rod.rod_power === "heavy" || rod.rod_power === "extra_heavy") &&
      ["dropshot", "ned_rig", "neko_rig", "wacky_rig", "underspun"].includes(lure)) {
      return false;
    }

    return true;
  });
}

/**
 * Returns gear ratio bonus/penalty notes for a given lure type.
 * Actual score modifier is in scorer.ts.
 */
export function gearRatioNote(rod: RodSetup, lure: LureType): string | null {
  const ratio = parseGearRatio(rod.gear_ratio);
  if (!ratio) return null;

  if (ratio >= 7.1 && ["chatterbait", "spinnerbait", "topwater", "frog", "buzzbait"].includes(lure)) {
    return `${rod.gear_ratio} high-speed reel ideal for quick presentations`;
  }
  if (ratio <= 6.2 && ["diving_crank", "swimbait_paddle", "jig"].includes(lure)) {
    return `${rod.gear_ratio} power reel perfect for slow rolling`;
  }
  return null;
}
