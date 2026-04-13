"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getRods, putRod, deleteRod,
  getLures, putLure, deleteLure,
  getPlastics, putPlastic, deletePlastic,
  getCatches, putCatch, deleteCatch,
  getSpots, putSpot, deleteSpot,
  getReports, putReport, deleteReport,
  getSettings, putSettings,
} from "@/lib/db";
import { SEED_RODS, SEED_LURES, SEED_PLASTICS } from "@/lib/seed";
import type { RodSetup, Lure, SoftPlastic, AppSettings, CatchEntry, FishingSpot, FishingReport } from "@/engine/types";

const DEFAULT_SETTINGS: AppSettings = {
  water_clarity: "stained",
  use_gps: true,
  fishing_mode: "shore",
  theme: "dark",
};

export function useDB() {
  const [rods, setRods] = useState<RodSetup[]>([]);
  const [lures, setLures] = useState<Lure[]>([]);
  const [plastics, setPlastics] = useState<SoftPlastic[]>([]);
  const [catches, setCatches] = useState<CatchEntry[]>([]);
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [reports, setReports] = useState<FishingReport[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  const loadAll = useCallback(async () => {
    const [r, l, p, c, sp, rp, s] = await Promise.all([
      getRods(), getLures(), getPlastics(), getCatches(), getSpots(), getReports(), getSettings(),
    ]);

    if (r.length === 0) {
      for (const rod of SEED_RODS) await putRod(rod);
      setRods(SEED_RODS);
    } else { setRods(r); }

    if (l.length === 0) {
      for (const lure of SEED_LURES) await putLure(lure);
      setLures(SEED_LURES);
    } else { setLures(l); }

    if (p.length === 0) {
      for (const plastic of SEED_PLASTICS) await putPlastic(plastic);
      setPlastics(SEED_PLASTICS);
    } else { setPlastics(p); }

    setCatches(c);
    setSpots(sp);
    setReports(rp);
    setSettings(s ?? DEFAULT_SETTINGS);
    setReady(true);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Rods
  const saveRod = useCallback(async (rod: RodSetup) => {
    await putRod(rod);
    setRods((prev) => {
      const idx = prev.findIndex((r) => r.id === rod.id);
      return idx >= 0 ? prev.map((r) => (r.id === rod.id ? rod : r)) : [...prev, rod];
    });
  }, []);
  const removeRod = useCallback(async (id: string) => {
    await deleteRod(id);
    setRods((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Lures
  const saveLure = useCallback(async (lure: Lure) => {
    await putLure(lure);
    setLures((prev) => {
      const idx = prev.findIndex((l) => l.id === lure.id);
      return idx >= 0 ? prev.map((l) => (l.id === lure.id ? lure : l)) : [...prev, lure];
    });
  }, []);
  const removeLure = useCallback(async (id: string) => {
    await deleteLure(id);
    setLures((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // Plastics
  const savePlastic = useCallback(async (plastic: SoftPlastic) => {
    await putPlastic(plastic);
    setPlastics((prev) => {
      const idx = prev.findIndex((p) => p.id === plastic.id);
      return idx >= 0 ? prev.map((p) => (p.id === plastic.id ? plastic : p)) : [...prev, plastic];
    });
  }, []);
  const removePlastic = useCallback(async (id: string) => {
    await deletePlastic(id);
    setPlastics((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Catches
  const saveCatch = useCallback(async (entry: CatchEntry) => {
    await putCatch(entry);
    setCatches((prev) => {
      const idx = prev.findIndex((c) => c.id === entry.id);
      return idx >= 0 ? prev.map((c) => (c.id === entry.id ? entry : c)) : [...prev, entry];
    });
  }, []);
  const removeCatch = useCallback(async (id: string) => {
    await deleteCatch(id);
    setCatches((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Spots
  const saveSpot = useCallback(async (spot: FishingSpot) => {
    await putSpot(spot);
    setSpots((prev) => {
      const idx = prev.findIndex((s) => s.id === spot.id);
      return idx >= 0 ? prev.map((s) => (s.id === spot.id ? spot : s)) : [...prev, spot];
    });
  }, []);
  const removeSpot = useCallback(async (id: string) => {
    await deleteSpot(id);
    setSpots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Reports
  const saveReport = useCallback(async (r: FishingReport) => {
    await putReport(r);
    setReports((prev) => {
      const idx = prev.findIndex((x) => x.id === r.id);
      return idx >= 0 ? prev.map((x) => (x.id === r.id ? r : x)) : [...prev, r];
    });
  }, []);
  const removeReport = useCallback(async (id: string) => {
    await deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Settings
  const saveSettings = useCallback(async (s: AppSettings) => {
    await putSettings(s);
    setSettings(s);
  }, []);

  return {
    rods, lures, plastics, catches, spots, reports, settings, ready,
    saveRod, removeRod,
    saveLure, removeLure,
    savePlastic, removePlastic,
    saveCatch, removeCatch,
    saveSpot, removeSpot,
    saveReport, removeReport,
    saveSettings,
    reload: loadAll,
  };
}
