"use client";

const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

function degToCompass(deg: number): string {
  return DIRS[Math.round(deg / 45) % 8];
}

function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

interface Props {
  wind_mph: number;
  wind_dir_deg?: number;
  bank_facing_deg: number;
  onChangeBankFacing: (deg: number) => void;
}

const BANK_OPTIONS = [
  { label: "N", deg: 0 },
  { label: "NE", deg: 45 },
  { label: "E", deg: 90 },
  { label: "SE", deg: 135 },
  { label: "S", deg: 180 },
  { label: "SW", deg: 225 },
  { label: "W", deg: 270 },
  { label: "NW", deg: 315 },
];

export function CastingAdvisor({ wind_mph, wind_dir_deg, bank_facing_deg, onChangeBankFacing }: Props) {
  const windComp = wind_dir_deg !== undefined ? degToCompass(wind_dir_deg) : null;
  const onshore = wind_dir_deg !== undefined && angleDiff(wind_dir_deg, bank_facing_deg) <= 60;
  const calm = wind_mph < 5;

  // Cast direction advice
  let castAdvice = "";
  let coverageNote = "";

  if (calm) {
    castAdvice = "Calm water — cast anywhere, focus on structure";
    coverageNote = "Fan cast to cover maximum area. Target visible cover.";
  } else if (onshore) {
    castAdvice = `Cast parallel to bank, quartering into the ${windComp} wind`;
    coverageNote = "Wind is pushing bait and baitfish to your bank. Work moving baits along the bank edge.";
  } else {
    castAdvice = `Cast downwind to the ${windComp} direction for longer casts`;
    coverageNote = "Wind is blowing off your bank. Target structure on the upwind side — bass stack on windblown points.";
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">
        Casting Advisor
      </p>

      {/* Bank facing selector */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Your bank faces:</p>
        <div className="grid grid-cols-4 gap-1">
          {BANK_OPTIONS.map((opt) => (
            <button
              key={opt.deg}
              onClick={() => onChangeBankFacing(opt.deg)}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                bank_facing_deg === opt.deg
                  ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
                  : "bg-white/5 text-slate-400 border border-white/5 hover:border-white/15"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wind info */}
      <div className="flex items-center gap-3 text-xs">
        <div className={`px-2.5 py-1 rounded-full border ${
          onshore
            ? "bg-neon-pink/10 text-neon-pink border-neon-pink/30"
            : "bg-white/5 text-slate-400 border-white/10"
        }`}>
          {calm ? "Calm" : onshore ? `Onshore Wind ${windComp}` : `Offshore Wind ${windComp}`}
        </div>
        {!calm && <span className="text-slate-500">{Math.round(wind_mph)} mph</span>}
      </div>

      {/* Advice */}
      <div className="space-y-1.5">
        <p className="text-sm text-white font-medium">{castAdvice}</p>
        <p className="text-xs text-slate-400">{coverageNote}</p>
      </div>

      {/* Compass visual */}
      <div className="flex items-center justify-center pt-1">
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            {["N","E","S","W"].map((d, i) => {
              const angle = i * 90 - 90;
              const rad = angle * Math.PI / 180;
              const x = 32 + 22 * Math.cos(rad);
              const y = 32 + 22 * Math.sin(rad);
              return <text key={d} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="rgba(255,255,255,0.3)">{d}</text>;
            })}
            {/* Bank facing arrow (cyan) */}
            {(() => {
              const rad = (bank_facing_deg - 90) * Math.PI / 180;
              const x2 = 32 + 20 * Math.cos(rad);
              const y2 = 32 + 20 * Math.sin(rad);
              return <line x1="32" y1="32" x2={x2} y2={y2} stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />;
            })()}
            {/* Wind arrow (pink) if available */}
            {wind_dir_deg !== undefined && (() => {
              const rad = (wind_dir_deg - 90) * Math.PI / 180;
              const x2 = 32 + 15 * Math.cos(rad);
              const y2 = 32 + 15 * Math.sin(rad);
              return <line x1="32" y1="32" x2={x2} y2={y2} stroke="#ff0080" strokeWidth="1.5" strokeDasharray="2,2" strokeLinecap="round" />;
            })()}
            <circle cx="32" cy="32" r="2" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>
        <div className="ml-3 space-y-1 text-xs">
          <div className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-neon-cyan" /> Bank facing</div>
          {wind_dir_deg !== undefined && <div className="flex items-center gap-1.5"><span className="inline-block w-4 border-t border-dashed border-neon-pink" /> Wind from</div>}
        </div>
      </div>
    </div>
  );
}
