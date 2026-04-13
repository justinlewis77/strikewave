"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useDB } from "@/hooks/useDB";
import { useLocation } from "@/hooks/useLocation";
import { useWeather } from "@/hooks/useWeather";
import { useAIGuide } from "@/hooks/useAIGuide";
import { detectSpawnStage, detectSeason } from "@/engine/recommender";
import { calculateSolunar } from "@/engine/solunar";
import type { ConditionSnapshot } from "@/engine/types";
import { SeasonalPatternCard } from "@/components/SeasonalPatternCard";
import { KnotGuide } from "@/components/KnotGuide";
import { TackleChecklist } from "@/components/TackleChecklist";
import { BaitTuningGuide } from "@/components/BaitTuningGuide";
import { SeasonalWeedGuide } from "@/components/SeasonalWeedGuide";
import { DrillMode } from "@/components/DrillMode";
import { FishingReportLog } from "@/components/FishingReportLog";

const QUICK_PROMPTS = [
  "What's my best setup for right now?",
  "How should I adjust for this water temp?",
  "Top 3 lures for these conditions?",
  "What color should I throw in this water clarity?",
  "Where should I look for bass right now?",
];

export default function GuidePage() {
  const { rods, plastics, settings, reports, ready, saveReport, removeReport } = useDB();
  const location = useLocation(settings.use_gps);
  const lat = location.lat ?? settings.location_lat ?? null;
  const lon = location.lon ?? settings.location_lon ?? null;
  const { weather } = useWeather(lat, lon);
  const { messages, loading, error, sendMessage, clearSession } = useAIGuide();
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"chat" | "patterns" | "tools" | "drills">("chat");
  const bottomRef = useRef<HTMLDivElement>(null);

  const snapshot = useMemo<ConditionSnapshot | null>(() => {
    if (!weather) return null;
    const now = new Date();
    const month = now.getMonth() + 1;
    return {
      weather,
      solunar: calculateSolunar(now),
      season: detectSeason(month),
      spawn_stage: detectSpawnStage(weather.water_temp_f, month),
      water_clarity: settings.water_clarity,
      fishing_mode: settings.fishing_mode ?? "shore",
      lake_profile: settings.lake_profile,
      timestamp: Date.now(),
    };
  }, [weather, settings]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");
    await sendMessage(q, snapshot, rods, plastics);
  };

  if (!ready) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col" style={{ height: "calc(100dvh - 4rem)" }}>
      {/* Header + tab switcher */}
      <div className="flex-shrink-0 mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-orbitron text-xl font-bold tracking-wider">
            AI <span className="neon-cyan">Guide</span>
          </h1>
          {messages.length > 0 && tab === "chat" && (
            <button onClick={clearSession} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Clear</button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 rounded-xl">
          {([["chat", "🤖 AI Chat"], ["patterns", "📅 Seasonal"], ["tools", "🎣 Tools"], ["drills", "🏆 Drills"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${tab === key ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30" : "text-slate-400"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools tab */}
      {tab === "tools" && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {snapshot && (
            <div className="glass-card p-4">
              <TackleChecklist spawn_stage={snapshot.spawn_stage} />
            </div>
          )}
          {snapshot && (
            <div className="glass-card p-4">
              <BaitTuningGuide spawn_stage={snapshot.spawn_stage} clarity={snapshot.water_clarity} wt={snapshot.weather.water_temp_f ?? 60} />
            </div>
          )}
          <div className="glass-card p-4">
            <KnotGuide />
          </div>
          {snapshot && (
            <div className="glass-card p-4">
              <SeasonalWeedGuide current_stage={snapshot.spawn_stage} />
            </div>
          )}
          <div className="glass-card p-4">
            <FishingReportLog
              reports={reports}
              fishing_mode={settings.fishing_mode ?? "shore"}
              onSave={saveReport}
              onDelete={removeReport}
            />
          </div>
        </div>
      )}

      {/* Drills tab */}
      {tab === "drills" && (
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="glass-card p-4">
            <DrillMode />
          </div>
        </div>
      )}

      {/* Patterns tab */}
      {tab === "patterns" && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {snapshot && <SeasonalPatternCard spawn_stage={snapshot.spawn_stage} />}
          {!snapshot && (
            <div className="glass-card p-4">
              <p className="text-sm text-slate-400">Set your location to see the current seasonal pattern, or browse all stages below.</p>
            </div>
          )}
          {/* Show all stages for browsing */}
          {(["winter_pattern", "early_pre_spawn", "late_pre_spawn", "active_spawn", "post_spawn", "summer_pattern", "fall_turnover"] as const)
            .filter((s) => !snapshot || s !== snapshot.spawn_stage)
            .map((stage) => (
              <SeasonalPatternCard key={stage} spawn_stage={stage} />
            ))}
        </div>
      )}

      {/* Chat tab */}
      {tab === "chat" && (
        <>
          {error?.includes("not configured") && (
            <div className="glass-card p-4 mb-3 border border-yellow-500/20 flex-shrink-0">
              <p className="text-sm text-yellow-400 font-semibold">AI Guide Not Configured</p>
              <p className="text-xs text-slate-400 mt-1">
                Add your <code className="text-neon-cyan">ANTHROPIC_API_KEY</code> to <code className="text-slate-300">.env.local</code> to enable the AI guide.
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
            {messages.length === 0 && (
              <div className="glass-card p-4">
                <p className="font-orbitron text-xs font-bold neon-cyan mb-2">QUICK PROMPTS</p>
                <div className="space-y-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleSend(p)}
                      className="w-full text-left text-sm text-slate-300 hover:text-white bg-white/5 hover:bg-white/8 px-3 py-2 rounded-lg transition-colors border border-white/5 hover:border-neon-cyan/20"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-neon-pink/15 text-white border border-neon-pink/20"
                    : "glass-card text-slate-200"
                }`}>
                  <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="glass-card px-4 py-2.5 rounded-xl">
                  <p className="text-sm neon-pulse text-slate-400">Thinking...</p>
                </div>
              </div>
            )}

            {error && !error.includes("not configured") && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask the guide..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-neon-cyan/40 transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
