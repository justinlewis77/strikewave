"use client";

import { useState } from "react";
import type { SpawnStage } from "@/engine/types";

interface WeedStage {
  growth: string;
  position: string;
  presentations: string[];
  tips: string[];
}

const WEED_GUIDE: Record<SpawnStage, WeedStage> = {
  winter_pattern: {
    growth: "Milfoil and coontail mostly dormant, lying flat. Dead stalks create bottom clutter.",
    position: "Bass hold BELOW the weed mat on the hard bottom beneath it, or off the edge on adjacent structure.",
    presentations: ["Football jig dragged along bottom through dead grass", "Drop shot above the clutter layer", "Ned rig — tiny profile threads through dead stalks"],
    tips: ["Don't expect weed contact — fish below", "Dead milfoil edges at 8–15ft concentrate fish", "Coontail piles hold heat longer — start here"],
  },
  early_pre_spawn: {
    growth: "New milfoil tips beginning to emerge. Old growth still matted. Coontail greening up in shallower water.",
    position: "Bass moving up to weed edges at 5–10ft. First green coontail growth holds early staging fish.",
    presentations: ["Lipless crank ripped through top of emerging growth", "Spinnerbait slow-rolled along weed edge", "Jig hopped along outer edge of dead to green transition"],
    tips: ["Find the first new green growth — bass feel the change", "On Shinanguag: northeast coves green up first (protected + shallow)", "Weed tips emerging at 4–6ft is the magic zone"],
  },
  late_pre_spawn: {
    growth: "Milfoil growing actively, 2–4ft tall in shallower water. Coontail thick at 3–8ft depth.",
    position: "Bass using weed pockets and cuts as staging areas. Feeding aggressively on edges.",
    presentations: ["Chatterbait through weed pockets", "Texas rig flipped to isolated weed clumps", "Swimbaits along coontail edges"],
    tips: ["Look for isolated clumps away from main weed bed — staging fish sit there", "Wind-blown weed edges concentrate baitfish and bass", "Weed pocket + hard bottom inside = spawning staging ground"],
  },
  active_spawn: {
    growth: "Milfoil near peak in shallows. Coontail thick at 2–6ft. Lily pads beginning to surface.",
    position: "Bass using weed pockets as spawning sites. Males guard eggs in clearing near weed cover.",
    presentations: ["Wacky Senko dropped into pockets", "Ned rig on edge of beds in weeds", "Texas rig flipped tight to weed edge"],
    tips: ["Weed pockets with sand/gravel bottom inside = prime beds", "Isolated milfoil clumps in 2–4ft are overlooked bed spots", "Approach quietly — spawning bass spook easily in clear water"],
  },
  post_spawn: {
    growth: "Milfoil growing toward surface fast. Coontail forming thick mats. Lily pads present.",
    position: "Females recovering on first major weed edge. Fry-guarding males in very shallow weeds.",
    presentations: ["Swimbaits along weed wall", "Frog starting to work over emerging pads", "Drop shot on outside weed edge for recovered females"],
    tips: ["Weed edges at 6–10ft hold post-spawn females", "Frog bite is starting — any pad or mat over 1ft of water", "Coontail is thickest now — flipping starts to shine"],
  },
  summer_pattern: {
    growth: "Full milfoil canopy at surface in shallows. Thick coontail mats. Lily pads complete.",
    position: "Bass under milfoil mats during heat, on edges at dawn/dusk. Suspending inside coontail at thermocline depth.",
    presentations: ["Frog over milfoil mats — prime summer pattern", "Punching through thick mats with 1oz+ Texas rig", "Chatterbait along weed edges at dawn/dusk", "Drop shot outside weed wall at 10–16ft for midday fish"],
    tips: ["Best mat fishing is 10am–2pm when bass pushed deepest into cover", "Look for holes in milfoil mat — drop a wacky Senko in the hole", "Coontail: bass suspend 2ft above bottom inside the mat — drop shot depth is key", "On Shinanguag: north shore milfoil mats hold the biggest fish in summer"],
  },
  fall_turnover: {
    growth: "Milfoil dying back, going brown. Coontail still somewhat green. Lily pads dying.",
    position: "Bass chasing shad along dying weed edges. As weeds die, fish relocate to remaining green patches.",
    presentations: ["Lipless crank burned over dying milfoil tops", "Spinnerbait along last green coontail edges", "Swimbait matching shad color along weed walls"],
    tips: ["Follow the green — last remaining healthy weeds hold baitfish and bass", "Lipless through brown dying milfoil = fall staple on midwest lakes", "As temperature drops, weed edges compress — fish stack tighter", "On Shinanguag: shad push into coves as milfoil dies, bass follow"],
  },
};

export function SeasonalWeedGuide({ current_stage }: { current_stage: SpawnStage }) {
  const [open, setOpen] = useState<SpawnStage>(current_stage);
  const stages: SpawnStage[] = ["winter_pattern", "early_pre_spawn", "late_pre_spawn", "active_spawn", "post_spawn", "summer_pattern", "fall_turnover"];
  const labels: Record<SpawnStage, string> = {
    winter_pattern: "❄️ Winter", early_pre_spawn: "🌡️ Early Pre-Spawn", late_pre_spawn: "🎣 Late Pre-Spawn",
    active_spawn: "🪺 Spawn", post_spawn: "🐟 Post-Spawn", summer_pattern: "☀️ Summer", fall_turnover: "🍂 Fall",
  };

  return (
    <div className="space-y-2">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Milfoil & Coontail Guide</p>
      {stages.map((stage) => {
        const info = WEED_GUIDE[stage];
        const isOpen = open === stage;
        const isCurrent = stage === current_stage;
        return (
          <div key={stage} className={`glass-card overflow-hidden ${isCurrent ? "border-neon-cyan/30" : ""}`}>
            <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => setOpen(isOpen ? ("" as SpawnStage) : stage)}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{labels[stage]}</span>
                {isCurrent && <span className="text-xs bg-neon-cyan/20 text-neon-cyan px-1.5 py-0.5 rounded">NOW</span>}
              </div>
              <span className="text-slate-500 text-xs">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                <p className="text-xs text-slate-400">{info.growth}</p>
                <div>
                  <p className="text-xs font-bold text-neon-purple mb-1">Bass Position</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{info.position}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neon-cyan mb-1">Best Presentations</p>
                  <ul className="space-y-1">{info.presentations.map((p, i) => <li key={i} className="text-xs text-slate-300 flex gap-1.5"><span className="text-neon-cyan">·</span>{p}</li>)}</ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-neon-pink mb-1">Tips</p>
                  <ul className="space-y-1">{info.tips.map((t, i) => <li key={i} className="text-xs text-slate-300 flex gap-1.5"><span className="text-neon-pink">·</span>{t}</li>)}</ul>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
