"use client";

const COLOR_MAP: Record<string, string> = {
  "chartreuse": "#7fff00",
  "watermelon": "#2d5a27",
  "watermelon red": "#3d6b2a",
  "green pumpkin": "#4a5e2a",
  "black blue": "#1a1a4e",
  "black/blue": "#1a1a4e",
  "black": "#1a1a1a",
  "white": "#f0f0f0",
  "chrome": "#c0c0c0",
  "chrome blue": "#4a7ab5",
  "red craw": "#8b1a1a",
  "red crawfish": "#8b1a1a",
  "natural shad": "#a8a8c0",
  "sexy shad": "#8080a0",
  "ghost shad": "#c8c8d8",
  "ghost": "#d0d0e0",
  "junebug": "#3d1a5e",
  "purple": "#6b21a8",
  "blue": "#1d4ed8",
  "silver": "#b8b8c0",
  "gold": "#c8a820",
  "firetiger": "#e8a800",
  "brown": "#6b4226",
  "oxblood": "#5c1a1a",
  "pumpkin": "#8b4513",
  "smoke": "#a0a0b0",
  "pink": "#ff69b4",
  "hot pink": "#ff1493",
  "orange": "#f97316",
  "yellow": "#eab308",
  "pro blue red pearl": "#1e40af",
  "electric shad": "#60a5fa",
  "aaron's magic": "#9ca3af",
};

function getSwatchColor(colorName: string): string | null {
  if (!colorName) return null;
  const lower = colorName.toLowerCase().trim();
  // Exact match
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  // Partial match
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

interface Props {
  color: string;
  size?: "sm" | "md";
}

export function ColorSwatch({ color, size = "sm" }: Props) {
  const hex = getSwatchColor(color);
  if (!hex) return <span className="text-slate-400">{color}</span>;

  const sz = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`${sz} rounded-full inline-block flex-shrink-0 border border-white/20`}
        style={{ backgroundColor: hex }}
        title={color}
      />
      <span className="text-slate-400">{color}</span>
    </span>
  );
}
