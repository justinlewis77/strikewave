import type { WaterClarity, WeatherConditions } from "./types";

export type ColorProfile = "shad" | "natural" | "dark" | "reaction" | "chartreuse" | "red";

interface ColorSuggestion {
  profile: ColorProfile;
  examples: string[];
  reason: string;
}

export function getColorSuggestion(
  water_clarity: WaterClarity,
  weather: WeatherConditions
): ColorSuggestion {
  const { cloud_cover_pct, water_temp_f } = weather;
  const overcast = cloud_cover_pct > 60;
  const coldWater = (water_temp_f ?? 60) < 55;

  if (water_clarity === "muddy") {
    if (overcast) {
      return {
        profile: "dark",
        examples: ["Black/Blue", "Junebug", "Dark Pumpkin"],
        reason: "Dark silhouette in muddy water with low light",
      };
    }
    return {
      profile: "chartreuse",
      examples: ["Chartreuse/White", "Firetiger", "Hot Pink"],
      reason: "High-visibility reaction colors in muddy water",
    };
  }

  if (water_clarity === "stained") {
    if (overcast || coldWater) {
      return {
        profile: "dark",
        examples: ["Black/Blue Flake", "Green Pumpkin", "Watermelon Seed"],
        reason: "Natural dark tones in stained water with limited light",
      };
    }
    return {
      profile: "natural",
      examples: ["Green Pumpkin", "Watermelon Red", "Oxblood"],
      reason: "Natural tones visible in stained water",
    };
  }

  // Clear water
  if (overcast) {
    return {
      profile: "shad",
      examples: ["Ghost", "Sexy Shad", "Silver/Blue"],
      reason: "Shad colors in clear water under overcast sky",
    };
  }
  if (coldWater) {
    return {
      profile: "natural",
      examples: ["Green Pumpkin", "Smoke/Silver", "Natural Crawfish"],
      reason: "Subtle natural tones in clear cold water",
    };
  }
  return {
    profile: "reaction",
    examples: ["Chrome", "White/Silver", "Bone"],
    reason: "Reaction colors in clear sunny water — match the hatch",
  };
}

export function getColorForLureType(
  lureType: string,
  water_clarity: WaterClarity,
  weather: WeatherConditions
): string {
  const base = getColorSuggestion(water_clarity, weather);

  // Override for topwater in morning/evening
  if (lureType === "topwater" || lureType === "frog" || lureType === "buzzbait") {
    if (weather.cloud_cover_pct > 70) return "Black / Dark Frog";
    return "White / Bone / Natural";
  }

  if (lureType === "lipless_crank") {
    return "Red Crawfish (early spring) / Chrome (summer)";
  }

  return base.examples[0];
}
