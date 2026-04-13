"use client";

import { useState } from "react";
import type { FishingReport, FishingMode, WaterClarity } from "@/engine/types";

function genId() { return `rpt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`; }

interface Props {
  reports: FishingReport[];
  fishing_mode: FishingMode;
  onSave: (r: FishingReport) => void;
  onDelete: (id: string) => void;
}

const BLANK = { date: new Date().toISOString().slice(0, 10), session_duration_hours: "", fish_caught: "", fish_landed: "", best_lure_name: "", best_lure_color: "", water_clarity_observed: "stained" as WaterClarity, weed_growth: "moderate" as FishingReport["weed_growth"], notes: "" };

export function FishingReportLog({ reports, fishing_mode, onSave, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...BLANK });

  const sorted = [...reports].sort((a, b) => b.date.localeCompare(a.date));
  const totalFish = reports.reduce((s, r) => s + (r.fish_caught ?? 0), 0);
  const bestSession = reports.reduce<FishingReport | null>((best, r) => {
    if (!r.fish_caught) return best;
    if (!best?.fish_caught) return r;
    return r.fish_caught > best.fish_caught ? r : best;
  }, null);

  const handleSave = () => {
    onSave({
      id: genId(),
      date: form.date,
      session_duration_hours: form.session_duration_hours ? parseFloat(form.session_duration_hours) : undefined,
      fish_caught: form.fish_caught ? parseInt(form.fish_caught) : undefined,
      fish_landed: form.fish_landed ? parseInt(form.fish_landed) : undefined,
      best_lure_name: form.best_lure_name || undefined,
      best_lure_color: form.best_lure_color || undefined,
      water_clarity_observed: form.water_clarity_observed,
      weed_growth: form.weed_growth,
      notes: form.notes || undefined,
      fishing_mode,
    });
    setAdding(false);
    setForm({ ...BLANK });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Session Log</p>
        <button onClick={() => setAdding(!adding)} className="text-xs text-neon-cyan hover:underline">
          {adding ? "Cancel" : "+ Log Session"}
        </button>
      </div>

      {/* Stats */}
      {reports.length > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Sessions", value: reports.length },
            { label: "Total Fish", value: totalFish },
            { label: "Best Day", value: bestSession?.fish_caught ? `${bestSession.fish_caught} fish` : "—" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-2">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-sm font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="glass-card p-4 space-y-2">
          <style>{`.ri { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:0.5rem; padding:0.4rem 0.6rem; font-size:0.8rem; color:white; } .ri option{background:#1a1f2e;}`}</style>
          <div className="grid grid-cols-2 gap-2">
            <div><p className="text-xs text-slate-500 mb-1">Date</p><input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="ri" /></div>
            <div><p className="text-xs text-slate-500 mb-1">Hours</p><input type="number" step="0.5" value={form.session_duration_hours} onChange={(e) => setForm((f) => ({ ...f, session_duration_hours: e.target.value }))} className="ri" placeholder="e.g. 3" /></div>
            <div><p className="text-xs text-slate-500 mb-1">Fish Caught</p><input type="number" value={form.fish_caught} onChange={(e) => setForm((f) => ({ ...f, fish_caught: e.target.value }))} className="ri" /></div>
            <div><p className="text-xs text-slate-500 mb-1">Fish Landed</p><input type="number" value={form.fish_landed} onChange={(e) => setForm((f) => ({ ...f, fish_landed: e.target.value }))} className="ri" /></div>
            <div><p className="text-xs text-slate-500 mb-1">Best Lure</p><input value={form.best_lure_name} onChange={(e) => setForm((f) => ({ ...f, best_lure_name: e.target.value }))} className="ri" placeholder="e.g. Red Eye Shad" /></div>
            <div><p className="text-xs text-slate-500 mb-1">Color</p><input value={form.best_lure_color} onChange={(e) => setForm((f) => ({ ...f, best_lure_color: e.target.value }))} className="ri" placeholder="e.g. Red Craw" /></div>
            <div><p className="text-xs text-slate-500 mb-1">Water Clarity</p>
              <select value={form.water_clarity_observed} onChange={(e) => setForm((f) => ({ ...f, water_clarity_observed: e.target.value as WaterClarity }))} className="ri">
                <option value="clear">Clear</option><option value="stained">Stained</option><option value="muddy">Muddy</option>
              </select>
            </div>
            <div><p className="text-xs text-slate-500 mb-1">Weed Growth</p>
              <select value={form.weed_growth} onChange={(e) => setForm((f) => ({ ...f, weed_growth: e.target.value as FishingReport["weed_growth"] }))} className="ri">
                <option value="low">Low</option><option value="moderate">Moderate</option><option value="heavy">Heavy</option>
              </select>
            </div>
            <div className="col-span-2"><p className="text-xs text-slate-500 mb-1">Notes</p><input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="ri" placeholder="What worked, conditions, spots..." /></div>
          </div>
          <button onClick={handleSave} className="w-full py-2 rounded-lg text-sm font-semibold bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25 transition-colors">Save Session</button>
        </div>
      )}

      {sorted.slice(0, 5).map((r) => (
        <div key={r.id} className="glass-card p-3 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-white">{r.date} · {r.fish_caught ?? 0} fish{r.session_duration_hours ? ` · ${r.session_duration_hours}h` : ""}</p>
            {r.best_lure_name && <p className="text-xs text-slate-400 mt-0.5">{r.best_lure_name}{r.best_lure_color ? ` — ${r.best_lure_color}` : ""}</p>}
            {r.notes && <p className="text-xs text-slate-600 mt-0.5 truncate max-w-xs">{r.notes}</p>}
          </div>
          <button onClick={() => onDelete(r.id)} className="text-xs text-slate-600 hover:text-red-400 ml-3">✕</button>
        </div>
      ))}

      {reports.length === 0 && !adding && (
        <p className="text-xs text-slate-600 text-center py-4">No sessions logged yet.</p>
      )}
    </div>
  );
}
