"use client";

import { useState } from "react";
import type { LureType } from "@/engine/types";

interface Knot {
  name: string;
  bestFor: string;
  lureTypes: LureType[];
  steps: string[];
}

const KNOTS: Knot[] = [
  {
    name: "Palomar",
    bestFor: "Braided line, drop shot, any terminal tackle. Strongest knot for most situations.",
    lureTypes: ["dropshot", "ned_rig", "texas_rig", "jig", "chatterbait", "spinnerbait", "frog"],
    steps: [
      "Double 6 inches of line and pass the loop through the eye",
      "Tie a loose overhand knot with the doubled line",
      "Pass the loop over the hook/lure",
      "Pull both tag end and main line tight",
      "Clip tag end close",
    ],
  },
  {
    name: "Improved Clinch",
    bestFor: "Monofilament and fluorocarbon. Great for cranks, swimbaits, any hard bait.",
    lureTypes: ["diving_crank", "squarebill", "lipless_crank", "swimbait_paddle", "topwater", "fluke"],
    steps: [
      "Pass 6 inches of line through the eye",
      "Wrap the tag end around main line 5–7 times",
      "Pass tag end through the loop near the eye",
      "Pass tag end through the large loop just created",
      "Wet and pull tight, trim tag end",
    ],
  },
  {
    name: "Loop Knot (Non-Slip)",
    bestFor: "Topwater, jerkbaits, and frogs where free movement improves action.",
    lureTypes: ["topwater", "frog", "buzzbait", "swimbait_glide", "fluke"],
    steps: [
      "Make an overhand knot in the line about 8 inches from end — don't close it",
      "Pass tag end through the lure eye",
      "Pass tag end back through the overhand knot",
      "Wrap tag end around main line 4–6 times",
      "Pass tag end back through overhand knot, pull tight",
    ],
  },
  {
    name: "Alberto Knot",
    bestFor: "Braid to fluorocarbon leader connection. Essential for spinning finesse setups.",
    lureTypes: ["dropshot", "ned_rig", "neko_rig", "wacky_rig", "shaky_head", "underspun"],
    steps: [
      "Double 8 inches of fluoro into a loop",
      "Pass braid through the loop and wrap toward the closed end 7–8 times",
      "Reverse direction, wrap back toward the open end 7–8 times",
      "Pass braid tag end through the fluoro loop",
      "Wet and pull both lines to tighten evenly",
    ],
  },
  {
    name: "Uni Knot",
    bestFor: "All-purpose. Good for attaching line to reel, connecting two lines, jigs.",
    lureTypes: ["jig", "carolina_rig", "texas_rig", "wacky_rig"],
    steps: [
      "Pass line through eye, double back parallel to main line",
      "Form a loop by crossing tag end over both lines",
      "Wrap tag end around both lines through the loop 4–6 times",
      "Pull tag end to tighten coils",
      "Slide knot to eye of hook, trim tag end",
    ],
  },
];

export function KnotGuide({ currentLure }: { currentLure?: LureType }) {
  const [open, setOpen] = useState<string | null>(null);

  const recommended = currentLure ? KNOTS.find((k) => k.lureTypes.includes(currentLure)) : null;

  return (
    <div className="space-y-2">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Knot Guide</p>
      {recommended && (
        <div className="px-3 py-2 rounded-lg bg-neon-pink/10 border border-neon-pink/20 text-xs text-neon-pink">
          Recommended for current lure: <strong>{recommended.name}</strong>
        </div>
      )}
      {KNOTS.map((k) => {
        const isOpen = open === k.name;
        const isRec = recommended?.name === k.name;
        return (
          <div key={k.name} className={`glass-card overflow-hidden transition-all ${isRec ? "border-neon-pink/30" : ""}`}>
            <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => setOpen(isOpen ? null : k.name)}>
              <div className="flex items-center gap-2">
                {isRec && <span className="text-xs bg-neon-pink/20 text-neon-pink px-1.5 py-0.5 rounded font-bold">★</span>}
                <span className="text-sm font-semibold text-white">{k.name}</span>
              </div>
              <span className="text-slate-500 text-xs">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                <p className="text-xs text-slate-400 pt-2">{k.bestFor}</p>
                <ol className="space-y-1.5">
                  {k.steps.map((s, i) => (
                    <li key={i} className="text-xs text-slate-300 flex gap-2">
                      <span className="text-neon-cyan font-bold flex-shrink-0">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
