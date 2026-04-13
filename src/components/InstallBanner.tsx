"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function InstallBanner() {
  const { canInstall, install } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
      <div className="glass-card p-4 flex items-center justify-between max-w-lg mx-auto"
        style={{ borderColor: "rgba(0,240,255,0.2)" }}>
        <div>
          <p className="font-orbitron text-sm font-bold neon-cyan">Install StrikeWave</p>
          <p className="text-xs text-slate-400 mt-0.5">Add to home screen for offline use</p>
        </div>
        <button
          onClick={install}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 transition-colors"
        >
          Install
        </button>
      </div>
    </div>
  );
}
