export interface PlasticTip {
  style: string;
  rig: string;
  hook_size: string;
  weight: string;
  tip: string;
}

export const PLASTIC_TIPS: PlasticTip[] = [
  {
    style: "stick",
    rig: "Wacky",
    hook_size: "#1 or #1/0 wacky hook",
    weight: "None / nail weight 1/32 oz",
    tip: "Hook through center of bait. Use O-ring to extend bait life. Let it fall on slack line.",
  },
  {
    style: "stick",
    rig: "Neko",
    hook_size: "#1 or 1/0 neko hook",
    weight: "1/16–1/8 oz nail in nose",
    tip: "Nail weight in head end. Hook in center body. Shake in place — don't drag.",
  },
  {
    style: "worm",
    rig: "Texas",
    hook_size: "3/0–5/0 EWG",
    weight: "1/4–3/8 oz bullet",
    tip: "Peg weight in grass. Unpegged in open water for better fall. Slow drag on bottom.",
  },
  {
    style: "worm",
    rig: "Shaky Head",
    hook_size: "2/0 straight shank",
    weight: "3/16–1/4 oz head",
    tip: "Nose-hook the worm. Drag slowly and shake on pause. Deadly in cold water.",
  },
  {
    style: "creature",
    rig: "Punching",
    hook_size: "4/0–5/0 heavy EWG",
    weight: "1 oz+ tungsten",
    tip: "Heavy weight punches through thick mats. Set hook immediately on any resistance.",
  },
  {
    style: "craw",
    rig: "Jig Trailer",
    hook_size: "N/A (trailer)",
    weight: "With jig head",
    tip: "Match craw color to jig skirt. Trim claws shorter in cold water for subtle action.",
  },
  {
    style: "swimbait",
    rig: "Swimbait Hook",
    hook_size: "4/0–6/0 belly-weighted",
    weight: "1/4–1/2 oz",
    tip: "Steady retrieve — let the tail do the work. Speed up slightly near cover for reaction bite.",
  },
  {
    style: "tube",
    rig: "Internal Jig Head",
    hook_size: "2/0 internal head",
    weight: "3/16–3/8 oz",
    tip: "Insert jig head inside tube. Drag along rocky bottom or swim near suspended fish.",
  },
  {
    style: "finesse",
    rig: "Drop Shot",
    hook_size: "#1 or #2 drop shot hook",
    weight: "1/4 oz drop shot weight",
    tip: "Nose-hook or Palomar the hook. Keep 8–18 inch leader. Shake without moving the bait.",
  },
];

export function getTipsForStyle(style: string): PlasticTip[] {
  return PLASTIC_TIPS.filter((t) => t.style === style);
}
