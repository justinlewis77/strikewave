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
  // Try localStorage cache set by settings save
  try {
    const cached = localStorage.getItem("sw_lake_name");
    if (cached) return cached;
  } catch { /* ignore */ }
  return "your lake";
}

async function scheduleViaServiceWorker(
  reg: ServiceWorkerRegistration,
  windows: { start: string; isMajor: boolean }[],
  lakeName: string
) {
  const now = Date.now();
  const THIRTY_MIN = 30 * 60 * 1000;

  for (const { start, isMajor } of windows) {
    try {
      const startTime = parseTime(start);
      const fireAt = startTime.getTime() - THIRTY_MIN;
      const delay = fireAt - now;
      // Only schedule future windows within next 14 hours
      if (delay > 0 && delay < 14 * 60 * 60 * 1000) {
        const label = isMajor ? "🔥 MAJOR" : "Minor";
        const body = isMajor
          ? `${label} bite window starts in 30 min on ${lakeName} — GET ON THE WATER!`
          : `${label} bite window in 30 min on ${lakeName} — fish are moving.`;
        reg.active?.postMessage({
          type: "SCHEDULE_NOTIFICATION",
          delay,
          title: "🎣 StrikeWave Bite Alert",
          body,
          icon: "/icons/icon-192.png",
        });
      }
    } catch { /* bad time string */ }
  }
}

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then((reg) => {
      const notifEnabled = localStorage.getItem("sw_notifications_enabled");
      if (notifEnabled !== "true") return;

      const requestAndSchedule = async () => {
        let perm = Notification.permission;
        if (perm === "default") {
          perm = await Notification.requestPermission();
        }
        if (perm !== "granted") return;

        // Wait for SW to be active
        const activeSW = reg.active ?? (await navigator.serviceWorker.ready).active;
        if (!activeSW) return;

        const solunar = calculateSolunar(new Date());
        const lakeName = getLakeName();
        const allWindows = [
          ...solunar.major_periods.map(([start]) => ({ start, isMajor: true })),
          ...solunar.minor_periods.map(([start]) => ({ start, isMajor: false })),
        ];

        await scheduleViaServiceWorker(await navigator.serviceWorker.ready, allWindows, lakeName);
      };

      requestAndSchedule().catch(() => {});
    }).catch(() => {});
  }, []);

  return null;
}
