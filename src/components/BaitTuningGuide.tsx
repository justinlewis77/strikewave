"use client";

import { useState } from "react";
import type { SpawnStage, WaterClarity } from "@/engine/types";

interface Section { title: string; items: string[] }

function chatterbaitGuide(spawn_stage: SpawnStage, clarity: WaterClarity, wt: number): Section[] {
  const trailer = spawn_stage === "winter_pattern" || spawn_stage === "early_pre_spawn"
    ? "Small craw (Rage Tail Craw trimmed) — subtle action"
    : spawn_stage === "fall_turnover" ? "Paddle tail swimbait trailer (Keitech 3.3\") — shad match"
    : "Chunk or craw trailer for bulk and action";

  const blade = clarity === "muddy" ? "Colorado blade — more vibration" : clarity === "stained" ? "Willow-Colorado combo" : "Willow blade — less resistance, faster";
  const skirt = clarity === "muddy" ? "Black/Blue or Chartreuse skirt" : clarity === "clear" ? "White, Green Pumpkin, or Natural Shad" : "White or Green Pumpkin";
  const retrieve = wt < 55 ? "Slow roll near bottom with long pauses" : wt < 65 ? "Moderate with occasional deflection off cover" : "Steady rip with occasional kill/fall";

  return [
    { title: "Trailer", items: [trailer] },
    { title: "Blade Color", items: [blade] },
    { title: "Skirt Color", items: [skirt] },
    { title: "Retrieve by Temp", items: [retrieve] },
  ];
}

function liplessGuide(spawn_stage: SpawnStage, clarity: WaterClarity, wt: number): Section[] {
  const technique = wt < 50
    ? "Yo-yo through dying weeds: count down to grass depth, rip up, let fall on slack line"
    : wt < 60
    ? "Slow roll just above grass tops — contact triggers strikes"
    : spawn_stage === "fall_turnover"
    ? "Burn over dying grass — fast straight retrieve, bass react"
    : "Mid-speed steady retrieve, vary depth with countdown";

  const color = clarity === "muddy" ? "Chartreuse, Firetiger, or Hot Orange" : clarity === "stained" ? "Red Craw (spring), Citrus Shad (fall)" : "Chrome Blue, Natural Shad, Ghost";

  const weight = wt < 55 ? "1/2 oz or lighter — slower fall rate critical in cold" : "3/4 oz for distance and depth control";

  return [
    { title: "Technique", items: [technique] },
    { title: "Color by Clarity", items: [color] },
    { title: "Weight Selection", items: [weight] },
    { title: "Hook Upgrade", items: ["Replace trebles with premium VMC or Trokar — stock hooks are usually average"] },
  ];
}

export function BaitTuningGuide({ spawn_stage, clarity, wt }: { spawn_stage: SpawnStage; clarity: WaterClarity; wt: number }) {
  const [open, setOpen] = useState<"chatterbait" | "lipless" | null>(null);

  const baits = [
    { key: "chatterbait" as const, label: "Chatterbait Tuning", sections: chatterbaitGuide(spawn_stage, clarity, wt) },
    { key: "lipless" as const, label: "Lipless Crank Tuning", sections: liplessGuide(spawn_stage, clarity, wt) },
  ];

  return (
    <div className="space-y-2">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Bait Tuning Guide</p>
      {baits.map((b) => (
        <div key={b.key} className="glass-card overflow-hidden">
          <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => setOpen(open === b.key ? null : b.key)}>
            <span className="text-sm font-semibold text-white">{b.label}</span>
            <span className="text-slate-500 text-xs">{open === b.key ? "▲" : "▼"}</span>
          </button>
          {open === b.key && (
            <div className="px-4 pb-4 space-y-3 border-t border-white/5">
              {b.sections.map((s) => (
                <div key={s.title} className="pt-2">
                  <p className="text-xs font-bold text-neon-cyan mb-1">{s.title}</p>
                  {s.items.map((item, i) => (
                    <p key={i} className="text-xs text-slate-300 leading-relaxed">{item}</p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
