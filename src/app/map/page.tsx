"use client";

import dynamic from "next/dynamic";
import { useDB } from "@/hooks/useDB";
import { useLocation } from "@/hooks/useLocation";

// Leaflet must not render on SSR — it requires window/document
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false, loading: () => (
  <div className="w-full h-80 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
    <p className="text-sm neon-pulse text-slate-400">Loading map...</p>
  </div>
)});

export default function MapPage() {
  const { spots, saveSpot, removeSpot, settings, ready } = useDB();
  const location = useLocation(settings.use_gps);

  const lat = location.lat ?? settings.location_lat;
  const lon = location.lon ?? settings.location_lon;

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="font-orbitron neon-pulse neon-cyan text-sm tracking-widest">LOADING...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="font-orbitron text-xl font-bold tracking-wider text-white">
          Spot <span className="neon-cyan">Map</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {settings.lake_profile?.lake_name ?? "Your fishing map"} · {spots.length} saved spot{spots.length !== 1 ? "s" : ""}
        </p>
      </div>

      <LeafletMap
        spots={spots}
        onAddSpot={saveSpot}
        onDeleteSpot={removeSpot}
        initialLat={lat}
        initialLon={lon}
      />
    </div>
  );
}
