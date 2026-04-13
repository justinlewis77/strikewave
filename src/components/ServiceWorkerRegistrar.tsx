"use client";

import { useEffect } from "react";
import { calculateSolunar } from "@/engine/solunar";

function parseTime(timeStr: string): Date {
  const now = new Date();
  const [timePart, ampm] = timeStr.split(" ");
  const [h, m] = timePart.split(":").map(Number);
  let hours = h;
  if (ampm === "PM" && h !== 12) hours += 12;
  if (ampm === "AM" && h === 12) hours = 0;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, m, 0, 0);
}

function getLakeName(): string {
  try {
    const settings = JSON.parse(localStorage.getItem("sw_settings") ?? "{}");
    return settings?.lake_profile?.lake_name || "your lake";
  } catch { return "your lake"; }
}

function scheduleWindow(start: string, isMajor: boolean) {
  const now = Date.now();
  const THIRTY_MIN = 30 * 60 * 1000;
  try {
    const startTime = parseTime(start);
    const fireAt = startTime.getTime() - THIRTY_MIN;
    const delay = fireAt - now;
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        if (Notification.permission !== "granted") return;
        const lake = getLakeName();
        const label = isMajor ? "🔥 MAJOR" : "Minor";
        const body = isMajor
          ? `${label} bite window starts in 30 min on ${lake} — GET ON THE WATER! Best pattern right now.`
          : `${label} bite window in 30 min on ${lake} — good window, fish are moving.`;
        new Notification("🎣 StrikeWave Bite Alert", {
          body,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
        });
      }, delay);
    }
  } catch { /* invalid time */ }
}

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const notifEnabled = localStorage.getItem("sw_notifications_enabled");
    if (notifEnabled === "true" && "Notification" in window) {
      Notification.requestPermission().then((perm) => {
        if (perm !== "granted") return;
        const solunar = calculateSolunar(new Date());
        for (const [start] of solunar.major_periods) scheduleWindow(start, true);
        for (const [start] of solunar.minor_periods) scheduleWindow(start, false);
      });
    }
  }, []);

  return null;
}
