"use client";

import { useState, useEffect } from "react";
import { useDB } from "@/hooks/useDB";
import { useLocation } from "@/hooks/useLocation";
import { exportData, importData } from "@/lib/db";
import type { AppSettings, WaterClarity, FishingMode } from "@/engine/types";

const COVER_OPTIONS = [
  { key: "weeds", label: "Weeds / Milfoil" },
  { key: "docks", label: "Docks" },
  { key: "rocks", label: "Rocks" },
  { key: "wood", label: "Wood / Timber" },
  { key: "lily_pads", label: "Lily Pads" },
  { key: "open_water", label: "Open Water" },
] as const;

export default function SettingsPage() {
  const { settings, saveSettings, ready, reload } = useDB();
  const location = useLocation(settings.use_gps);
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [notifGranted, setNotifGranted] = useState(false);

  const [form, setForm] = useState<AppSettings>({ ...settings });

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  useEffect(() => {
    if ("Notification" in window) {
      setNotifGranted(Notification.permission === "granted");
    }
  }, []);

  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    await saveSettings(form);
    // Persist notification preference for ServiceWorkerRegistrar
    localStorage.setItem("sw_notifications_enabled", String(!!form.notifications_enabled));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `strikewave-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setMsg(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data);
      await reload();
      setMsg("Import successful!");
    } catch {
      setMsg("Import failed — invalid file.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleRequestNotif = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifGranted(perm === "granted");
    if (perm === "granted") {
      set("notifications_enabled", true);
    }
  };

  const toggleCover = (key: string) => {
    const current = form.lake_profile?.primary_cover ?? [];
    const exists = current.includes(key as never);
    const updated = exists ? current.filter((c) => c !== key) : [...current, key as never];
    set("lake_profile", { ...form.lake_profile, primary_cover: updated });
  };

  if (!ready) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <style>{`.si { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; color:white; } .si option { background:#1a1f2e; } .sl { display:block; font-size:0.7rem; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem; }`}</style>

      <div>
        <h1 className="font-orbitron text-xl font-bold tracking-wider text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure app behavior and data</p>
      </div>

      {/* Fishing Mode */}
      <section className="glass-card p-4 space-y-3">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Fishing Mode</p>
        <div className="flex gap-2">
          {(["shore", "boat"] as FishingMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => set("fishing_mode", mode)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                form.fishing_mode === mode
                  ? "bg-neon-pink/20 text-neon-pink border-neon-pink/40"
                  : "bg-white/5 text-slate-400 border-white/10"
              }`}
            >
              {mode === "shore" ? "🚶 Shore" : "⛵ Boat"}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-600">Shore mode adjusts recommendations and shows casting advisor.</p>
      </section>

      {/* Location */}
      <section className="glass-card p-4 space-y-4">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Location</p>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm text-white">Use GPS</p>
            <p className="text-xs text-slate-500">Auto-detect location for weather</p>
          </div>
          <div
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.use_gps ? "bg-neon-cyan/30 border border-neon-cyan/40" : "bg-white/10 border border-white/10"}`}
            onClick={() => set("use_gps", !form.use_gps)}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${form.use_gps ? "left-5 bg-neon-cyan" : "left-0.5 bg-slate-400"}`} />
          </div>
        </label>

        {location.name && (
          <p className="text-xs text-slate-500">
            Detected: <span className="text-slate-300">{location.name}</span>
          </p>
        )}

        {!form.use_gps && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="sl">Latitude</label>
              <input type="number" step="0.0001" value={form.location_lat ?? ""} onChange={(e) => set("location_lat", parseFloat(e.target.value) || undefined)} placeholder="e.g. 42.9634" className="si" />
            </div>
            <div>
              <label className="sl">Longitude</label>
              <input type="number" step="0.0001" value={form.location_lon ?? ""} onChange={(e) => set("location_lon", parseFloat(e.target.value) || undefined)} placeholder="e.g. -83.6875" className="si" />
            </div>
          </div>
        )}
      </section>

      {/* Default Conditions */}
      <section className="glass-card p-4 space-y-4">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Default Conditions</p>
        <div>
          <label className="sl">Water Clarity</label>
          <select value={form.water_clarity} onChange={(e) => set("water_clarity", e.target.value as WaterClarity)} className="si">
            <option value="clear">Clear</option>
            <option value="stained">Stained</option>
            <option value="muddy">Muddy</option>
          </select>
        </div>
      </section>

      {/* Lake Profile */}
      <section className="glass-card p-4 space-y-4">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Lake Profile</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="sl">Lake / Body of Water Name</label>
            <input value={form.lake_profile?.lake_name ?? ""} onChange={(e) => set("lake_profile", { ...form.lake_profile, lake_name: e.target.value })} className="si" placeholder="e.g. Shinanguag Lake" />
          </div>
          <div>
            <label className="sl">Water Type</label>
            <select value={form.lake_profile?.water_type ?? ""} onChange={(e) => set("lake_profile", { ...form.lake_profile, water_type: e.target.value as "lake" | "pond" | "river" })} className="si">
              <option value="">Select...</option>
              <option value="lake">Lake</option>
              <option value="pond">Pond</option>
              <option value="river">River</option>
            </select>
          </div>
          <div>
            <label className="sl">Depth Profile</label>
            <select value={form.lake_profile?.depth_profile ?? ""} onChange={(e) => set("lake_profile", { ...form.lake_profile, depth_profile: e.target.value as "shallow" | "mid" | "deep" | "mixed" })} className="si">
              <option value="">Select...</option>
              <option value="shallow">Shallow (under 15ft)</option>
              <option value="mid">Mid (15–30ft)</option>
              <option value="deep">Deep (30ft+)</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="sl mb-2 block">Primary Cover</label>
          <div className="flex flex-wrap gap-1.5">
            {COVER_OPTIONS.map((opt) => {
              const selected = form.lake_profile?.primary_cover?.includes(opt.key as never);
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleCover(opt.key)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    selected
                      ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40"
                      : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="glass-card p-4 space-y-3">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Bite Window Alerts</p>

        {!notifGranted ? (
          <div>
            <p className="text-xs text-slate-400 mb-2">Get notified 30 min before major/minor solunar bite windows.</p>
            <button onClick={handleRequestNotif} className="w-full py-2 rounded-lg text-sm font-semibold bg-neon-purple/15 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/25 transition-colors">
              Enable Notifications
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm text-white">Solunar Bite Alerts</p>
                <p className="text-xs text-slate-500">Notify 30 min before major/minor windows</p>
              </div>
              <div
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.notifications_enabled ? "bg-neon-purple/30 border border-neon-purple/40" : "bg-white/10 border border-white/10"}`}
                onClick={() => set("notifications_enabled", !form.notifications_enabled)}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${form.notifications_enabled ? "left-5 bg-neon-purple" : "left-0.5 bg-slate-400"}`} />
              </div>
            </label>
            <button
              onClick={() => {
                if (Notification.permission === "granted") {
                  new Notification("🎣 StrikeWave — Test Alert", {
                    body: "Major bite window starts in 30 min — get to the water! (Shinanguag Lake)",
                    icon: "/icons/icon-192.png",
                  });
                }
              }}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-white/5 text-slate-400 border border-white/10 hover:bg-white/8 transition-colors"
            >
              Send Test Notification
            </button>
          </div>
        )}
      </section>

      {/* Save */}
      <button onClick={handleSave} className="w-full py-3 rounded-xl font-orbitron font-bold text-sm tracking-wider bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25 transition-colors">
        {saved ? "SAVED ✓" : "SAVE SETTINGS"}
      </button>

      {/* Data */}
      <section className="glass-card p-4 space-y-3">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Data</p>
        <button onClick={handleExport} className="w-full py-2.5 rounded-lg text-sm font-semibold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 hover:bg-neon-cyan/15 transition-colors">
          Export Backup (JSON)
        </button>
        <label className="block cursor-pointer">
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          <div className="w-full py-2.5 rounded-lg text-sm font-semibold text-center bg-white/5 text-slate-300 border border-white/10 hover:bg-white/8 transition-colors">
            {importing ? "Importing..." : "Import Backup (JSON)"}
          </div>
        </label>
        {msg && <p className={`text-xs ${msg.includes("fail") ? "text-red-400" : "text-neon-cyan"}`}>{msg}</p>}
      </section>

      <section className="glass-card p-4 space-y-1">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">About</p>
        <p className="text-xs text-slate-500 pt-1">StrikeWave v0.2.0 — Seasonal Bass Engine</p>
        <p className="text-xs text-slate-600">Weather: Open-Meteo · Water temp: USGS NWIS · Geocoding: Nominatim</p>
        <p className="text-xs text-slate-600">AI Guide: Anthropic claude-haiku-4-5</p>
      </section>
    </div>
  );
}
