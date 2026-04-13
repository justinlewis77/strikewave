"use client";

import { useState } from "react";

interface Card { id: string; title: string; body: string; tip: string; icon: string }

const CARDS: Card[] = [
  {
    id: "spawn_triggers",
    icon: "🌡️",
    title: "Spawn Triggers",
    body: "Largemouth bass begin pre-spawn staging when water temps consistently reach 55–58°F in spring. Photoperiod (lengthening daylight) is the primary trigger, with temperature as the secondary activator. Females stage on structure in 8–15ft, then move to hard-bottom shallows (1–4ft) at 62–68°F to build beds. Cold snaps can pause the spawn but won't stop it — when temps rebound, fish resume where they left off.",
    tip: "When surface temp hits 58°F, target secondary points and channel swings at 8–12ft for staging fish.",
  },
  {
    id: "cold_metabolism",
    icon: "❄️",
    title: "Cold Water Metabolism",
    body: "Bass are cold-blooded — their metabolism directly mirrors water temperature. Below 50°F, digestion slows dramatically, they require far less food, and hold tight to bottom structure without chasing prey. Below 40°F they become nearly dormant. A bait moving fast through cold water looks unnatural and gets ignored. The fish are there, just unwilling to expend energy on a chase.",
    tip: "Under 50°F: dead-stick a Ned Rig, drop shot, or football jig with 5-10 second pauses. The bite is often just pressure on the line.",
  },
  {
    id: "pressure_bladder",
    icon: "📊",
    title: "Pressure & Swim Bladder",
    body: "The swim bladder regulates buoyancy by holding gas. Rapidly rising barometric pressure compresses the bladder, making it uncomfortable for bass to stay shallow — they go deeper and feed less aggressively. Falling pressure (incoming fronts) allows them to rise and roam, triggering aggressive feeding. Stable pressure means neutral, predictable behavior. A 48-hour flat pressure reading is often the best fishing condition.",
    tip: "Check pressure trend before leaving home. Falling = power baits and fast retrieves. Rising post-front = slow down, go 2–4ft deeper than normal, finesse only.",
  },
  {
    id: "structure_cover",
    icon: "🗺️",
    title: "Structure vs Cover",
    body: "Structure is the physical shape of the bottom: points, drops, humps, channel edges, depth transitions. Cover is anything resting on or near structure: weeds, docks, wood, rocks, lily pads. Bass use structure as a highway to navigate the lake and use cover as an ambush point. The highest-percentage spots are where both intersect — a dock on a point, a weed edge at a depth change, wood on a channel swing.",
    tip: "Don't just target cover. Ask why the cover is there. A laydown on a flat is mediocre. A laydown on a point at a 10ft-to-6ft transition holds fish all season.",
  },
  {
    id: "weed_oxygen",
    icon: "🌿",
    title: "Weed Oxygen Zones",
    body: "Healthy green milfoil and coontail produce oxygen through photosynthesis and attract baitfish, making them premium bass habitat. Dying brown weeds do the opposite — they consume oxygen as they decompose, creating dead zones that repel fish. In summer heat, bass suspend on the edge of healthy green growth at the oxygen-rich zone (typically 6–12ft in midwest lakes). The color of the weed tells you everything about its value.",
    tip: "In summer, always locate the last green weeds before they go brown. On Shinanguag, the north shore milfoil holds color longest — start there on hot days.",
  },
  {
    id: "shad_migration",
    icon: "🐟",
    title: "Shad Migration",
    body: "Shad are the primary forage base for largemouth in most midwest lakes. As surface temps drop below 65°F in fall, shad move from open water toward shallow coves, creek arms, and protected bays. Bass follow tightly. The migration compresses fish into smaller areas as weeds die back, creating some of the year's most explosive fishing. Schools of shad on the surface — dimpling water, birds diving — are your GPS to bass.",
    tip: "In fall, abandon summer deep-water spots. Drive the shoreline looking for shad activity before you fish. Match the hatch: chrome, white, or ghost patterns beat natural colors during shad schools.",
  },
  {
    id: "sight_lateral",
    icon: "👁️",
    title: "Sight vs Lateral Line",
    body: "In clear water, bass locate prey primarily by sight from up to 15ft away. Natural colors, subtle finesse action, and realistic profiles trigger their predatory instinct. In stained or muddy water, vision becomes limited and bass rely on the lateral line — sensory cells along their sides that detect pressure waves and vibration. Loud rattles, heavy vibration from blades, and chartreuse or white colors that contrast in low visibility become essential.",
    tip: "Water clarity determines your entire presentation. Clear = green pumpkin, natural brown, subtle action. Stained = white or chartreuse, spinnerbait, chatterbait. Muddy = Colorado blades, loud rattles, oversized profile.",
  },
  {
    id: "post_front",
    icon: "🌤️",
    title: "Post-Front Recovery",
    body: "Cold fronts that bring clear skies, dropping temps, and rising pressure kill the bite for 24–72 hours. The recovery happens in predictable stages. Day 1 post-front: nearly nothing, ultra-finesse presentations only may get a bite. Day 2: light biting resumes on slow presentations — drop shot, Ned Rig. Day 3: feeding returns to near-normal, aggressive patterns begin to work again. Patience and a refusal to leave the water often separates the angler who catches fish from the one who doesn't.",
    tip: "Day 1 after a cold front: fish the slowest, deepest finesse presentation you own. Don't burn reaction baits — you'll get skunked. By day 3, the fishing often turns excellent as fish aggressively refeed.",
  },
];

export function BiologyCards() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Bass Biology</p>
      {CARDS.map((card) => {
        const isOpen = open === card.id;
        return (
          <div key={card.id} className="glass-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3"
              onClick={() => setOpen(isOpen ? null : card.id)}
            >
              <div className="flex items-center gap-2">
                <span>{card.icon}</span>
                <span className="text-sm font-semibold text-white">{card.title}</span>
              </div>
              <span className="text-slate-500 text-xs">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                <p className="text-xs text-slate-300 leading-relaxed">{card.body}</p>
                <div className="bg-neon-cyan/6 border border-neon-cyan/15 rounded-lg px-3 py-2">
                  <span className="text-xs font-bold text-neon-cyan">Practical: </span>
                  <span className="text-xs text-slate-300">{card.tip}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
