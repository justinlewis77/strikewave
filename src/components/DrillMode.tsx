"use client";

import { useState, useEffect, useRef } from "react";

const LURE_QUIZ: { img: string; name: string; hint: string }[] = [
  { img: "🎣", name: "Chatterbait", hint: "Vibrating blade bait" },
  { img: "🐸", name: "Frog", hint: "Hollow body topwater" },
  { img: "🪝", name: "Texas Rig", hint: "Bullet weight + hook in bait" },
  { img: "🎯", name: "Drop Shot", hint: "Weight below hook" },
  { img: "🌀", name: "Ned Rig", hint: "Tiny mushroom head jig" },
  { img: "💡", name: "Spinnerbait", hint: "Wire + blade(s)" },
  { img: "🐠", name: "Swimbait", hint: "Paddle tail soft plastic" },
  { img: "🏈", name: "Football Jig", hint: "Football-shaped head" },
  { img: "🔴", name: "Lipless Crank", hint: "No bill, rattles inside" },
  { img: "🌊", name: "Wacky Rig", hint: "Hook through middle of Senko" },
];

const CONDITIONS_QUIZ: { q: string; choices: string[]; correct: number; why: string }[] = [
  { q: "Water temp 52°F — fish are sluggish. Best approach?", choices: ["Burn a spinnerbait", "Dead-stick a Ned Rig", "Punch mats with 1oz weight", "Power fish chatterbait"], correct: 1, why: "Cold fish need slow presentations. Ned Rig dead-sticked is proven in cold water." },
  { q: "Barometric pressure falling fast — fish are active. Use:", choices: ["Finesse dropshot", "Burn a lipless crank or chatterbait", "Carolina rig deep", "Dead-stick wacky Senko"], correct: 1, why: "Pre-storm falling pressure triggers aggressive reaction bites. Power baits dominate." },
  { q: "Active spawn, bed fish visible at 2ft. Best bait:", choices: ["3/4oz football jig", "Wacky Senko 5\" in bed", "Chatterbait burned through", "Lipless crank yo-yo"], correct: 1, why: "Wacky Senko falling into the bed triggers the defensive instinct of spawning bass." },
  { q: "Summer — milfoil mats thick, 10am–2pm. Best pattern:", choices: ["Dropshot outside weed wall at 15ft", "Frog over the mats", "Squarebill along bank", "Both A and B"], correct: 3, why: "Both work: frog on top, dropshot outside for deep fish. Both target the same fish differently." },
  { q: "Fall turnover — shad are schooling on surface. You grab:", choices: ["Finesse drop shot", "Ned Rig", "Lipless crank burned fast", "Carolina rig"], correct: 2, why: "Match the hatch with a fast lipless crank burned over dying grass during fall shad migration." },
];

const KNOTS = ["Palomar", "Improved Clinch", "Loop Knot", "Alberto", "Double Uni"];
const DRILL_STORAGE = "sw_drill_scores";

interface DrillScores { lureHigh: number; condHigh: number; knotBest: number }

function loadScores(): DrillScores {
  try { return JSON.parse(localStorage.getItem(DRILL_STORAGE) ?? "{}"); } catch { return {} as DrillScores; }
}
function saveScores(s: DrillScores) { localStorage.setItem(DRILL_STORAGE, JSON.stringify(s)); }

type Drill = "menu" | "lure" | "conditions" | "knot";

export function DrillMode() {
  const [drill, setDrill] = useState<Drill>("menu");
  const [scores, setScores] = useState<DrillScores>({} as DrillScores);

  useEffect(() => { setScores(loadScores()); }, []);

  const updateScore = (updates: Partial<DrillScores>) => {
    const next = { ...scores, ...updates };
    setScores(next);
    saveScores(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">Practice Drills</p>
        {drill !== "menu" && (
          <button onClick={() => setDrill("menu")} className="text-xs text-slate-500 hover:text-neon-cyan">← Back</button>
        )}
      </div>

      {drill === "menu" && <DrillMenu scores={scores} onSelect={setDrill} />}
      {drill === "lure" && <LureQuiz best={scores.lureHigh ?? 0} onDone={(s) => updateScore({ lureHigh: Math.max(s, scores.lureHigh ?? 0) })} />}
      {drill === "conditions" && <ConditionsQuiz best={scores.condHigh ?? 0} onDone={(s) => updateScore({ condHigh: Math.max(s, scores.condHigh ?? 0) })} />}
      {drill === "knot" && <KnotTimer best={scores.knotBest ?? 0} onDone={(s) => updateScore({ knotBest: scores.knotBest ? Math.min(s, scores.knotBest) : s })} />}
    </div>
  );
}

function DrillMenu({ scores, onSelect }: { scores: DrillScores; onSelect: (d: Drill) => void }) {
  const items = [
    { key: "lure" as Drill, label: "Lure ID Quiz", icon: "🎣", sub: "Identify baits from clues", stat: scores.lureHigh ? `Best: ${scores.lureHigh}/${LURE_QUIZ.length}` : "Not played" },
    { key: "conditions" as Drill, label: "Conditions Quiz", icon: "🌡️", sub: "Pick the right technique", stat: scores.condHigh ? `Best: ${scores.condHigh}/${CONDITIONS_QUIZ.length}` : "Not played" },
    { key: "knot" as Drill, label: "Knot Timer", icon: "⏱️", sub: "Time your knot tying", stat: scores.knotBest ? `Best: ${scores.knotBest}s` : "Not timed" },
  ];
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <button key={item.key} onClick={() => onSelect(item.key)} className="w-full glass-card p-3 flex items-center gap-3 text-left hover:border-neon-cyan/20 transition-colors">
          <span className="text-2xl">{item.icon}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{item.label}</p>
            <p className="text-xs text-slate-500">{item.sub}</p>
          </div>
          <p className="text-xs text-neon-cyan">{item.stat}</p>
        </button>
      ))}
    </div>
  );
}

function LureQuiz({ best, onDone }: { best: number; onDone: (score: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"" | "correct" | "wrong">("");
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [shuffled] = useState(() => [...LURE_QUIZ].sort(() => Math.random() - 0.5));

  const current = shuffled[idx];

  const check = () => {
    const correct = input.toLowerCase().includes(current.name.toLowerCase().split(" ")[0].toLowerCase());
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      setResult("");
      setInput("");
      if (idx + 1 >= shuffled.length) { setDone(true); onDone(score + (correct ? 1 : 0)); }
      else setIdx((i) => i + 1);
    }, 1000);
  };

  if (done) return (
    <div className="glass-card p-6 text-center space-y-2">
      <p className="text-2xl font-bold text-white">{score}/{shuffled.length}</p>
      <p className="text-xs text-slate-400">{score >= shuffled.length * 0.8 ? "🔥 Excellent! You know your baits." : "Keep studying the tackle!"}</p>
      {best > 0 && <p className="text-xs text-slate-600">Previous best: {best}/{shuffled.length}</p>}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{idx + 1}/{shuffled.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className={`glass-card p-5 text-center space-y-2 transition-colors ${result === "correct" ? "border-neon-cyan/40" : result === "wrong" ? "border-neon-pink/40" : ""}`}>
        <p className="text-4xl">{current.img}</p>
        <p className="text-xs text-slate-400 italic">{current.hint}</p>
        <p className="text-xs text-slate-500">Name this bait</p>
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && input && check()}
          placeholder="Type bait name..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" />
        <button onClick={check} disabled={!input} className="px-4 py-2 rounded-lg text-sm font-semibold bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 disabled:opacity-40">Check</button>
      </div>
      {result === "wrong" && <p className="text-xs text-center text-neon-pink">Answer: {current.name}</p>}
    </div>
  );
}

function ConditionsQuiz({ best, onDone }: { best: number; onDone: (score: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [shuffled] = useState(() => [...CONDITIONS_QUIZ].sort(() => Math.random() - 0.5));

  const current = shuffled[idx];
  const correct = selected === current.correct;

  const pick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const isCorrect = i === current.correct;
    if (isCorrect) setScore((s) => s + 1);
    setTimeout(() => {
      setSelected(null);
      if (idx + 1 >= shuffled.length) { setDone(true); onDone(score + (isCorrect ? 1 : 0)); }
      else setIdx((i) => i + 1);
    }, 1800);
  };

  if (done) return (
    <div className="glass-card p-6 text-center space-y-2">
      <p className="text-2xl font-bold text-white">{score}/{shuffled.length}</p>
      <p className="text-xs text-slate-400">{score >= shuffled.length * 0.8 ? "🔥 Solid fishing IQ!" : "Study seasonal patterns more."}</p>
      {best > 0 && <p className="text-xs text-slate-600">Previous best: {best}/{shuffled.length}</p>}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{idx + 1}/{shuffled.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className="glass-card p-4">
        <p className="text-sm font-semibold text-white leading-relaxed">{current.q}</p>
      </div>
      <div className="space-y-2">
        {current.choices.map((choice, i) => {
          const isCorrect = i === current.correct;
          const isPicked = selected === i;
          let cls = "bg-white/5 border-white/10 text-slate-300";
          if (selected !== null) {
            if (isCorrect) cls = "bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan";
            else if (isPicked) cls = "bg-neon-pink/15 border-neon-pink/40 text-neon-pink";
          }
          return (
            <button key={i} onClick={() => pick(i)} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${cls}`}>
              {choice}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <p className="text-xs text-slate-400 px-1 leading-relaxed">{correct ? "✓ " : "✗ "}{current.why}</p>
      )}
    </div>
  );
}

function KnotTimer({ best, onDone }: { best: number; onDone: (seconds: number) => void }) {
  const [knotIdx] = useState(() => Math.floor(Math.random() * KNOTS.length));
  const [state, setState] = useState<"ready" | "running" | "done">("ready");
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const start = () => {
    startRef.current = Date.now();
    setState("running");
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    setState("done");
    onDone(elapsed);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div className="space-y-4">
      <div className="glass-card p-5 text-center space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-widest">Tie this knot</p>
        <p className="text-2xl font-bold text-white">{KNOTS[knotIdx]}</p>
        {best > 0 && <p className="text-xs text-slate-600">Best time: {best}s</p>}
      </div>

      {state === "ready" && (
        <button onClick={start} className="w-full py-3 rounded-xl font-bold text-sm bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/25 transition-colors">
          Start Timer
        </button>
      )}

      {state === "running" && (
        <div className="space-y-3">
          <p className="text-center text-4xl font-bold font-orbitron neon-cyan">{elapsed}s</p>
          <button onClick={stop} className="w-full py-3 rounded-xl font-bold text-sm bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25 transition-colors">
            Done — Stop Timer
          </button>
        </div>
      )}

      {state === "done" && (
        <div className="glass-card p-4 text-center space-y-1">
          <p className="text-2xl font-bold text-white">{elapsed}s</p>
          <p className="text-xs text-slate-400">{elapsed < 15 ? "🔥 Fast hands!" : elapsed < 30 ? "Good — keep practicing" : "Practice until under 20s"}</p>
          {best > 0 && elapsed < best && <p className="text-xs text-neon-cyan">New best!</p>}
        </div>
      )}
    </div>
  );
}
