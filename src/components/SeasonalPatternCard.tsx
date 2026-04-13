"use client";

import { useState } from "react";
import type { SpawnStage } from "@/engine/types";

interface PatternInfo {
  title: string;
  emoji: string;
  biology: string;
  location: string;
  techniques: string[];
  tips: string[];
}

const PATTERNS: Record<SpawnStage, PatternInfo> = {
  winter_pattern: {
    title: "Winter",
    emoji: "❄️",
    biology: "Bass metabolism drops dramatically in cold water. They're lethargic, slow to strike, and holding tight to the deepest available structure to conserve energy. They school up — find one, find many.",
    location: "Deep main lake points, channel bends, submerged humps. Look for the last piece of structure before a deep basin — 18–30ft on most Midwest inland lakes.",
    techniques: ["Jig — drag slow, count your pauses", "Drop shot — dead stick, minimal movement", "Ned rig — tiny shakes, long pauses", "Underspin — slow roll near bottom"],
    tips: [
      "Downsize everything — 4\" max plastics",
      "Use 6–8lb fluoro for sensitivity in cold water",
      "Fish midday when water temps peak by 2–3°",
      "On Shinanguag: target the deeper dock rows on the east side",
      "Lipless cranks ripped through dying milfoil can trigger reaction bites even in cold water",
    ],
  },
  early_pre_spawn: {
    title: "Early Pre-Spawn",
    emoji: "🌡️",
    biology: "Water temps 48–58°F. Bass begin staging on transition zones between deep wintering areas and shallow spawning flats. They're actively feeding to build energy reserves — best feed of the year is coming.",
    location: "Secondary points, channel swings adjacent to spawning flats, dock pilings at 6–12ft. They move shallower on sunny afternoons.",
    techniques: ["Lipless crank — yo-yo through dying weeds", "Jig on transition points", "Spinnerbait on warming shallows", "Squarebill on rocky banks"],
    tips: [
      "Red colored baits — Red Eye Shad in red craw — are the classic call in early pre-spawn",
      "Fish warming coves and north-facing banks (get afternoon sun) first",
      "On Shinanguag: milfoil edges at 6–10ft as bass stage before spawning flats",
      "Slow down compared to summer — water is still cold, don't burn baits",
      "Chatterbait is starting to come alive — one of the best window-to-strike ratios of the year",
    ],
  },
  late_pre_spawn: {
    title: "Late Pre-Spawn",
    emoji: "🎣",
    biology: "Water temps 58–63°F. Bass are in full pre-spawn feeding mode — the most aggressive feed of the entire year. Big females moving into very shallow water to inspect spawning sites. Males staking out beds.",
    location: "1–6ft of water, hard bottom (gravel, sand, clay), near emerging vegetation, dock pilings, fallen timber.",
    techniques: ["Spinnerbait fan-cast on flats", "Squarebill ripped along banks", "Chatterbait through weed edges", "Lipless crank on flats", "Jig flipped to docks"],
    tips: [
      "THIS is the best week of the year on Midwest inland lakes — don't miss it",
      "Big females come up during warmest part of the day (11am–3pm)",
      "Match the hatch: shad patterns in clear water, chartreuse/white in stained",
      "Shore fisherman advantage: wade the shallows quietly and make long casts",
      "Soft plastics on lighter gear shine here — wacky Senko on anything you see",
    ],
  },
  active_spawn: {
    title: "Active Spawn",
    emoji: "🪺",
    biology: "Water 63–72°F. Bass on beds protecting eggs. Males are aggressive defenders; females are present but harder to trigger. This is sight fishing season — look for pale circular beds in 1–4ft.",
    location: "1–4ft hard bottom, sheltered from wind, near large cover. On Shinanguag: dock pockets, weed pockets, sandy coves.",
    techniques: ["Ned rig — cast to bed, let it sit", "Wacky Senko — slow fall over bed", "Neko rig — shaking in place", "Texas rig — flip to bed edge"],
    tips: [
      "Practice catch and release during spawn — bass need to guard eggs",
      "Target the male first (smaller), the female is usually nearby",
      "Persistence is key — drop the bait, don't move it. Wait them out",
      "Polarized sunglasses are mandatory — you need to see the beds",
      "Shore fishing advantage: you can see beds from the bank. Wade slowly.",
      "Finesse spinning gear on 6lb fluoro is ideal for this pattern",
    ],
  },
  post_spawn: {
    title: "Post-Spawn",
    emoji: "🐟",
    biology: "Bass recovering from spawn, 68–78°F water. Females move to first available cover to rest (deep weed edges, docks). Males may still be guarding fry in very shallow water. Feeding picks back up within 1–2 weeks.",
    location: "Females: first major drop-off outside spawning flat, dock ends. Fry-guarders: very shallow, thick cover. Recovered fish: any baitfish school.",
    techniques: ["Swimbait on weed edges", "Topwater near fry balls", "Shaky head for recovering fish", "Fluke on baitfish", "Drop shot on first drops"],
    tips: [
      "Don't give up on topwater — post-spawn fish attack poppers near fry balls",
      "Look for bass chasing shad to the surface in early morning",
      "On Shinanguag: coontail and milfoil edges are packed with post-spawn fish",
      "Frog is starting to be productive as vegetation grows in",
      "Fish can be scattered — move fast with moving baits to locate them",
    ],
  },
  summer_pattern: {
    title: "Summer",
    emoji: "☀️",
    biology: "Water over 75°F. Bass are metabolically active but seek comfort — early/late day feeding binges, midday retreat to shade, deep water, or thick vegetation. Thermocline develops; fish stack above it.",
    location: "Dawn/dusk: shallow flats, weed edges, topwater. Midday: docks with shade, deep weed beds, 12–18ft depth. Shinanguag: milfoil mats — big bass hiding underneath.",
    techniques: ["Topwater dawn/dusk — walk-the-dog", "Frog over milfoil mats", "Drop shot at 12–18ft midday", "Chatterbait on weed edges", "Deep jig on offshore structure"],
    tips: [
      "The first hour after sunrise is worth more than the entire midday — be on the water early",
      "Milfoil mats on Shinanguag hold big fish all summer — punch rigs and frogs",
      "When it's brutally hot: go deep with drop shot or come back at dusk",
      "Buzzbait parallel to weed edges at first light is criminally underused",
      "Shore fisherman: target docks with deep water access and shaded areas",
    ],
  },
  fall_turnover: {
    title: "Fall / Turnover",
    emoji: "🍂",
    biology: "Water cooling back through 65–50°F. Shad school up and move shallow chasing dying vegetation. Bass gorging before winter — eating everything in sight. Fall turnover (stratification break) creates a brief tough bite, then fishing explodes.",
    location: "Shallow flats with baitfish activity, back of coves, points adjacent to deeper water. Follow the shad — bass aren't far behind.",
    techniques: ["Lipless crank — burning over grass", "Chatterbait parallel to weed edges", "Spinnerbait on flats", "Topwater on calm mornings", "Swimbait to match shad"],
    tips: [
      "Fall is the most underrated season on Midwest lakes — fish it hard",
      "Match baitfish: chrome, shad patterns, white spinnerbaits",
      "During actual turnover (milky water, dead fish smell): tough bite — finesse the docks and just grind",
      "After turnover: some of the best fishing of the year for 3–4 weeks",
      "On Shinanguag: shad move into the milfoil as it dies back — run a lipless through the tops",
      "Shore fishing: the back end of coves fills with baitfish — easy access, great action",
    ],
  },
};

interface Props {
  spawn_stage: SpawnStage;
}

export function SeasonalPatternCard({ spawn_stage }: Props) {
  const [expanded, setExpanded] = useState(false);
  const info = PATTERNS[spawn_stage];

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{info.emoji}</span>
          <div>
            <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Pattern Guide</p>
            <p className="text-sm font-semibold text-white">{info.title}</p>
          </div>
        </div>
        <button onClick={() => setExpanded((v) => !v)} className="text-xs text-neon-cyan">
          {expanded ? "Less ▲" : "More ▼"}
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{info.biology}</p>

      {expanded && (
        <div className="space-y-3 border-t border-white/5 pt-3">
          <div>
            <p className="text-xs font-bold text-neon-cyan mb-1">📍 Where to Fish</p>
            <p className="text-xs text-slate-400 leading-relaxed">{info.location}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-neon-purple mb-1.5">🎣 Primary Techniques</p>
            <ul className="space-y-1">
              {info.techniques.map((t) => (
                <li key={t} className="text-xs text-slate-300 flex gap-1.5">
                  <span className="text-neon-purple mt-0.5">·</span>{t}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-neon-pink mb-1.5">💡 Midwest Angler Tips</p>
            <ul className="space-y-1">
              {info.tips.map((t) => (
                <li key={t} className="text-xs text-slate-300 flex gap-1.5">
                  <span className="text-neon-pink mt-0.5">·</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
