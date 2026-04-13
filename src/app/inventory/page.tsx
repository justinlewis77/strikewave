"use client";

import { useState } from "react";
import { useDB } from "@/hooks/useDB";
import type { RodSetup, Lure, SoftPlastic, LureType, RodPower, RodAction, LineType } from "@/engine/types";
import { ALL_LURE_TYPES } from "@/engine/scorer";
import { ColorSwatch } from "@/components/ColorSwatch";

type Tab = "rods" | "lures" | "plastics";

function genId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

const ROD_POWERS: RodPower[] = ["ultralight", "light", "medium_light", "medium", "medium_heavy", "heavy", "extra_heavy"];
const ROD_ACTIONS: RodAction[] = ["moderate", "moderate_fast", "fast", "extra_fast"];
const LINE_TYPES: LineType[] = ["fluorocarbon", "monofilament", "braid", "braid_fluoro_leader"];
const BLANK_ROD: Omit<RodSetup, "id"> = {
  name: "", rod_type: "baitcaster", rod_power: "medium_heavy",
  rod_action: "fast", line_type: "fluorocarbon", line_lb: 15,
  primary_lures: [], rod_brand: "", rod_model: "",
  reel_brand: "", reel_model: "", gear_ratio: "",
};

function RodForm({ initial, onSave, onCancel }: { initial?: RodSetup; onSave: (r: RodSetup) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Omit<RodSetup, "id">>(initial ? { ...initial } : { ...BLANK_ROD });
  const toggleLure = (l: LureType) => setForm((f) => ({
    ...f, primary_lures: f.primary_lures.includes(l) ? f.primary_lures.filter((x) => x !== l) : [...f.primary_lures, l],
  }));
  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="glass-card p-4 space-y-4">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">{initial ? "Edit Rod" : "Add Rod"}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className="fl">Setup Name *</label><input value={form.name} onChange={(e) => set("name", e.target.value)} className="fi" placeholder="e.g. MH Baitcaster" /></div>
        <div><label className="fl">Rod Type</label><select value={form.rod_type} onChange={(e) => set("rod_type", e.target.value)} className="fi"><option value="baitcaster">Baitcaster</option><option value="spinning">Spinning</option></select></div>
        <div><label className="fl">Power</label><select value={form.rod_power} onChange={(e) => set("rod_power", e.target.value as RodPower)} className="fi">{ROD_POWERS.map((p) => <option key={p} value={p}>{p.replace(/_/g, " ")}</option>)}</select></div>
        <div><label className="fl">Action</label><select value={form.rod_action} onChange={(e) => set("rod_action", e.target.value as RodAction)} className="fi">{ROD_ACTIONS.map((a) => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}</select></div>
        <div><label className="fl">Line Type</label><select value={form.line_type} onChange={(e) => set("line_type", e.target.value as LineType)} className="fi">{LINE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}</select></div>
        <div><label className="fl">Line (lb)</label><input type="number" value={form.line_lb} onChange={(e) => set("line_lb", parseInt(e.target.value))} className="fi" min={4} max={100} /></div>
        <div><label className="fl">Gear Ratio</label><input value={form.gear_ratio ?? ""} onChange={(e) => set("gear_ratio", e.target.value)} className="fi" placeholder="e.g. 7.3:1" /></div>
        <div><label className="fl">Lure Wt Min (oz)</label><input type="number" step="0.0625" value={form.lure_weight_min_oz ?? ""} onChange={(e) => set("lure_weight_min_oz", parseFloat(e.target.value) || undefined)} className="fi" placeholder="0.25" /></div>
        <div><label className="fl">Lure Wt Max (oz)</label><input type="number" step="0.0625" value={form.lure_weight_max_oz ?? ""} onChange={(e) => set("lure_weight_max_oz", parseFloat(e.target.value) || undefined)} className="fi" placeholder="1.0" /></div>
        <div><label className="fl">Rod Brand</label><input value={form.rod_brand ?? ""} onChange={(e) => set("rod_brand", e.target.value)} className="fi" placeholder="e.g. Dobyns" /></div>
        <div><label className="fl">Rod Model</label><input value={form.rod_model ?? ""} onChange={(e) => set("rod_model", e.target.value)} className="fi" placeholder="e.g. 735C" /></div>
        <div><label className="fl">Reel Brand</label><input value={form.reel_brand ?? ""} onChange={(e) => set("reel_brand", e.target.value)} className="fi" placeholder="e.g. Shimano" /></div>
        <div><label className="fl">Reel Model</label><input value={form.reel_model ?? ""} onChange={(e) => set("reel_model", e.target.value)} className="fi" placeholder="e.g. Curado DC" /></div>
      </div>
      <div>
        <label className="fl mb-2 block">Primary Lures (leave all unselected for all)</label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_LURE_TYPES.map((l) => (
            <button key={l} type="button" onClick={() => toggleLure(l)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${form.primary_lures.includes(l) ? "bg-neon-pink/20 text-neon-pink border-neon-pink/40" : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"}`}>
              {l.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { if (!form.name.trim()) return; onSave({ ...form, id: initial?.id ?? genId() }); }}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25 transition-colors">Save</button>
        <button onClick={onCancel} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 bg-white/5 border border-white/10">Cancel</button>
      </div>
    </div>
  );
}

const BLANK_LURE: Omit<Lure, "id"> = { name: "", type: "jig", color: "", brand: "", notes: "" };
function LureForm({ initial, onSave, onCancel }: { initial?: Lure; onSave: (l: Lure) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Omit<Lure, "id">>(initial ?? { ...BLANK_LURE });
  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="glass-card p-4 space-y-3">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">{initial ? "Edit Lure" : "Add Lure"}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className="fl">Name *</label><input value={form.name} onChange={(e) => set("name", e.target.value)} className="fi" placeholder="e.g. Red Eye Shad 3/4oz" /></div>
        <div><label className="fl">Type</label><select value={form.type} onChange={(e) => set("type", e.target.value as LureType)} className="fi">{ALL_LURE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}</select></div>
        <div><label className="fl">Weight (oz)</label><input type="number" step="0.0625" value={form.weight_oz ?? ""} onChange={(e) => set("weight_oz", parseFloat(e.target.value) || undefined)} className="fi" placeholder="0.5" /></div>
        <div><label className="fl">Color</label><input value={form.color ?? ""} onChange={(e) => set("color", e.target.value)} className="fi" placeholder="e.g. Red Craw" /></div>
        <div><label className="fl">Brand</label><input value={form.brand ?? ""} onChange={(e) => set("brand", e.target.value)} className="fi" placeholder="e.g. Strike King" /></div>
        <div className="col-span-2"><label className="fl">Notes</label><input value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} className="fi" /></div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { if (!form.name.trim()) return; onSave({ ...form, id: initial?.id ?? genId() }); }}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25 transition-colors">Save</button>
        <button onClick={onCancel} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 bg-white/5 border border-white/10">Cancel</button>
      </div>
    </div>
  );
}

const PLASTIC_STYLES = ["creature", "worm", "craw", "swimbait", "tube", "stick", "finesse"] as const;
const BLANK_PLASTIC: Omit<SoftPlastic, "id"> = { name: "", brand: "", style: "stick", color: "" };
function PlasticForm({ initial, onSave, onCancel }: { initial?: SoftPlastic; onSave: (p: SoftPlastic) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Omit<SoftPlastic, "id">>(initial ?? { ...BLANK_PLASTIC });
  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="glass-card p-4 space-y-3">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">{initial ? "Edit Plastic" : "Add Plastic"}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className="fl">Name *</label><input value={form.name} onChange={(e) => set("name", e.target.value)} className="fi" placeholder='e.g. Senko 5"' /></div>
        <div><label className="fl">Style</label><select value={form.style} onChange={(e) => set("style", e.target.value)} className="fi">{PLASTIC_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><label className="fl">Length (in)</label><input type="number" step="0.5" value={form.length_in ?? ""} onChange={(e) => set("length_in", parseFloat(e.target.value) || undefined)} className="fi" /></div>
        <div><label className="fl">Color</label><input value={form.color ?? ""} onChange={(e) => set("color", e.target.value)} className="fi" placeholder="e.g. Green Pumpkin" /></div>
        <div><label className="fl">Brand</label><input value={form.brand ?? ""} onChange={(e) => set("brand", e.target.value)} className="fi" placeholder="e.g. Yamamoto" /></div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { if (!form.name.trim()) return; onSave({ ...form, id: initial?.id ?? genId() }); }}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25 transition-colors">Save</button>
        <button onClick={onCancel} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 bg-white/5 border border-white/10">Cancel</button>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const { rods, lures, plastics, saveRod, removeRod, saveLure, removeLure, savePlastic, removePlastic, ready } = useDB();
  const [tab, setTab] = useState<Tab>("rods");
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  if (!ready) return null;

  const TABS = [
    { key: "rods" as Tab, label: "Rods", count: rods.length },
    { key: "lures" as Tab, label: "Lures", count: lures.length },
    { key: "plastics" as Tab, label: "Plastics", count: plastics.length },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <style>{`.fl { display:block; font-size:0.7rem; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem; } .fi { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; color:white; } .fi option { background:#1a1f2e; }`}</style>

      <div>
        <h1 className="font-orbitron text-xl font-bold tracking-wider text-white">Inventory</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your gear</p>
      </div>

      <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setAdding(false); setEditing(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? "bg-neon-pink/20 text-neon-pink border border-neon-pink/30" : "text-slate-400 hover:text-white"}`}>
            {t.label} <span className="text-xs opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {!adding && !editing && (
        <button onClick={() => setAdding(true)} className="w-full py-2.5 rounded-xl text-sm font-semibold border border-dashed border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/5 transition-colors">
          + Add {tab === "rods" ? "Rod Setup" : tab === "lures" ? "Lure" : "Soft Plastic"}
        </button>
      )}

      {adding && tab === "rods" && <RodForm onSave={async (r) => { await saveRod(r); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {adding && tab === "lures" && <LureForm onSave={async (l) => { await saveLure(l); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {adding && tab === "plastics" && <PlasticForm onSave={async (p) => { await savePlastic(p); setAdding(false); }} onCancel={() => setAdding(false)} />}

      {tab === "rods" && rods.map((rod) =>
        editing === rod.id
          ? <RodForm key={rod.id} initial={rod} onSave={async (r) => { await saveRod(r); setEditing(null); }} onCancel={() => setEditing(null)} />
          : (
            <div key={rod.id} className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{rod.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{rod.rod_type} · {rod.rod_power.replace(/_/g, " ")} · {rod.rod_action.replace(/_/g, " ")}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{rod.line_lb}lb {rod.line_type.replace(/_/g, " ")}{rod.gear_ratio && <span className="ml-1 text-neon-purple">· {rod.gear_ratio}</span>}</p>
                  {(rod.rod_brand || rod.reel_brand) && <p className="text-xs text-slate-600 mt-0.5">{[rod.rod_brand, rod.rod_model].filter(Boolean).join(" ")}{rod.reel_brand && ` · ${[rod.reel_brand, rod.reel_model].filter(Boolean).join(" ")}`}</p>}
                  {rod.primary_lures.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {rod.primary_lures.slice(0, 4).map((l) => <span key={l} className="text-xs bg-white/5 text-slate-400 px-1.5 py-0.5 rounded">{l.replace(/_/g, " ")}</span>)}
                      {rod.primary_lures.length > 4 && <span className="text-xs text-slate-600">+{rod.primary_lures.length - 4}</span>}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  <button onClick={() => setEditing(rod.id)} className="text-xs text-slate-400 hover:text-neon-cyan transition-colors">Edit</button>
                  <button onClick={() => removeRod(rod.id)} className="text-xs text-slate-400 hover:text-red-400 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          )
      )}

      {tab === "lures" && lures.map((lure) =>
        editing === lure.id
          ? <LureForm key={lure.id} initial={lure} onSave={async (l) => { await saveLure(l); setEditing(null); }} onCancel={() => setEditing(null)} />
          : (
            <div key={lure.id} className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white text-sm">{lure.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{lure.type.replace(/_/g, " ")}{lure.weight_oz && ` · ${lure.weight_oz}oz`}{lure.brand && ` · ${lure.brand}`}</p>
                  {lure.color && <p className="text-xs mt-0.5"><ColorSwatch color={lure.color} /></p>}
                </div>
                <div className="flex gap-2 ml-3">
                  <button onClick={() => setEditing(lure.id)} className="text-xs text-slate-400 hover:text-neon-cyan transition-colors">Edit</button>
                  <button onClick={() => removeLure(lure.id)} className="text-xs text-slate-400 hover:text-red-400 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          )
      )}

      {tab === "plastics" && plastics.map((p) =>
        editing === p.id
          ? <PlasticForm key={p.id} initial={p} onSave={async (pl) => { await savePlastic(pl); setEditing(null); }} onCancel={() => setEditing(null)} />
          : (
            <div key={p.id} className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white text-sm">{p.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.style}{p.length_in && ` · ${p.length_in}"`}{p.brand && ` · ${p.brand}`}</p>
                  {p.color && <p className="text-xs mt-0.5"><ColorSwatch color={p.color} /></p>}
                </div>
                <div className="flex gap-2 ml-3">
                  <button onClick={() => setEditing(p.id)} className="text-xs text-slate-400 hover:text-neon-cyan transition-colors">Edit</button>
                  <button onClick={() => removePlastic(p.id)} className="text-xs text-slate-400 hover:text-red-400 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          )
      )}

      {tab === "rods" && rods.length === 0 && !adding && <p className="text-center text-slate-500 text-sm py-8">No rods added yet.</p>}
      {tab === "lures" && lures.length === 0 && !adding && <p className="text-center text-slate-500 text-sm py-8">No lures added yet.</p>}
      {tab === "plastics" && plastics.length === 0 && !adding && <p className="text-center text-slate-500 text-sm py-8">No soft plastics added yet.</p>}
    </div>
  );
}
