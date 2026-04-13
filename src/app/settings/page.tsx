"use client";

import { useState } from "react";
import { useDB } from "@/hooks/useDB";
import { useLocation } from "@/hooks/useLocation";
import { exportData, importData } from "@/lib/db";
import type { AppSettings, WaterClarity } from "@/engine/types";

export default function SettingsPage() {
  const { settings, saveSettings, ready, reload } = useDB();
  const location = useLocation(settings.use_gps);
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState<AppSettings>({
    ...settings,
  });

  const handleSave = async () => {
    await saveSettings(form);
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

  if (!ready) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-orbitron text-xl font-bold tracking-wider text-white">
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure app behavior and data</p>
      </div>

      {/* Location */}
      <section className="glass-card p-4 space-y-4">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Location</p>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm text-white">Use GPS</p>
            <p className="text-xs text-slate-500">Auto-detect location for weather</p>
          </div>
          <div
            className={`relative w-11 h-6 rounded-full transition-colors ${form.use_gps ? "bg-neon-cyan/30 border border-neon-cyan/40" : "bg-white/10 border border-white/10"}`}
            onClick={() => setForm((f) => ({ ...f, use_gps: !f.use_gps }))}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${form.use_gps ? "left-5 bg-neon-cyan" : "left-0.5 bg-slate-400"}`} />
          </div>
        </label>

        {location.name && (
          <p className="text-xs text-slate-500">
            Detected: <span className="text-slate-300">{location.name}</span>
            {location.lat && (
              <span className="ml-2 text-slate-600">
                ({location.lat.toFixed(3)}, {location.lon?.toFixed(3)})
              </span>
            )}
          </p>
        )}

        {!form.use_gps && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={form.location_lat ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, location_lat: parseFloat(e.target.value) || undefined }))}
                placeholder="e.g. 36.1627"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={form.location_lon ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, location_lon: parseFloat(e.target.value) || undefined }))}
                placeholder="e.g. -86.7816"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
        )}
      </section>

      {/* Conditions */}
      <section className="glass-card p-4 space-y-4">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Default Conditions</p>

        <div>
          <label className="text-xs text-slate-500 block mb-1">Water Clarity</label>
          <select
            value={form.water_clarity}
            onChange={(e) => setForm((f) => ({ ...f, water_clarity: e.target.value as WaterClarity }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="clear">Clear</option>
            <option value="stained">Stained</option>
            <option value="muddy">Muddy</option>
          </select>
        </div>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-3 rounded-xl font-orbitron font-bold text-sm tracking-wider bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25 transition-colors"
      >
        {saved ? "SAVED ✓" : "SAVE SETTINGS"}
      </button>

      {/* Data */}
      <section className="glass-card p-4 space-y-3">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Data</p>

        <button
          onClick={handleExport}
          className="w-full py-2.5 rounded-lg text-sm font-semibold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 hover:bg-neon-cyan/15 transition-colors"
        >
          Export Backup (JSON)
        </button>

        <label className="block">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <div className="w-full py-2.5 rounded-lg text-sm font-semibold text-center bg-white/5 text-slate-300 border border-white/10 hover:bg-white/8 transition-colors cursor-pointer">
            {importing ? "Importing..." : "Import Backup (JSON)"}
          </div>
        </label>

        {msg && (
          <p className={`text-xs ${msg.includes("fail") ? "text-red-400" : "text-neon-cyan"}`}>
            {msg}
          </p>
        )}
      </section>

      {/* About */}
      <section className="glass-card p-4 space-y-1">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">About</p>
        <p className="text-xs text-slate-500 pt-1">StrikeWave v0.1.0 — Seasonal Bass Engine</p>
        <p className="text-xs text-slate-600">Weather: Open-Meteo · Water temp: USGS NWIS · Geocoding: Nominatim</p>
        <p className="text-xs text-slate-600">AI Guide: Anthropic claude-haiku-4-5</p>
      </section>
    </div>
  );
}
