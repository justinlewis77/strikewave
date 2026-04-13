"use client";

import type { ConditionSnapshot } from "@/engine/types";

function getTips(snap: ConditionSnapshot): string[] {
  const { spawn_stage, weather } = snap;
  const hour = new Date().getHours();
  const dawn = hour >= 5 && hour <= 8;
  const dusk = hour >= 18 && hour <= 21;
  const midday = hour >= 10 && hour <= 14;
  const cover = snap.lake_profile?.primary_cover ?? [];
  const hasWeeds = cover.includes("weeds") || cover.includes("lily_pads");
  const hasDocks = cover.includes("docks");
  const hasRocks = cover.includes("rocks");

  const tips: string[] = [];

  if (spawn_stage === "winter_pattern") {
    tips.push("Target the deepest available points and channel edges — bass are stacked 15–30ft");
    tips.push("Look for transitions: gravel to mud, hard bottom to soft. Bass sit on the seam");
    if (hasDocks) tips.push("Dock posts on deeper water are winter holding spots — slow jig or drop shot");
  } else if (spawn_stage === "early_pre_spawn") {
    tips.push("Fish transition zones: secondary points leading from deep wintering holes to spawning flats");
    if (hasWeeds) tips.push("Dying milfoil edges at 6–10ft — lipless crank ripped through");
    tips.push("North-facing banks warm first in afternoon sun — bass move up early");
  } else if (spawn_stage === "late_pre_spawn") {
    tips.push("Hard bottom coves with gravel or clay — bass scouting spawning sites");
    if (hasDocks) tips.push("Dock ends adjacent to spawning flats are loaded right now — any bait works");
    tips.push("Points that jut into deeper water: bass stack here before moving shallow");
  } else if (spawn_stage === "active_spawn") {
    tips.push("Look for pale circular beds in 1–4ft of clear water — polarized glasses required");
    if (hasWeeds) tips.push("Weed pockets and isolated grass clumps hold beds — bass tuck into cover");
    tips.push("Protected coves away from wind — calm water = best spawning conditions");
  } else if (spawn_stage === "post_spawn") {
    tips.push("First major weed edge outside spawning flat — females recover in cover");
    if (hasDocks) tips.push("Dock ends with deep water access: spent females hang here for days");
    tips.push((dawn || dusk) ? "Shad schools pushing into coves — follow the baitfish and bass are close" : "Submerged points at 6–10ft — scattered post-spawn fish staging before summer pattern");
  } else if (spawn_stage === "summer_pattern") {
    if (dawn || dusk) {
      tips.push("Weed edges and points at first/last light — topwater and chatterbait territory");
      if (hasWeeds) tips.push("Milfoil mat edges: bass push up to feed at low light, retreat underneath midday");
    } else if (midday) {
      tips.push(hasDocks ? "Shaded dock ends with 6ft+ water — bass suspending in shadow" : "Deepest available weed beds, 10–18ft thermocline depth");
      tips.push("Open water humps and offshore structure — use your electronics if on boat");
    } else {
      if (hasWeeds) tips.push("Milfoil mat edges and pockets — punch rigs, frogs work throughout summer");
      tips.push("Rocky points with weed growth: summer bass straddle both types of cover");
    }
  } else if (spawn_stage === "fall_turnover") {
    tips.push("Back of coves and flats with baitfish activity — bass chasing shad aggressively");
    tips.push("Wind-blown points and banks — baitfish get pushed there, bass follow");
    if (hasWeeds) tips.push("Dying milfoil edges: shad feed on decaying vegetation, bass feed on shad");
  }

  if (hasRocks && !["active_spawn", "winter_pattern"].includes(spawn_stage)) {
    tips.push("Rocky banks and rip-rap — bass use rocks as ambush points, squarebill is deadly here");
  }

  return tips.slice(0, 3);
}

export function StructureFinder({ snap }: { snap: ConditionSnapshot }) {
  const tips = getTips(snap);
  return (
    <div className="glass-card p-4 space-y-2">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Structure & Cover</p>
      <ul className="space-y-2">
        {tips.map((t, i) => (
          <li key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
            <span className="text-neon-cyan mt-0.5 flex-shrink-0">▸</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
