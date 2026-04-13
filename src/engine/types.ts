export type LureType =
  | "jig"
  | "texas_rig"
  | "chatterbait"
  | "spinnerbait"
  | "topwater"
  | "frog"
  | "dropshot"
  | "shaky_head"
  | "neko_rig"
  | "wacky_rig"
  | "swimbait_paddle"
  | "swimbait_glide"
  | "diving_crank"
  | "squarebill"
  | "lipless_crank"
  | "ned_rig"
  | "carolina_rig"
  | "fluke"
  | "buzzbait"
  | "underspun";

export type Season = "pre_spawn" | "spawn" | "post_spawn" | "summer" | "fall" | "winter";

export type WaterClarity = "clear" | "stained" | "muddy";

export type LineType = "fluorocarbon" | "monofilament" | "braid" | "braid_fluoro_leader";

export type RodPower = "ultralight" | "light" | "medium_light" | "medium" | "medium_heavy" | "heavy" | "extra_heavy";

export type RodAction = "fast" | "extra_fast" | "moderate_fast" | "moderate";

export interface RodSetup {
  id: string;
  name: string;
  rod_type: "baitcaster" | "spinning";
  rod_power: RodPower;
  rod_action: RodAction;
  line_type: LineType;
  line_lb: number;
  primary_lures: LureType[];
  // New gear fields
  rod_brand?: string;
  rod_model?: string;
  reel_brand?: string;
  reel_model?: string;
  gear_ratio?: string; // e.g. "7.3:1"
  lure_weight_min_oz?: number;
  lure_weight_max_oz?: number;
}

export interface Lure {
  id: string;
  name: string;
  type: LureType;
  weight_oz?: number;
  color?: string;
  brand?: string;
  notes?: string;
}

export interface SoftPlastic {
  id: string;
  name: string;
  brand?: string;
  length_in?: number;
  style: "creature" | "worm" | "craw" | "swimbait" | "tube" | "stick" | "finesse";
  color?: string;
  notes?: string;
}

export interface WeatherConditions {
  temp_f: number;
  water_temp_f: number | null;
  wind_mph: number;
  wind_dir_deg?: number;
  cloud_cover_pct: number;
  precip_mm: number;
  pressure_mb?: number;
  uv_index?: number;
  feels_like_f?: number;
  description?: string;
}

export interface SolunarData {
  moon_phase: number; // 0–1
  moon_phase_name: string;
  major_periods: [string, string][];
  minor_periods: [string, string][];
  solunar_score: number; // 0–1
}

export interface ConditionSnapshot {
  weather: WeatherConditions;
  solunar: SolunarData;
  season: Season;
  spawn_stage: SpawnStage;
  water_clarity: WaterClarity;
  timestamp: number;
  location?: { lat: number; lon: number };
}

export type SpawnStage =
  | "early_pre_spawn"
  | "late_pre_spawn"
  | "active_spawn"
  | "post_spawn"
  | "summer_pattern"
  | "fall_turnover"
  | "winter_pattern";

export interface LureScore {
  lure_type: LureType;
  score: number;
  reasons: string[];
  color_suggestion?: string;
  depth_suggestion?: string;
  retrieve_suggestion?: string;
}

export interface RodRecommendation {
  rod: RodSetup;
  lures: LureScore[];
  top_pick: LureScore;
}

export interface AppSettings {
  location_lat?: number;
  location_lon?: number;
  location_name?: string;
  water_clarity: WaterClarity;
  use_gps: boolean;
  pressure_trend?: "rising" | "falling" | "steady";
  theme: "dark";
}
