"use client";

import { useEffect, useRef, useState } from "react";
import type { FishingSpot } from "@/engine/types";

const TYPE_COLORS: Record<FishingSpot["type"], string> = {
  shore: "#ff0080",
  boat: "#00f0ff",
  structure: "#9d00ff",
  weed_edge: "#22c55e",
};

const ACCESS_COLORS: Record<string, string> = {
  public: "#00f0ff",
  private: "#cc4444",
  seasonal: "#f5c518",
};

const TYPE_LABELS: Record<FishingSpot["type"], string> = {
  shore: "Shore",
  boat: "Boat",
  structure: "Structure",
  weed_edge: "Weed Edge",
};

function markerColor(spot: FishingSpot): string {
  return spot.access_type ? ACCESS_COLORS[spot.access_type] : TYPE_COLORS[spot.type];
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function fmtDist(m: number): string {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

const ROUTE_KEY = "sw_spot_route";

interface Props {
  spots: FishingSpot[];
  onAddSpot: (spot: FishingSpot) => void;
  onDeleteSpot: (id: string) => void;
  initialLat?: number;
  initialLon?: number;
}

function genId() { return `spot-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`; }

const BLANK_FORM = { name: "", type: "shore" as FishingSpot["type"], notes: "", access_type: "" as "" | "public" | "private" | "seasonal", parking_notes: "", bank_condition: "" as "" | FishingSpot["bank_condition"] };

export default function LeafletMap({ spots, onAddSpot, onDeleteSpot, initialLat, initialLon }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const [pendingSpot, setPendingSpot] = useState<{ lat: number; lon: number } | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [publicOnly, setPublicOnly] = useState(false);
  const [routeMode, setRouteMode] = useState(false);
  const [route, setRoute] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(ROUTE_KEY) ?? "[]"); } catch { return []; }
  });

  const visibleSpots = publicOnly ? spots.filter((s) => s.access_type === "public" || !s.access_type) : spots;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const init = async () => {
      const L = (await import("leaflet")).default;
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
    init();
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers
  useEffect(() => {
    const sync = async () => {
      const map = mapInstanceRef.current;
      if (!map) return;
      const L = (await import("leaflet")).default;
      const visIds = new Set(visibleSpots.map((s) => s.id));
      for (const [id, marker] of markersRef.current.entries()) {
        if (!visIds.has(id)) { marker.remove(); markersRef.current.delete(id); }
      }
      for (const spot of visibleSpots) {
        if (markersRef.current.has(spot.id)) continue;
        const color = markerColor(spot);
        const accessBadge = spot.access_type ? `<span style="font-size:10px;background:${ACCESS_COLORS[spot.access_type]}22;color:${ACCESS_COLORS[spot.access_type]};padding:1px 5px;border-radius:4px;margin-left:4px">${spot.access_type}</span>` : "";
        const icon = L.divIcon({
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.6);box-shadow:0 0 8px ${color}88"></div>`,
          className: "", iconSize: [14, 14], iconAnchor: [7, 7],
        });
        const marker = L.marker([spot.lat, spot.lon], { icon }).addTo(map).bindPopup(`
          <div style="font-family:sans-serif;min-width:160px">
            <strong>${spot.name}</strong>${accessBadge}<br/>
            <span style="font-size:11px;color:#666">${TYPE_LABELS[spot.type]}${spot.bank_condition ? ` · ${spot.bank_condition} bank` : ""}</span>
            ${spot.parking_notes ? `<br/><span style="font-size:11px">🅿️ ${spot.parking_notes}</span>` : ""}
            ${spot.notes ? `<br/><span style="font-size:11px">${spot.notes}</span>` : ""}
            <br/><button onclick="window.dispatchEvent(new CustomEvent('deleteSpot',{detail:'${spot.id}'}))" style="margin-top:6px;font-size:11px;color:#cc0000;background:none;border:none;cursor:pointer;padding:0">Delete spot</button>
          </div>
        `);
        markersRef.current.set(spot.id, marker);
      }
    };
    sync();
  }, [visibleSpots]);

  useEffect(() => {
    const handler = (e: Event) => onDeleteSpot((e as CustomEvent).detail as string);
    window.addEventListener("deleteSpot", handler);
    return () => window.removeEventListener("deleteSpot", handler);
  }, [onDeleteSpot]);

  const handleSave = () => {
    if (!pendingSpot || !form.name.trim()) return;
    onAddSpot({
      id: genId(),
      name: form.name,
      lat: pendingSpot.lat,
      lon: pendingSpot.lon,
      type: form.type,
      notes: form.notes || undefined,
      access_type: form.access_type || undefined,
      parking_notes: form.parking_notes || undefined,
      bank_condition: (form.bank_condition as FishingSpot["bank_condition"]) || undefined,
    });
    setPendingSpot(null);
    setForm({ ...BLANK_FORM });
  };

  const toggleRoute = (id: string) => {
    setRoute((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(ROUTE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearRoute = () => {
    setRoute([]);
    localStorage.setItem(ROUTE_KEY, "[]");
  };

  const routeSpots = route.map((id) => spots.find((s) => s.id === id)).filter(Boolean) as FishingSpot[];
  let routeTotal = 0;

  return (
    <div className="flex flex-col gap-3">
      <div ref={mapRef} className="w-full rounded-xl overflow-hidden border border-white/10" style={{ height: "380px", zIndex: 0 }} />
      <p className="text-xs text-slate-500 text-center">Tap the map to drop a pin</p>

      {/* Controls row */}
      <div className="flex gap-2">
        <button
          onClick={() => setPublicOnly((p) => !p)}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${publicOnly ? "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30" : "bg-white/5 text-slate-400 border-white/10"}`}
        >
          {publicOnly ? "✓ Public Only" : "Filter: Public Only"}
        </button>
        <button
          onClick={() => setRouteMode((r) => !r)}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${routeMode ? "bg-neon-purple/15 text-neon-purple border-neon-purple/30" : "bg-white/5 text-slate-400 border-white/10"}`}
        >
          {routeMode ? "✓ Route Planner" : "Route Planner"}
        </button>
      </div>

      {/* Route planner */}
      {routeMode && (
        <div className="glass-card p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-orbitron text-xs font-bold tracking-widest text-neon-purple uppercase">Walking Route</p>
            {route.length > 0 && (
              <button onClick={clearRoute} className="text-xs text-slate-500 hover:text-red-400">Clear</button>
            )}
          </div>
          <p className="text-xs text-slate-500">Tap spots below to add to route in order</p>
          {routeSpots.length === 0 && <p className="text-xs text-slate-600">No spots in route yet</p>}
          {routeSpots.map((s, i) => {
            const prev = routeSpots[i - 1];
            const dist = prev ? haversineM(prev.lat, prev.lon, s.lat, s.lon) : 0;
            if (i > 0) routeTotal += dist;
            return (
              <div key={s.id}>
                {i > 0 && <p className="text-xs text-slate-600 pl-4">↓ {fmtDist(dist)} walk</p>}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neon-purple w-4">{i + 1}</span>
                  <span className="text-sm text-white">{s.name}</span>
                  <span className="text-xs text-slate-500">{s.bank_condition ?? TYPE_LABELS[s.type]}</span>
                </div>
              </div>
            );
          })}
          {routeSpots.length > 1 && (
            <p className="text-xs text-neon-cyan border-t border-white/5 pt-2">Total: {fmtDist(routeTotal)} walking distance</p>
          )}
        </div>
      )}

      {/* New spot form */}
      {pendingSpot && (
        <div className="glass-card p-4 space-y-3">
          <p className="font-orbitron text-xs font-bold tracking-widest text-slate-400 uppercase">New Spot</p>
          <p className="text-xs text-slate-500">{pendingSpot.lat.toFixed(5)}, {pendingSpot.lon.toFixed(5)}</p>
          <style>{`.sf { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:0.5rem; padding:0.4rem 0.6rem; font-size:0.8rem; color:white; } .sf option { background:#1a1f2e; }`}</style>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-1">Name *</p>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="sf" placeholder="e.g. North dock corner" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Type</p>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FishingSpot["type"] }))} className="sf">
                <option value="shore">Shore</option>
                <option value="boat">Boat</option>
                <option value="structure">Structure</option>
                <option value="weed_edge">Weed Edge</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Access</p>
              <select value={form.access_type} onChange={(e) => setForm((f) => ({ ...f, access_type: e.target.value as typeof form.access_type }))} className="sf">
                <option value="">Unknown</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Bank Condition</p>
              <select value={form.bank_condition} onChange={(e) => setForm((f) => ({ ...f, bank_condition: e.target.value as typeof form.bank_condition }))} className="sf">
                <option value="">Unknown</option>
                <option value="sandy">Sandy</option>
                <option value="rocky">Rocky</option>
                <option value="muddy">Muddy</option>
                <option value="weedy">Weedy</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="sf" placeholder="Optional" />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-1">Parking Notes</p>
              <input value={form.parking_notes} onChange={(e) => setForm((f) => ({ ...f, parking_notes: e.target.value }))} className="sf" placeholder="e.g. Small pull-off on M-15, 3 cars max" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-neon-pink/15 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/25 transition-colors">Save Spot</button>
            <button onClick={() => setPendingSpot(null)} className="px-4 py-2 rounded-lg text-sm text-slate-400 bg-white/5 border border-white/10">Cancel</button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="glass-card p-3 space-y-1.5">
        <div className="flex flex-wrap gap-3">
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLORS[type as FishingSpot["type"]] }} />
              {label}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 border-t border-white/5 pt-1.5">
          {Object.entries(ACCESS_COLORS).map(([access, color]) => (
            <div key={access} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              {access}
            </div>
          ))}
        </div>
      </div>

      {/* Spot list */}
      {visibleSpots.length > 0 && (
        <div className="space-y-2">
          {visibleSpots.map((s) => {
            const color = markerColor(s);
            const inRoute = route.includes(s.id);
            return (
              <div key={s.id} className={`glass-card p-3 flex items-center justify-between ${inRoute && routeMode ? "border-neon-purple/30" : ""}`}>
                <div
                  className="flex items-center gap-2 flex-1 cursor-pointer"
                  onClick={() => routeMode && toggleRoute(s.id)}
                >
                  {routeMode && (
                    <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-bold flex-shrink-0 ${inRoute ? "border-neon-purple bg-neon-purple/20 text-neon-purple" : "border-white/20"}`}>
                      {inRoute ? route.indexOf(s.id) + 1 : ""}
                    </span>
                  )}
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <div>
                    <p className="text-sm font-medium text-white">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {TYPE_LABELS[s.type]}
                      {s.access_type && <span style={{ color }} className="ml-1">· {s.access_type}</span>}
                      {s.bank_condition && ` · ${s.bank_condition}`}
                      {s.notes && ` · ${s.notes}`}
                    </p>
                    {s.parking_notes && <p className="text-xs text-slate-600">🅿️ {s.parking_notes}</p>}
                  </div>
                </div>
                <button onClick={() => onDeleteSpot(s.id)} className="text-xs text-slate-600 hover:text-red-400 transition-colors ml-3">✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
