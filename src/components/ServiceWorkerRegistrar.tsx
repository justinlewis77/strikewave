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

function scheduleNotifications(periods: [string, string][], label: string) {
  const now = Date.now();
  const THIRTY_MIN = 30 * 60 * 1000;

  for (const [start] of periods) {
    try {
      const startTime = parseTime(start);
      const fireAt = startTime.getTime() - THIRTY_MIN;
      const delay = fireAt - now;
      if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification("🎣 StrikeWave Bite Alert", {
              body: `${label} bite window starts in 30 min — get to the water!`,
              icon: "/icons/icon-192.png",
              badge: "/icons/icon-192.png",
            });
          }
        }, delay);
      }
    } catch {
      // Invalid time string — skip
    }
  }
}

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Request notification permission if enabled in settings
    const notifEnabled = localStorage.getItem("sw_notifications_enabled");
    if (notifEnabled === "true" && "Notification" in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          const solunar = calculateSolunar(new Date());
          scheduleNotifications(solunar.major_periods, "🔥 Major");
          scheduleNotifications(solunar.minor_periods, "Minor");
        }
      });
    }
  }, []);

  return null;
}
