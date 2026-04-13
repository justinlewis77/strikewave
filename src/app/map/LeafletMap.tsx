"use client";

import { useEffect, useRef, useState } from "react";
import type { FishingSpot } from "@/engine/types";

const SPOT_COLORS: Record<FishingSpot["type"], string> = {
  shore: "#ff0080",
  boat: "#00f0ff",
  structure: "#9d00ff",
  weed_edge: "#22c55e",
};

const SPOT_LABELS: Record<FishingSpot["type"], string> = {
  shore: "Shore",
  boat: "Boat",
  structure: "Structure",
  weed_edge: "Weed Edge",
};

interface Props {
  spots: FishingSpot[];
  onAddSpot: (spot: FishingSpot) => void;
  onDeleteSpot: (id: string) => void;
  initialLat?: number;
  initialLon?: number;
}

function genId() { return `spot-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`; }

export default function LeafletMap({ spots, onAddSpot, onDeleteSpot, initialLat, initialLon }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const [pendingSpot, setPendingSpot] = useState<{ lat: number; lon: number } | null>(null);
  const [newSpotForm, setNewSpotForm] = useState({ name: "", type: "shore" as FishingSpot["type"], notes: "" });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon paths for Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const lat = initialLat ?? 42.9634;
      const lon = initialLon ?? -83.6875;

      const map = L.map(mapRef.current!).setView([lat, lon], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        setPendingSpot({ lat: e.latlng.lat, lon: e.latlng.lng });
      });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers with spots
  useEffect(() => {
    const syncMarkers = async () => {
      const map = mapInstanceRef.current;
      if (!map) return;
      const L = (await import("leaflet")).default;

      const spotIds = new Set(spots.map((s) => s.id));

      // Remove markers for deleted spots
      for (const [id, marker] of markersRef.current.entries()) {
        if (!spotIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      }

      // Add new markers
      for (const spot of spots) {
        if (markersRef.current.has(spot.id)) continue;

        const color = SPOT_COLORS[spot.type];
        const icon = L.divIcon({
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.6);box-shadow:0 0 8px ${color}88"></div>`,
          className: "",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([spot.lat, spot.lon], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:140px">
              <strong style="color:#1a1a1a">${spot.name}</strong><br/>
              <span style="font-size:11px;color:#666">${SPOT_LABELS[spot.type]}</span>
              ${spot.notes ? `<br/><span style="font-size:11px">${spot.notes}</span>` : ""}
              <br/><button onclick="window.dispatchEvent(new CustomEvent('deleteSpot',{detail:'${spot.id}'}))" style="margin-top:6px;font-size:11px;color:#cc0000;background:none;border:none;cursor:pointer;padding:0">Delete spot</button>
            </div>
          `);

        markersRef.current.set(spot.id, marker);
      }
    };

    syncMarkers();
  }, [spots]);

  // Listen for delete events from popups
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail as string;
      onDeleteSpot(id);
    };
    window.addEventListener("deleteSpot", handler);
    return () => window.removeEventListener("deleteSpot", handler);
  }, [onDeleteSpot]);

  const handleSavePendingSpot = () => {
    if (!pendingSpot || !newSpotForm.name.trim()) return;
    onAddSpot({
      id: genId(),
      name: newSpotForm.name,
      lat: pendingSpot.lat,
      lon: pendingSpot.lon,
      type: newSpotForm.type,
      notes: newSpotForm.notes || undefined,
    });
    setPendingSpot(null);
    setNewSpotForm({ name: "", type: "shore", notes: "" });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Map */}
      <div
        ref={mapRef}
        className="w-full rounded-xl overflow-hidden border border-white/10"
        style={{ height: "380px", zIndex: 0 }}
      />

      {/* Tap hint */}
      <p className="text-xs text-slate-500 text-center">Tap the map to drop a pin</p>

      {/* Pending spot form */}
      {pendingSpot && (
        <div className="glass-card p-4 space-y-3">
          <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">New Spot</p>
          <p className="text-xs text-slate-500">{pendingSpot.lat.toFixed(5)}, {pendingSpot.lon.toFixed(5)}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-1">Name *</p>
              <input value={newSpotForm.name} onChange={(e) => setNewSpotForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" placeholder="e.g. North dock corner" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Type</p>
              <select value={newSpotForm.type} onChange={(e) => setNewSpotForm((f) => ({ ...f, type: e.target.value as FishingSpot["type"] }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="shore">Shore</option>
                <option value="boat">Boat</option>
                <option value="structure">Structure</option>
                <option value="weed_edge">Weed Edge</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <input value={newSpotForm.notes} onChange={(e) => setNewSpotForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" placeholder="Optional" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSavePendingSpot} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25 transition-colors">Save Spot</button>
            <button onClick={() => setPendingSpot(null)} className="px-4 py-2 rounded-lg text-sm text-slate-400 bg-white/5 border border-white/10">Cancel</button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="glass-card p-3 flex flex-wrap gap-3">
        {Object.entries(SPOT_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: SPOT_COLORS[type as FishingSpot["type"]] }} />
            {label}
          </div>
        ))}
      </div>

      {/* Spot list */}
      {spots.length > 0 && (
        <div className="space-y-2">
          {spots.map((s) => (
            <div key={s.id} className="glass-card p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: SPOT_COLORS[s.type] }} />
                <div>
                  <p className="text-sm font-medium text-white">{s.name}</p>
                  <p className="text-xs text-slate-500">{SPOT_LABELS[s.type]}{s.notes ? ` · ${s.notes}` : ""}</p>
                </div>
              </div>
              <button onClick={() => onDeleteSpot(s.id)} className="text-xs text-slate-600 hover:text-red-400 transition-colors ml-3">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
