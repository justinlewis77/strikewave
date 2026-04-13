"use client";

import { useState } from "react";
import type { CatchEntry, FishingMode, SpawnStage } from "@/engine/types";

function genId() { return `catch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

interface Props {
  catches: CatchEntry[];
  fishing_mode: FishingMode;
  current_spawn_stage?: SpawnStage;
  current_temp_f?: number;
  current_water_temp_f?: number | null;
  current_wind_mph?: number;
  onSave: (entry: CatchEntry) => void;
  onDelete: (id: string) => void;
}

export function CatchLog({ catches, fishing_mode, current_spawn_stage, current_temp_f, current_water_temp_f, current_wind_mph, onSave, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    lure_name: "",
    lure_color: "",
    weight_lbs: "",
    length_in: "",
    location_note: "",
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
  });

  const sorted = [...catches].sort((a, b) => b.date.localeCompare(a.date));
  const personal_best = catches.reduce<CatchEntry | null>((best, c) => {
    if (!c.weight_lbs) return best;
    if (!best?.weight_lbs) return c;
    return c.weight_lbs > best.weight_lbs ? c : best;
  }, null);

  const handleSave = () => {
    if (!form.lure_name.trim()) return;
    const entry: CatchEntry = {
      id: genId(),
      date: form.date,
      time: form.time,
      lure_name: form.lure_name,
      lure_color: form.lure_color || undefined,
      weight_lbs: form.weight_lbs ? parseFloat(form.weight_lbs) : undefined,
      length_in: form.length_in ? parseFloat(form.length_in) : undefined,
      location_note: form.location_note || undefined,
      fishing_mode,
      conditions: {
        temp_f: current_temp_f,
        water_temp_f: current_water_temp_f ?? undefined,
        wind_mph: current_wind_mph,
        spawn_stage: current_spawn_stage,
      },
    };
    onSave(entry);
    setAdding(false);
    setForm({ lure_name: "", lure_color: "", weight_lbs: "", length_in: "", location_note: "", date: new Date().toISOString().slice(0, 10), time: new Date().toTimeString().slice(0, 5) });
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Catch Log</p>
        <button onClick={() => setAdding((v) => !v)} className="text-xs text-neon-cyan hover:underline">
          {adding ? "Cancel" : "+ Log Catch"}
        </button>
      </div>

      {personal_best?.weight_lbs && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-pink/10 border border-neon-pink/20">
          <span className="text-lg">🏆</span>
          <div>
            <p className="text-xs font-bold text-neon-pink">Personal Best</p>
            <p className="text-xs text-slate-300">{personal_best.weight_lbs} lbs{personal_best.length_in ? ` · ${personal_best.length_in}"` : ""} on {personal_best.lure_name}</p>
          </div>
        </div>
      )}

      {adding && (
        <div className="space-y-2 border-t border-white/5 pt-3">
          <style>{`.cl-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:0.5rem; padding:0.4rem 0.6rem; font-size:0.8rem; color:white; }`}</style>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-1">Lure *</p>
              <input value={form.lure_name} onChange={(e) => setForm((f) => ({ ...f, lure_name: e.target.value }))} className="cl-input" placeholder="e.g. Red Eye Shad" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Color</p>
              <input value={form.lure_color} onChange={(e) => setForm((f) => ({ ...f, lure_color: e.target.value }))} className="cl-input" placeholder="e.g. Red Craw" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Weight (lbs)</p>
              <input type="number" step="0.1" value={form.weight_lbs} onChange={(e) => setForm((f) => ({ ...f, weight_lbs: e.target.value }))} className="cl-input" placeholder="e.g. 3.2" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Length (in)</p>
              <input type="number" step="0.5" value={form.length_in} onChange={(e) => setForm((f) => ({ ...f, length_in: e.target.value }))} className="cl-input" placeholder='e.g. 18"' />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Date</p>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="cl-input" />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-1">Location Note</p>
              <input value={form.location_note} onChange={(e) => setForm((f) => ({ ...f, location_note: e.target.value }))} className="cl-input" placeholder="e.g. North dock, weed edge" />
            </div>
          </div>
          <button onClick={handleSave} className="w-full py-2 rounded-lg text-sm font-semibold bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25 transition-colors">
            Save Catch
          </button>
        </div>
      )}

      {sorted.slice(0, 10).map((c) => (
        <div key={c.id} className="flex items-center justify-between py-2 border-t border-white/5">
          <div>
            <p className="text-xs text-white font-medium">
              {c.lure_name}{c.lure_color ? ` — ${c.lure_color}` : ""}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {c.date}{c.weight_lbs ? ` · ${c.weight_lbs} lbs` : ""}{c.length_in ? ` · ${c.length_in}"` : ""}
              {c.location_note ? ` · ${c.location_note}` : ""}
            </p>
          </div>
          <button onClick={() => onDelete(c.id)} className="text-xs text-slate-600 hover:text-red-400 transition-colors ml-3">✕</button>
        </div>
      ))}

      {catches.length === 0 && !adding && (
        <p className="text-xs text-slate-600 text-center py-2">No catches logged yet. Start tracking your fish!</p>
      )}
    </div>
  );
}
