"use client";

import { openDB, type IDBPDatabase } from "idb";
import type { RodSetup, Lure, SoftPlastic, AppSettings, CatchEntry, FishingSpot, FishingReport } from "@/engine/types";

const DB_NAME = "strikewave";
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("rods", { keyPath: "id" });
          db.createObjectStore("lures", { keyPath: "id" });
          db.createObjectStore("plastics", { keyPath: "id" });
          db.createObjectStore("settings", { keyPath: "id" });
        }
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains("catches")) {
            db.createObjectStore("catches", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("spots")) {
            db.createObjectStore("spots", { keyPath: "id" });
          }
        }
        if (oldVersion < 3) {
          if (!db.objectStoreNames.contains("reports")) {
            db.createObjectStore("reports", { keyPath: "id" });
          }
        }
      },
    });
  }
  return dbPromise;
}

// ── Rods ──────────────────────────────────────────────
export async function getRods(): Promise<RodSetup[]> {
  const db = await getDB();
  return db.getAll("rods");
}
export async function putRod(rod: RodSetup): Promise<void> {
  const db = await getDB();
  await db.put("rods", rod);
}
export async function deleteRod(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("rods", id);
}

// ── Lures ─────────────────────────────────────────────
export async function getLures(): Promise<Lure[]> {
  const db = await getDB();
  return db.getAll("lures");
}
export async function putLure(lure: Lure): Promise<void> {
  const db = await getDB();
  await db.put("lures", lure);
}
export async function deleteLure(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("lures", id);
}

// ── Soft Plastics ─────────────────────────────────────
export async function getPlastics(): Promise<SoftPlastic[]> {
  const db = await getDB();
  return db.getAll("plastics");
}
export async function putPlastic(plastic: SoftPlastic): Promise<void> {
  const db = await getDB();
  await db.put("plastics", plastic);
}
export async function deletePlastic(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("plastics", id);
}

// ── Catches ───────────────────────────────────────────
export async function getCatches(): Promise<CatchEntry[]> {
  const db = await getDB();
  return db.getAll("catches");
}
export async function putCatch(entry: CatchEntry): Promise<void> {
  const db = await getDB();
  await db.put("catches", entry);
}
export async function deleteCatch(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("catches", id);
}

// ── Spots ─────────────────────────────────────────────
export async function getSpots(): Promise<FishingSpot[]> {
  const db = await getDB();
  return db.getAll("spots");
}
export async function putSpot(spot: FishingSpot): Promise<void> {
  const db = await getDB();
  await db.put("spots", spot);
}
export async function deleteSpot(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("spots", id);
}

// ── Reports ───────────────────────────────────────────
export async function getReports(): Promise<FishingReport[]> {
  const db = await getDB();
  return db.getAll("reports");
}
export async function putReport(r: FishingReport): Promise<void> {
  const db = await getDB();
  await db.put("reports", r);
}
export async function deleteReport(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("reports", id);
}

// ── Settings ──────────────────────────────────────────
export async function getSettings(): Promise<AppSettings | null> {
  const db = await getDB();
  const row = await db.get("settings", "singleton");
  if (!row) return null;
  const { id: _id, ...rest } = row as AppSettings & { id: string };
  return rest as AppSettings;
}
export async function putSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put("settings", { ...settings, id: "singleton" });
}

// ── Export / Import ───────────────────────────────────
export async function exportData(): Promise<object> {
  const [rods, lures, plastics, catches, spots, settings] = await Promise.all([
    getRods(), getLures(), getPlastics(), getCatches(), getSpots(), getSettings(),
  ]);
  return { rods, lures, plastics, catches, spots, settings, exported_at: new Date().toISOString() };
}

export async function importData(data: {
  rods?: RodSetup[];
  lures?: Lure[];
  plastics?: SoftPlastic[];
  catches?: CatchEntry[];
  spots?: FishingSpot[];
  settings?: AppSettings;
}): Promise<void> {
  const db = await getDB();
  const stores = ["rods", "lures", "plastics", "catches", "spots", "settings"] as const;
  const tx = db.transaction([...stores], "readwrite");

  if (data.rods) for (const r of data.rods) await tx.objectStore("rods").put(r);
  if (data.lures) for (const l of data.lures) await tx.objectStore("lures").put(l);
  if (data.plastics) for (const p of data.plastics) await tx.objectStore("plastics").put(p);
  if (data.catches) for (const c of data.catches) await tx.objectStore("catches").put(c);
  if (data.spots) for (const s of data.spots) await tx.objectStore("spots").put(s);
  if (data.settings) await tx.objectStore("settings").put({ ...data.settings, id: "singleton" });

  await tx.done;
}
