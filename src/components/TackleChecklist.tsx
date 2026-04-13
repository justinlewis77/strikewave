"use client";

import { useState, useEffect } from "react";
import type { SpawnStage } from "@/engine/types";

interface CheckItem { id: string; lure: string; why: string }

const CHECKLIST: Record<SpawnStage, CheckItem[]> = {
  winter_pattern: [
    { id: "w1", lure: "Football Jig 3/8–1/2oz (Black/Blue)", why: "Cold water staple — drag slow on hard bottom" },
    { id: "w2", lure: "Drop Shot w/ Roboworm 4.5\" (Aaron's Magic)", why: "Dead stick for lethargic bass" },
    { id: "w3", lure: "Ned Rig 1/6oz + TRD (Green Pumpkin)", why: "Tiny profile, big results in cold" },
    { id: "w4", lure: "Underspin 3/8oz w/ Keitech 3.3\"", why: "Slow roll suspended fish" },
    { id: "w5", lure: "Lipless Crank 1/2oz (Red Craw)", why: "Yo-yo through dead milfoil edges" },
    { id: "w6", lure: "6–8lb Fluorocarbon", why: "Sensitivity + low vis in clear cold water" },
    { id: "w7", lure: "Split shot + finesse worm", why: "Ultra slow for pressured fish" },
    { id: "w8", lure: "Shaky Head 3/16oz + Straight tail worm", why: "Drag along bottom with tiny shakes" },
  ],
  early_pre_spawn: [
    { id: "ep1", lure: "Red Eye Shad 3/4oz (Red Craw)", why: "THE early pre-spawn bait — yo-yo through milfoil" },
    { id: "ep2", lure: "Spinnerbait 3/8oz White/Chartreuse", why: "Slow roll warming shallows" },
    { id: "ep3", lure: "Squarebill (Crawfish pattern)", why: "Deflect off rocks and debris" },
    { id: "ep4", lure: "Jig 3/8oz (Green Pumpkin Craw)", why: "Staging points and channel swings" },
    { id: "ep5", lure: "Chatterbait 3/8oz (White/Chartreuse)", why: "Warming flats — aggressive retrieve" },
    { id: "ep6", lure: "Texas Rig Craw 4\" (Black Blue)", why: "Flip to deep dock posts and fallen timber" },
    { id: "ep7", lure: "15lb Fluorocarbon main line", why: "Abrasion resistance around early cover" },
    { id: "ep8", lure: "Snap swivel for lipless", why: "Quick color changes without re-tying" },
  ],
  late_pre_spawn: [
    { id: "lp1", lure: "Chatterbait 1/2oz (White or Green Pumpkin)", why: "Late pre-spawn #1 power bait" },
    { id: "lp2", lure: "Squarebill 1/2oz (Sexy Shad)", why: "Crank staging banks" },
    { id: "lp3", lure: "Jig 1/2oz + Rage Tail Craw", why: "Flip to isolated cover on flats" },
    { id: "lp4", lure: "Spinnerbait 1/2oz Double Willow", why: "Fan cast spawning flats" },
    { id: "lp5", lure: "Wacky Senko 5\" (Green Pumpkin)", why: "Any visible cover — early sight fishing" },
    { id: "lp6", lure: "Fluke 4\" (White)", why: "Match shad near points" },
    { id: "lp7", lure: "Lipless Crank (Chrome Blue)", why: "Still crushing — transition bait" },
    { id: "lp8", lure: "Polarized sunglasses", why: "See beds and fish shallow" },
    { id: "lp9", lure: "50lb Braid for frog setup", why: "Vegetation getting thick — prep frog gear" },
  ],
  active_spawn: [
    { id: "as1", lure: "Wacky Senko 5\" (Green Pumpkin)", why: "Bed fishing staple — irresistible fall" },
    { id: "as2", lure: "Ned Rig 1/10oz + TRD", why: "Sit in the bed — finesse strike trigger" },
    { id: "as3", lure: "Neko Rig + nail weight 1/16oz", why: "Shake in place over bed" },
    { id: "as4", lure: "Texas Rig Creature Bait (WM Red)", why: "Defensive bite — intruder pattern" },
    { id: "as5", lure: "Drop Shot #2 hook + finesse worm", why: "Hover and shake near pressured beds" },
    { id: "as6", lure: "6lb Fluorocarbon on spinning", why: "Invisible line for spawning fish" },
    { id: "as7", lure: "Polarized glasses (mandatory)", why: "Can't bed fish without seeing them" },
    { id: "as8", lure: "Rubber-tipped hook remover", why: "Quick release for practice C&R" },
  ],
  post_spawn: [
    { id: "ps1", lure: "Paddle Tail Swimbait 4\" (Electric Shad)", why: "Match shad — post-spawn feeding frenzy" },
    { id: "ps2", lure: "Popper or Walk-the-dog topwater", why: "Aggressive surface bite on fry chasers" },
    { id: "ps3", lure: "Fluke 4\" (White)", why: "Twitching baitfish imitation" },
    { id: "ps4", lure: "Shaky Head + straight worm", why: "Recovery fish on weed edges" },
    { id: "ps5", lure: "Frog (Black or Natural)", why: "Pads and mats getting fishable" },
    { id: "ps6", lure: "Drop Shot 1/4oz", why: "Scattered deep fish off weed walls" },
    { id: "ps7", lure: "Chatterbait 3/8oz (White)", why: "Active feeders hitting everything — shad match" },
    { id: "ps8", lure: "50lb Braid + frog rod", why: "Emergent vegetation ready for frogging" },
  ],
  summer_pattern: [
    { id: "su1", lure: "Frog (Black or White)", why: "Over milfoil mats — peak summer pattern" },
    { id: "su2", lure: "Punch Rig 1oz+ Texas", why: "Punch through thick mats" },
    { id: "su3", lure: "Topwater Walk-the-dog", why: "Dawn and dusk — surface bite is explosive" },
    { id: "su4", lure: "Drop Shot 1/4oz + Roboworm", why: "Midday deep fish, 12–18ft" },
    { id: "su5", lure: "Chatterbait 1/2oz (Green Pumpkin)", why: "Weed edges at low light" },
    { id: "su6", lure: "Buzzbait (White)", why: "Early morning parallel to weed edges" },
    { id: "su7", lure: "Carolina Rig 3/4oz", why: "Deep offshore structure from boat" },
    { id: "su8", lure: "65lb Braid for frogging", why: "Heavy mat penetration and control" },
    { id: "su9", lure: "Ice + water — stay hydrated", why: "Shore fishing in heat — safety first" },
  ],
  fall_turnover: [
    { id: "ft1", lure: "Red Eye Shad 3/4oz (Chrome Blue)", why: "Fall shad migration — burn it over dying grass" },
    { id: "ft2", lure: "Chatterbait 1/2oz (White/Chartreuse)", why: "Aggressive fall reaction bite" },
    { id: "ft3", lure: "Spinnerbait 1/2oz (White Double Willow)", why: "Match schooling shad" },
    { id: "ft4", lure: "Squarebill (Shad pattern)", why: "Shallows loaded with bass chasing bait" },
    { id: "ft5", lure: "Paddle Tail 3.8\" (Electric Shad)", why: "Slow roll when they won't bite reaction baits" },
    { id: "ft6", lure: "Topwater Popper (White/Bone)", why: "Calm fall mornings — explosions on shad schools" },
    { id: "ft7", lure: "Jig 3/8oz for post-turnover", why: "After turnover bite gets tough — slow down" },
    { id: "ft8", lure: "Lipless in Firetiger or Red", why: "Alternative color for pressured fish" },
  ],
};

const STORAGE_KEY = "sw_checklist";

export function TackleChecklist({ spawn_stage }: { spawn_stage: SpawnStage }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { stage, ids } = JSON.parse(stored);
      if (stage === spawn_stage) setChecked(new Set(ids));
      else setChecked(new Set());
    }
  }, [spawn_stage]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stage: spawn_stage, ids: [...next] }));
      return next;
    });
  };

  const items = CHECKLIST[spawn_stage] ?? [];
  const done = items.filter((i) => checked.has(i.id)).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Tackle Checklist</p>
        <span className="text-xs text-slate-500">{done}/{items.length} packed</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-3">
        <div className="h-full rounded-full bg-neon-cyan transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
      </div>
      {items.map((item) => (
        <div key={item.id} className={`flex gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${checked.has(item.id) ? "bg-neon-cyan/8 border border-neon-cyan/15" : "bg-white/3 border border-white/5"}`}
          onClick={() => toggle(item.id)}>
          <div className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${checked.has(item.id) ? "bg-neon-cyan border-neon-cyan" : "border-white/20"}`}>
            {checked.has(item.id) && <span className="text-navy text-xs font-bold">✓</span>}
          </div>
          <div>
            <p className={`text-xs font-semibold transition-colors ${checked.has(item.id) ? "text-slate-500 line-through" : "text-white"}`}>{item.lure}</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.why}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
