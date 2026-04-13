"use client";

import { useState, useEffect } from "react";
import type { ConditionSnapshot, Lure, LureType } from "@/engine/types";
import { scoreLure } from "@/engine/scorer";

const ROTATION_KEY = "sw_rotation_step";
const ROTATION_SNAP_KEY = "sw_rotation_snap";

// Buckets from aggressive → finesse
const BUCKETS: LureType[][] = [
  ["chatterbait", "spinnerbait", "lipless_crank", "squarebill", "buzzbait"],
  ["topwater", "frog", "swimbait_paddle", "diving_crank", "fluke"],
  ["texas_rig", "carolina_rig", "jig", "swimbait_glide"],
  ["dropshot", "ned_rig", "wacky_rig", "neko_rig", "shaky_head", "underspun"],
];

function findBestFromBucket(bucket: LureType[], inventory: Lure[], snap: ConditionSnapshot): { lure: Lure | null; lureType: LureType } {
  const inInventory = bucket.filter((lt) => inventory.some((l) => l.type === lt));
  const candidates = inInventory.length > 0 ? inInventory : bucket;
  const scored = candidates.map((lt) => ({ lt, score: scoreLure(lt, snap).score }));
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]?.lt ?? bucket[0];
  return { lure: inventory.find((l) => l.type === best) ?? null, lureType: best };
}

interface Props {
  snap: ConditionSnapshot;
  inventory: Lure[];
}

export function LureRotation({ snap, inventory }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ROTATION_KEY);
    const storedSnap = localStorage.getItem(ROTATION_SNAP_KEY);
    if (stored && storedSnap) {
      const prevStage = JSON.parse(storedSnap).spawn_stage;
      if (prevStage === snap.spawn_stage) setStep(parseInt(stored));
    }
  }, [snap.spawn_stage]);

  const handleNoBites = () => {
    const next = (step + 1) % BUCKETS.length;
    setStep(next);
    setVisible(true);
    localStorage.setItem(ROTATION_KEY, String(next));
    localStorage.setItem(ROTATION_SNAP_KEY, JSON.stringify({ spawn_stage: snap.spawn_stage }));
  };

  const { lure, lureType } = findBestFromBucket(BUCKETS[step], inventory, snap);
  const stepLabels = ["Aggressive", "Mid-Range", "Power Finesse", "Finesse"];

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Lure Rotation</p>
        <div className="flex gap-1">
          {BUCKETS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? "bg-neon-pink" : "bg-white/15"}`} />
          ))}
        </div>
      </div>

      {visible && (
        <div className="border border-neon-cyan/20 rounded-lg p-3 bg-neon-cyan/5">
          <p className="text-xs text-neon-cyan font-bold mb-1">Step {step + 1}: {stepLabels[step]}</p>
          <p className="text-sm text-white font-semibold capitalize">
            {lure ? lure.name : lureType.replace(/_/g, " ")}
          </p>
          {lure?.color && <p className="text-xs text-slate-400 mt-0.5">{lure.color}</p>}
          {step === BUCKETS.length - 1 && (
            <p className="text-xs text-slate-500 mt-1">Full rotation complete — try a different area or call it.</p>
          )}
        </div>
      )}

      <button
        onClick={handleNoBites}
        className="w-full py-2 rounded-lg text-sm font-semibold bg-neon-pink/10 text-neon-pink border border-neon-pink/25 hover:bg-neon-pink/20 transition-colors"
      >
        {visible ? "Still No Bites → Next" : "No Bites — Rotate"}
      </button>

      {visible && step > 0 && (
        <button onClick={() => { setStep(0); setVisible(false); localStorage.removeItem(ROTATION_KEY); }}
          className="w-full py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors">
          Reset Rotation
        </button>
      )}
    </div>
  );
}
