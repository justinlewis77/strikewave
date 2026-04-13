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

export const LURE_TYPE_LABELS: Record<LureType, string> = {
  jig: "Jig",
  texas_rig: "Texas Rig",
  chatterbait: "Chatterbait",
  spinnerbait: "Spinnerbait",
  topwater: "Topwater",
  frog: "Frog",
  dropshot: "Drop Shot",
  shaky_head: "Shaky Head",
  neko_rig: "Neko Rig",
  wacky_rig: "Wacky Rig",
  swimbait_paddle: "Swimbait (Paddle)",
  swimbait_glide: "Swimbait (Glide)",
  diving_crank: "Diving Crankbait",
  squarebill: "Squarebill",
  lipless_crank: "Lipless Crankbait",
  ned_rig: "Ned Rig",
  carolina_rig: "Carolina Rig",
  fluke: "Fluke",
  buzzbait: "Buzzbait",
  underspun: "Underspin",
};

export type Season = "pre_spawn" | "spawn" | "post_spawn" | "summer" | "fall" | "winter";

export type WaterClarity = "clear" | "stained" | "muddy";

export type LineType = "fluorocarbon" | "monofilament" | "braid" | "braid_fluoro_leader";

export type RodPower = "ultralight" | "light" | "medium_light" | "medium" | "medium_heavy" | "heavy" | "extra_heavy";

export type RodAction = "fast" | "extra_fast" | "moderate_fast" | "moderate";

export type FishingMode = "shore" | "boat";

export type PressureTrend = "rising" | "falling" | "stable";

export interface RodSetup {
  id: string;
  name: string;
  rod_type: "baitcaster" | "spinning";
  rod_power: RodPower;
  rod_action: RodAction;
  line_type: LineType;
  line_lb: number;
  primary_lures: LureType[];
  rod_brand?: string;
  rod_model?: string;
  reel_brand?: string;
  reel_model?: string;
  gear_ratio?: string;
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
  pressure_trend?: PressureTrend;
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

export interface LakeProfile {
  lake_name?: string;
  water_type?: "lake" | "pond" | "river";
  typical_clarity?: WaterClarity;
  primary_cover?: Array<"weeds" | "docks" | "rocks" | "wood" | "lily_pads" | "open_water">;
  depth_profile?: "shallow" | "mid" | "deep" | "mixed";
}

export interface ConditionSnapshot {
  weather: WeatherConditions;
  solunar: SolunarData;
  season: Season;
  spawn_stage: SpawnStage;
  water_clarity: WaterClarity;
  fishing_mode: FishingMode;
  bank_facing_deg?: number;
  lake_profile?: LakeProfile;
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

export interface CatchEntry {
  id: string;
  date: string; // ISO date string
  time: string; // HH:MM
  lure_id?: string;
  lure_name: string;
  lure_color?: string;
  weight_lbs?: number;
  length_in?: number;
  location_note?: string;
  conditions?: {
    temp_f?: number;
    water_temp_f?: number;
    wind_mph?: number;
    spawn_stage?: SpawnStage;
  };
  fishing_mode: FishingMode;
}

export interface FishingSpot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: "shore" | "boat" | "structure" | "weed_edge";
  notes?: string;
  access_type?: "public" | "private" | "seasonal";
  parking_notes?: string;
  bank_condition?: "muddy" | "rocky" | "sandy" | "weedy" | "mixed";
  walkable_to?: string[];
}

export interface FishingReport {
  id: string;
  date: string;
  session_duration_hours?: number;
  fish_caught?: number;
  fish_landed?: number;
  best_lure_name?: string;
  best_lure_color?: string;
  water_clarity_observed?: WaterClarity;
  weed_growth?: "low" | "moderate" | "heavy";
  notes?: string;
  fishing_mode: FishingMode;
}

export interface AppSettings {
  location_lat?: number;
  location_lon?: number;
  location_name?: string;
  water_clarity: WaterClarity;
  use_gps: boolean;
  fishing_mode: FishingMode;
  notifications_enabled?: boolean;
  lake_profile?: LakeProfile;
  theme: "dark";
}
