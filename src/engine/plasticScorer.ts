import type { SoftPlastic, ConditionSnapshot } from "./types";

export interface PlasticScore {
  plastic: SoftPlastic;
  score: number;
  rig_suggestion: string;
  reason: string;
}

export function scoreSoftPlastics(
  plastics: SoftPlastic[],
  snap: ConditionSnapshot
): PlasticScore[] {
  const { weather, spawn_stage, water_clarity } = snap;
  const wt = weather.water_temp_f ?? 60;
  const cold = wt < 55;
  const warm = wt > 72;

  return plastics
    .map((p) => {
      let score = 0;
      let reason = "";
      let rig = "";

      if (p.style === "worm") {
        if (spawn_stage === "active_spawn" || spawn_stage === "late_pre_spawn") {
          score = 9; reason = "Worm on beds — all-time classic"; rig = "Texas rig / Wacky rig";
        } else if (cold) {
          score = 5; reason = "Finesse worm slow-roll in cold"; rig = "Shaky head / Ned rig";
        } else {
          score = 7; reason = "Worm works year-round"; rig = "Texas rig / Carolina rig";
        }
      }

      if (p.style === "creature") {
        if (spawn_stage === "early_pre_spawn" || spawn_stage === "late_pre_spawn") {
          score = 9; reason = "Creature bait flipping pre-spawn cover"; rig = "Texas rig / Jig trailer";
        } else {
          score = 6; reason = "Creature for punching and flipping"; rig = "Texas rig / Punch rig";
        }
      }

      if (p.style === "craw") {
        if (cold) {
          score = 8; reason = "Craw imitates lethargic crawfish in cold"; rig = "Jig trailer / Football jig";
        } else {
          score = 7; reason = "Craw trailer or jig complement"; rig = "Jig trailer / Texas rig";
        }
      }

      if (p.style === "swimbait") {
        if (warm) {
          score = 8; reason = "Paddle tail matches summer shad"; rig = "Swimbait hook / Underspin";
        } else if (spawn_stage === "fall_turnover") {
          score = 9; reason = "Swimbait = fall shad pattern"; rig = "Swimbait hook / Chatterbait trailer";
        } else {
          score = 6; reason = "Paddle tail versatile"; rig = "Swimbait hook";
        }
      }

      if (p.style === "tube") {
        if (water_clarity === "clear") {
          score = 7; reason = "Tube in clear water near rocks"; rig = "Tube jig head / Drop shot";
        } else {
          score = 5; reason = "Tube for rocky structure"; rig = "Tube jig head";
        }
      }

      if (p.style === "stick") {
        if (spawn_stage === "active_spawn") {
          score = 10; reason = "Stick bait on beds — best in class"; rig = "Wacky / Neko / Texas";
        } else if (spawn_stage === "post_spawn") {
          score = 8; reason = "Stick bait post-spawn recovery"; rig = "Wacky / Neko";
        } else {
          score = 6; reason = "Stick bait versatile finesse"; rig = "Wacky / Neko / Shaky head";
        }
      }

      if (p.style === "finesse") {
        if (cold || water_clarity === "clear") {
          score = 9; reason = "Finesse plastic for tough conditions"; rig = "Drop shot / Ned rig";
        } else {
          score = 6; reason = "Finesse for pressured bass"; rig = "Drop shot / Shaky head";
        }
      }

      return { plastic: p, score, rig_suggestion: rig, reason };
    })
    .sort((a, b) => b.score - a.score);
}
