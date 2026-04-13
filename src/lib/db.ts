"use client";

import { openDB, type IDBPDatabase } from "idb";
import type { RodSetup, Lure, SoftPlastic, AppSettings } from "@/engine/types";

const DB_NAME = "strikewave";
const DB_VERSION = 1;

export interface StrikeWaveDB {
  rods: RodSetup;
  lures: Lure;
  plastics: SoftPlastic;
  settings: AppSettings & { id: "singleton" };
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("rods")) {
          db.createObjectStore("rods", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("lures")) {
          db.createObjectStore("lures", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("plastics")) {
          db.createObjectStore("plastics", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
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
  const [rods, lures, plastics, settings] = await Promise.all([
    getRods(), getLures(), getPlastics(), getSettings(),
  ]);
  return { rods, lures, plastics, settings, exported_at: new Date().toISOString() };
}

export async function importData(data: {
  rods?: RodSetup[];
  lures?: Lure[];
  plastics?: SoftPlastic[];
  settings?: AppSettings;
}): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["rods", "lures", "plastics", "settings"], "readwrite");

  if (data.rods) {
    for (const rod of data.rods) await tx.objectStore("rods").put(rod);
  }
  if (data.lures) {
    for (const lure of data.lures) await tx.objectStore("lures").put(lure);
  }
  if (data.plastics) {
    for (const p of data.plastics) await tx.objectStore("plastics").put(p);
  }
  if (data.settings) {
    await tx.objectStore("settings").put({ ...data.settings, id: "singleton" });
  }

  await tx.done;
}
