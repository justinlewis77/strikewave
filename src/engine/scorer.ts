import type { LureType, ConditionSnapshot, LureScore } from "./types";
import { getColorForLureType } from "./colorGuide";

export const ALL_LURE_TYPES: LureType[] = [
  "jig", "texas_rig", "chatterbait", "spinnerbait", "topwater", "frog",
  "dropshot", "shaky_head", "neko_rig", "wacky_rig", "swimbait_paddle",
  "swimbait_glide", "diving_crank", "squarebill", "lipless_crank",
  "ned_rig", "carolina_rig", "fluke", "buzzbait", "underspun",
];

interface ScoreAccumulator { score: number; reasons: string[]; }
function base(): ScoreAccumulator { return { score: 0, reasons: [] }; }
function add(acc: ScoreAccumulator, pts: number, reason: string) {
  acc.score += pts;
  if (reason) acc.reasons.push(reason);
}

export function parseGearRatio(ratio: string | undefined): number | null {
  if (!ratio) return null;
  const match = ratio.match(/^(\d+(?:\.\d+)?):1$/);
  return match ? parseFloat(match[1]) : null;
}

// Degrees between two compass bearings (0–180)
function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export function scoreLure(
  lure: LureType,
  snap: ConditionSnapshot,
  gearRatio?: string
): LureScore {
  const acc = base();
  const { weather, season, spawn_stage, water_clarity, solunar, fishing_mode, bank_facing_deg, lake_profile } = snap;
  const { temp_f, water_temp_f, wind_mph, wind_dir_deg, cloud_cover_pct, precip_mm, pressure_trend } = weather;
  const wt = water_temp_f ?? estimateWaterTemp(temp_f, season);
  const hour = new Date().getHours();
  const isDawn = hour >= 5 && hour <= 8;
  const isDusk = hour >= 18 && hour <= 21;
  const isNight = hour < 5 || hour > 21;
  const isMidDay = hour >= 10 && hour <= 14;
  const overcast = cloud_cover_pct > 60;
  const sunny = cloud_cover_pct < 30;
  const windy = wind_mph > 12;
  const calm = wind_mph < 6;
  const raining = precip_mm > 0.5;

  // ──────────────────────────────────────────────
  // WATER TEMPERATURE WINDOWS
  // ──────────────────────────────────────────────
  if (lure === "topwater" || lure === "buzzbait") {
    if (wt >= 75) add(acc, 5, `Peak topwater temp (${wt}°F)`);
    else if (wt >= 60) add(acc, 4, `Surface activity (${wt}°F)`);
    else add(acc, -4, `Too cold for surface (${wt}°F)`);
  }

  if (lure === "frog") {
    if (wt >= 65) add(acc, 4, `Frog temp window (${wt}°F)`);
    else add(acc, -3, `Water too cold for frog (${wt}°F)`);
  }

  if (lure === "dropshot" || lure === "ned_rig" || lure === "shaky_head") {
    if (wt < 50) add(acc, 5, `Finesse power in cold water (${wt}°F)`);
    else if (wt < 58) add(acc, 3, `Finesse effective (${wt}°F)`);
    else if (wt > 75 && isMidDay) add(acc, 2, "Finesse for pressured midday bass");
    else add(acc, 1, "Finesse always works");
  }

  if (lure === "diving_crank" || lure === "squarebill") {
    if (wt >= 55 && wt < 70) add(acc, 4, `Cranking prime temp (${wt}°F)`);
    else if (wt >= 70 && wt <= 82) add(acc, 2, `Cranking viable (${wt}°F)`);
    else if (wt < 55) add(acc, -2, "Cranking slow in cold water");
  }

  if (lure === "lipless_crank") {
    if (wt < 45) add(acc, -1, "Very cold — even lipless slows");
    else if (wt < 55) add(acc, 5, `Red lipless prime window — rip through dying weeds (${wt}°F)`);
    else if (wt < 62) add(acc, 4, `Lipless early spring staple (${wt}°F)`);
    else if (wt <= 75) add(acc, 2, "Lipless viable");
    else add(acc, 1, "Lipless works in warmth");
  }

  if (lure === "jig") {
    if (wt < 50) add(acc, 4, `Slow jig in cold water (${wt}°F)`);
    else if (wt < 65) add(acc, 3, "Pre-spawn jig prime");
    else add(acc, 2, "Jig year-round viable");
  }

  if (lure === "spinnerbait" || lure === "chatterbait") {
    if (wt >= 55 && wt <= 78) add(acc, 3, `Moving bait temp window (${wt}°F)`);
    else if (wt < 55) add(acc, -1, "Slow for moving baits in cold water");
  }

  if (lure === "swimbait_paddle" || lure === "swimbait_glide") {
    if (wt >= 58 && wt <= 80) add(acc, 3, `Swimbait temp window (${wt}°F)`);
    else if (wt < 50) add(acc, -2, "Too cold for swimbait");
  }

  if (lure === "texas_rig" || lure === "carolina_rig") {
    if (wt >= 55 && wt <= 80) add(acc, 3, `TX/CR prime temp (${wt}°F)`);
    else if (wt < 50) add(acc, 1, "TX rig slow but still works");
  }

  if (lure === "neko_rig" || lure === "wacky_rig" || lure === "fluke") {
    if (wt >= 60 && wt <= 80) add(acc, 3, `Light rig prime temp (${wt}°F)`);
    else if (wt < 55) add(acc, -1, "Light rigs struggle cold");
  }

  if (lure === "underspun") {
    if (wt >= 48 && wt <= 70) add(acc, 3, "Underspin cold/mild window");
    else add(acc, 1, "Underspin versatile");
  }

  // ──────────────────────────────────────────────
  // SPAWN STAGE
  // ──────────────────────────────────────────────
  if (spawn_stage === "early_pre_spawn") {
    if (lure === "lipless_crank") add(acc, 5, "Red lipless = early pre-spawn staple");
    if (lure === "jig") add(acc, 4, "Jig for pre-spawn staging bass");
    if (lure === "squarebill") add(acc, 3, "Squarebill for shallow warming flats");
    if (lure === "spinnerbait") add(acc, 3, "Spinnerbait for pre-spawn flats");
  }

  if (spawn_stage === "late_pre_spawn") {
    if (lure === "spinnerbait") add(acc, 4, "Late pre-spawn = spinnerbait prime");
    if (lure === "squarebill") add(acc, 4, "Squarebill for staging banks");
    if (lure === "jig") add(acc, 3, "Football jig on points");
    if (lure === "texas_rig") add(acc, 3, "Flipping pre-spawn cover");
    if (lure === "chatterbait") add(acc, 3, "Chatterbait pre-spawn reaction");
    if (lure === "lipless_crank") add(acc, 3, "Lipless still deadly late pre-spawn");
  }

  if (spawn_stage === "active_spawn") {
    if (lure === "ned_rig") add(acc, 5, "Ned on beds — high pressured bass");
    if (lure === "neko_rig") add(acc, 5, "Neko — spawn sight fishing staple");
    if (lure === "wacky_rig") add(acc, 5, "Wacky rig on beds");
    if (lure === "texas_rig") add(acc, 3, "Texas rig on beds");
    if (lure === "dropshot") add(acc, 3, "Dropshot for pressured spawners");
    if (lure === "topwater") add(acc, -2, "Topwater not best on beds");
  }

  if (spawn_stage === "post_spawn") {
    if (lure === "swimbait_paddle") add(acc, 4, "Post-spawn swimbaits for feeding fish");
    if (lure === "topwater") add(acc, 4, "Topwater for aggressive post-spawn bass");
    if (lure === "shaky_head") add(acc, 3, "Shaky head for recovery fish");
    if (lure === "dropshot") add(acc, 3, "Dropshot for scattered post-spawn bass");
    if (lure === "fluke") add(acc, 4, "Fluke for post-spawn baitfish patterns");
    if (lure === "chatterbait") add(acc, 3, "Chatterbait post-spawn shad pattern");
  }

  if (spawn_stage === "summer_pattern") {
    if (lure === "topwater") add(acc, 4, "Dawn/dusk topwater in summer");
    if (lure === "frog") add(acc, 4, "Frog for summer vegetation");
    if (lure === "dropshot") add(acc, 4, "Deep dropshot for summer bass");
    if (lure === "carolina_rig") add(acc, 3, "Carolina rig for summer deep structure");
    if (lure === "swimbait_glide") add(acc, 3, "Big glide for summer big bass");
    if (lure === "buzzbait") add(acc, 3, "Early morning buzzbait in summer");
    if (lure === "chatterbait") add(acc, 2, "Chatterbait near weed edges in summer");
  }

  if (spawn_stage === "fall_turnover") {
    if (lure === "lipless_crank") add(acc, 5, "Fall lipless — shad migration PRIME");
    if (lure === "chatterbait") add(acc, 4, "Chatterbait for fall reaction");
    if (lure === "spinnerbait") add(acc, 4, "Fall spinnerbait = shad pattern");
    if (lure === "squarebill") add(acc, 3, "Fall squarebill in shallows");
    if (lure === "swimbait_paddle") add(acc, 3, "Match fall shad with swimbait");
    if (lure === "topwater") add(acc, 3, "Fall morning topwater in shallows");
  }

  if (spawn_stage === "winter_pattern") {
    if (lure === "jig") add(acc, 5, "Winter jig — #1 cold water bait");
    if (lure === "dropshot") add(acc, 5, "Winter dropshot deep");
    if (lure === "ned_rig") add(acc, 4, "Ned rig for lethargic winter bass");
    if (lure === "underspun") add(acc, 4, "Underspin for cold suspended bass");
    if (lure === "carolina_rig") add(acc, 3, "Deep Carolina for winter points");
    if (lure === "lipless_crank") add(acc, 3, "Lipless slow-roll in winter grass");
    if (lure === "topwater") add(acc, -5, "Topwater in winter — avoid");
    if (lure === "frog") add(acc, -5, "Frog in winter — avoid");
    if (lure === "buzzbait") add(acc, -5, "Buzzbait in winter — avoid");
  }

  // ──────────────────────────────────────────────
  // LIGHT & CLOUD COVER
  // ──────────────────────────────────────────────
  if (overcast) {
    if (lure === "chatterbait") add(acc, 3, "Chatterbait shines on cloudy days");
    if (lure === "spinnerbait") add(acc, 3, "Spinnerbait in low light");
    if (lure === "topwater") add(acc, 2, "Overcast extends topwater window");
    if (lure === "frog") add(acc, 2, "Frog better in low light");
    if (lure === "squarebill") add(acc, 2, "Squarebill aggressive cloudy feed");
    if (lure === "buzzbait") add(acc, 2, "Buzzbait in cloud cover");
    if (lure === "lipless_crank") add(acc, 2, "Lipless reaction bite on cloudy");
    if (lure === "dropshot") add(acc, -1, "Dropshot less needed when cloudy");
  }

  if (sunny && isMidDay) {
    if (lure === "dropshot") add(acc, 3, "Sunny midday = finesse time");
    if (lure === "ned_rig") add(acc, 3, "Sunny pressure = ned rig");
    if (lure === "shaky_head") add(acc, 2, "Shaky head for sunny pressured bass");
    if (lure === "neko_rig") add(acc, 2, "Neko for clear sunny conditions");
    if (lure === "topwater") add(acc, -3, "Avoid topwater sunny midday");
    if (lure === "chatterbait") add(acc, -2, "Chatterbait less effective sunny midday");
  }

  if (isDawn || isDusk) {
    if (lure === "topwater") add(acc, 5, "Prime topwater window");
    if (lure === "buzzbait") add(acc, 4, "Buzzbait dawn/dusk prime");
    if (lure === "frog") add(acc, 3, "Frog prime — low light");
    if (lure === "chatterbait") add(acc, 2, "Chatterbait dawn feed");
    if (lure === "spinnerbait") add(acc, 2, "Spinnerbait low light bonus");
    if (lure === "lipless_crank") add(acc, 2, "Lipless dawn/dusk reaction bite");
  }

  if (isNight) {
    if (lure === "topwater") add(acc, 4, "Night topwater for big fish");
    if (lure === "jig") add(acc, 4, "Night jig for big summer bass");
    if (lure === "frog") add(acc, 3, "Night frogging");
    if (lure === "spinnerbait") add(acc, 2, "Night spinnerbait");
    if (lure === "dropshot") add(acc, -2, "Dropshot less effective at night");
  }

  // ──────────────────────────────────────────────
  // WIND
  // ──────────────────────────────────────────────
  if (windy) {
    if (lure === "chatterbait") add(acc, 3, "Chatterbait dominates wind");
    if (lure === "spinnerbait") add(acc, 3, "Spinnerbait in wind — bladed bait");
    if (lure === "squarebill") add(acc, 2, "Wind moves squarebill naturally");
    if (lure === "lipless_crank") add(acc, 2, "Lipless reaction in windswept points");
    if (lure === "topwater") add(acc, -2, "Choppy surface hurts topwater");
    if (lure === "dropshot") add(acc, -2, "Wind hurts dropshot feel");
    if (lure === "ned_rig") add(acc, -2, "Wind makes ned hard to feel");
  }

  if (calm) {
    if (lure === "topwater") add(acc, 2, "Glass water = ideal topwater");
    if (lure === "dropshot") add(acc, 2, "Calm water enhances finesse");
    if (lure === "neko_rig") add(acc, 1, "Calm = better neko action");
  }

  // ──────────────────────────────────────────────
  // WIND DIRECTION + BANK FACING (onshore wind)
  // ──────────────────────────────────────────────
  if (wind_dir_deg !== undefined && bank_facing_deg !== undefined && windy) {
    // Wind blows FROM wind_dir_deg. If wind blows toward the bank, it's onshore.
    // Onshore when wind direction is within 60° of bank_facing_deg
    const diff = angleDiff(wind_dir_deg, bank_facing_deg);
    if (diff <= 60) {
      if (["chatterbait", "spinnerbait", "lipless_crank"].includes(lure)) {
        add(acc, 2, "Onshore wind pushes bait to your bank — moving baits shine");
      }
    }
  }

  // ──────────────────────────────────────────────
  // WATER CLARITY
  // ──────────────────────────────────────────────
  if (water_clarity === "muddy") {
    if (lure === "chatterbait") add(acc, 3, "Chatterbait vibration in muddy water");
    if (lure === "spinnerbait") add(acc, 3, "Colorado blade displaces water in mud");
    if (lure === "lipless_crank") add(acc, 2, "Lipless rattle in muddy water");
    if (lure === "jig") add(acc, 2, "Big jig visible in mud");
    if (lure === "topwater") add(acc, -2, "Muddy water hides topwater");
    if (lure === "dropshot") add(acc, -3, "Dropshot ineffective in muddy water");
    if (lure === "ned_rig") add(acc, -3, "Ned rig wasted in muddy water");
    if (lure === "neko_rig") add(acc, -2, "Neko poor in muddy conditions");
  }

  if (water_clarity === "stained") {
    if (["chatterbait", "spinnerbait", "lipless_crank"].includes(lure)) add(acc, 1, "High-vibration bait in stained water");
  }

  if (water_clarity === "clear") {
    if (lure === "dropshot") add(acc, 2, "Finesse shines in clear water");
    if (lure === "ned_rig") add(acc, 2, "Ned visible in clear water");
    if (lure === "neko_rig") add(acc, 2, "Neko action visible in clear");
    if (lure === "swimbait_glide") add(acc, 3, "Glide bait in clear — big bass");
    if (lure === "fluke") add(acc, 2, "Fluke natural in clear water");
    if (["ned_rig", "dropshot", "wacky_rig", "neko_rig"].includes(lure)) add(acc, 1, "Natural presentations excel in clear water");
    if (lure === "chatterbait") add(acc, -1, "Chatterbait less needed in clear");
  }

  // ──────────────────────────────────────────────
  // LAKE COVER PROFILE
  // ──────────────────────────────────────────────
  const cover = lake_profile?.primary_cover ?? [];
  if (cover.includes("weeds") || cover.includes("lily_pads")) {
    if (lure === "frog") add(acc, 2, "Weedy lake — frog is at home");
    if (lure === "chatterbait") add(acc, 1, "Chatterbait around weed edges");
    if (lure === "texas_rig") add(acc, 1, "Texas rig punches through weeds");
  }
  if (cover.includes("docks")) {
    if (lure === "shaky_head") add(acc, 1, "Shaky head skips under docks");
    if (lure === "ned_rig") add(acc, 1, "Ned rig under docks");
    if (lure === "squarebill") add(acc, 1, "Squarebill along dock edges");
  }
  if (cover.includes("rocks")) {
    if (lure === "jig") add(acc, 1, "Jig on rocky banks");
    if (lure === "squarebill") add(acc, 1, "Squarebill deflects off rocks");
    if (lure === "ned_rig") add(acc, 1, "Ned on rocky bottoms");
  }
  if (cover.includes("wood")) {
    if (lure === "jig") add(acc, 2, "Jig in timber — classic combo");
    if (lure === "texas_rig") add(acc, 1, "Texas rig through wood piles");
  }

  // ──────────────────────────────────────────────
  // FISHING MODE — SHORE vs BOAT
  // ──────────────────────────────────────────────
  if (fishing_mode === "shore") {
    if (lure === "carolina_rig") add(acc, -2, "Carolina rig awkward from shore");
    if (lure === "swimbait_glide") add(acc, -1, "Big glide baits better from boat");
    if (lure === "lipless_crank") add(acc, 1, "Lipless crank — great shore cast");
    if (lure === "chatterbait") add(acc, 1, "Chatterbait — easy to work from shore");
    if (lure === "spinnerbait") add(acc, 1, "Spinnerbait — versatile shore bait");
    if (lure === "topwater") add(acc, 1, "Topwater — shore access prime spots");
  }

  if (fishing_mode === "boat") {
    if (lure === "carolina_rig") add(acc, 1, "Carolina rig — better boat control");
    if (lure === "swimbait_glide") add(acc, 1, "Glide bait from boat for big bass");
    if (lure === "dropshot") add(acc, 1, "Dropshot — vertical from boat");
  }

  // ──────────────────────────────────────────────
  // PRESSURE TREND (Barometric)
  // ──────────────────────────────────────────────
  if (pressure_trend === "falling") {
    if (["chatterbait", "topwater", "spinnerbait", "squarebill", "buzzbait"].includes(lure)) {
      add(acc, 2, "Falling pressure pre-storm — aggressive bite on");
    }
    if (lure === "lipless_crank") add(acc, 2, "Falling pressure — reaction bite fires up");
  }

  if (pressure_trend === "rising") {
    if (["ned_rig", "dropshot", "wacky_rig", "shaky_head"].includes(lure)) {
      add(acc, 3, "Rising pressure post-front — finesse is your best bet");
    }
    if (lure === "topwater") add(acc, -2, "Post-front high pressure — topwater struggles");
    if (lure === "chatterbait") add(acc, -1, "Post-front bass tighten up — slow down");
  }

  // stable pressure = no modifier

  // ──────────────────────────────────────────────
  // SOLUNAR
  // ──────────────────────────────────────────────
  if (solunar.solunar_score > 0.7) {
    if (lure === "topwater") add(acc, 2, "High solunar — surface bite on");
    if (lure === "chatterbait") add(acc, 2, "Moon peak = active feeders");
    if (lure === "spinnerbait") add(acc, 2, "Moon peak = moving bait time");
    if (lure === "buzzbait") add(acc, 2, "Solunar peak — wake baits shine");
  }

  // ──────────────────────────────────────────────
  // RAIN
  // ──────────────────────────────────────────────
  if (raining) {
    if (lure === "chatterbait") add(acc, 3, "Rain = reaction bite on");
    if (lure === "spinnerbait") add(acc, 2, "Spinnerbait in rain runoff");
    if (lure === "squarebill") add(acc, 2, "Squarebill in runoff channels");
    if (lure === "topwater") add(acc, 1, "Rain dimples help topwater");
    if (lure === "lipless_crank") add(acc, 2, "Lipless in rain — reaction killer");
    if (lure === "dropshot") add(acc, -1, "Rain makes finesse harder");
  }

  // ──────────────────────────────────────────────
  // GEAR RATIO
  // ──────────────────────────────────────────────
  const ratio = parseGearRatio(gearRatio);
  if (ratio !== null) {
    if (ratio >= 7.1 && ["chatterbait", "spinnerbait", "topwater", "frog", "buzzbait"].includes(lure)) {
      add(acc, 1, `High gear ratio (${gearRatio}) suits this fast bait`);
    } else if (ratio <= 6.2 && ["diving_crank", "swimbait_paddle", "jig"].includes(lure)) {
      add(acc, 1, `Low gear ratio (${gearRatio}) perfect for this presentation`);
    }
  }

  const color_suggestion = getColorForLureType(lure, water_clarity, weather);
  const depth_suggestion = getDepthSuggestion(lure, wt, spawn_stage);
  const retrieve_suggestion = getRetrieveSuggestion(lure, wt, windy);

  return {
    lure_type: lure,
    score: Math.max(0, acc.score),
    reasons: acc.reasons,
    color_suggestion,
    depth_suggestion,
    retrieve_suggestion,
  };
}

function estimateWaterTemp(air_f: number, season: string): number {
  const offsets: Record<string, number> = {
    pre_spawn: -8, spawn: -5, post_spawn: -3, summer: 2, fall: -2, winter: -12,
  };
  return air_f + (offsets[season] ?? -5);
}

function getDepthSuggestion(lure: string, wt: number, spawn_stage: string): string {
  if (["jig", "dropshot", "carolina_rig", "ned_rig"].includes(lure)) {
    if (wt < 50 || spawn_stage === "winter_pattern") return "15–30 ft (deep wintering)";
    if (wt < 60) return "8–18 ft (staging ledges)";
    return "4–12 ft";
  }
  if (["topwater", "frog", "buzzbait"].includes(lure)) return "Surface / 0–2 ft";
  if (["squarebill", "spinnerbait", "chatterbait"].includes(lure)) return "2–6 ft (shallow cover)";
  if (lure === "diving_crank") return "8–15 ft";
  if (lure === "swimbait_glide") return "5–20 ft";
  if (lure === "lipless_crank") return "2–8 ft (count down to depth)";
  return "2–10 ft";
}

function getRetrieveSuggestion(lure: string, wt: number, windy: boolean): string {
  const slow = wt < 55;
  if (lure === "jig") return slow ? "Slow drag, long pauses" : "Swim or hop";
  if (lure === "lipless_crank") return slow ? "Yo-yo through dying weeds" : "Steady medium reel";
  if (lure === "squarebill" || lure === "diving_crank") return slow ? "Slow roll, pause on contact" : "Medium steady";
  if (lure === "chatterbait") return windy ? "Steady reel into wind" : "Moderate with pauses";
  if (lure === "spinnerbait") return slow ? "Slow roll near bottom" : "Medium burn";
  if (lure === "topwater") return "Walk-the-dog or pop-pause";
  if (lure === "frog") return "Walk, pause over pads";
  if (lure === "dropshot") return "Shake in place, minimal movement";
  if (lure === "ned_rig") return slow ? "Dead stick with tiny shakes" : "Slow drag and hop";
  if (lure === "texas_rig") return slow ? "Slow drag" : "Hop and fall";
  if (lure === "swimbait_paddle") return "Steady medium with occasional pause";
  if (lure === "swimbait_glide") return "Glide, pause, twitch";
  if (lure === "carolina_rig") return "Slow drag along bottom";
  if (lure === "fluke") return "Twitch-twitch-pause";
  if (lure === "buzzbait") return "Steady reel just fast enough to stay up";
  if (lure === "underspun") return slow ? "Slow roll near bottom" : "Hover and swim";
  return "Vary retrieve until you find the pattern";
}
