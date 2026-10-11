import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LL = { lat: number; lng: number } | undefined;
const scooterIcon = L.divIcon({ className: 'live-bike', html: '<span>🛵</span>', iconSize: [42, 42], iconAnchor: [21, 21] });
const pinIcon = L.divIcon({ className: 'live-destination', html: '<span style="color:#ef4444;font-size:30px">📍</span>', iconSize: [32, 32], iconAnchor: [16, 16] });

const km = (a: [number, number], b: [number, number]) => {
  const R = 6371, r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLng = (b[1] - a[1]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const pathKm = (p: [number, number][]) => p.slice(1).reduce((n, pt, i) => n + km(p[i]!, pt), 0);

// Smoothly glides the scooter between real GPS updates (no simulated movement).
function useSmooth(target: [number, number] | undefined) {
  const [pos, setPos] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (!target) return;
    const start = from.current ?? target, t0 = performance.now();
    let raf = 0;
    const step = (t: number) => { const k = Math.min(1, (t - t0) / 1500); const p: [number, number] = [start[0] + (target[0] - start[0]) * k, start[1] + (target[1] - start[1]) * k]; from.current = p; setPos(p); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target?.[0], target?.[1]]);
  return pos;
}

// Free geocoding (no key): Nominatim first, Photon fallback. Cached per address.
const geoCache = new Map<string, { lat: number; lng: number } | null>();
async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  if (geoCache.has(address)) return geoCache.get(address)!;
  let hit: { lat: number; lng: number } | null = null;
  try { const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=za&limit=1&q=${encodeURIComponent(address)}`); const d = await r.json(); if (d?.[0]) hit = { lat: +d[0].lat, lng: +d[0].lon }; } catch { /* fall through */ }
  if (!hit) { try { const r = await fetch(`https://photon.komoot.io/api/?limit=1&q=${encodeURIComponent(address + ', South Africa')}`); const d = await r.json(); const c = d?.features?.[0]?.geometry?.coordinates; if (c) hit = { lat: c[1], lng: c[0] }; } catch { /* none */ } }
  geoCache.set(address, hit); return hit;
}
const fmtDur = (min: number) => min >= 60 ? `${Math.floor(min / 60)} hr ${min % 60} min` : `${min} min`;

function Follow({ position, follow }: { position: [number, number]; follow: boolean }) { const map = useMap(); useEffect(() => { if (follow) map.panTo(position); }, [position, follow, map]); return null; }
function Frame({ points }: { points: [number, number][] }) { const map = useMap(); const key = points.map((p) => p.map((n) => n.toFixed(3)).join(',')).join(';'); useEffect(() => { if (points.length > 1) map.fitBounds(points, { padding: [40, 40], maxZoom: 16 }); else if (points[0]) map.setView(points[0], 16); }, [map, key]); return null; }

export function TransferMap({ driverLocation, destination: given, address }: { driverLocation: LL; destination: LL; address?: string | null }) {
  const [found, setFound] = useState<LL>(undefined);
  useEffect(() => { if (given || !address) return; let on = true; geocode(address).then((g) => { if (on && g) setFound(g); }); return () => { on = false; }; }, [given?.lat, given?.lng, address]);
  const destination = given ?? found;
  const [osrm, setOsrm] = useState<{ km: number; min: number } | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((n) => n + 1), 15000); return () => clearInterval(t); }, []);
  const [follow, setFollow] = useState(false);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [startKm, setStartKm] = useState<number | null>(null);
  const raw = useMemo<[number, number] | undefined>(() => (driverLocation ? [driverLocation.lat, driverLocation.lng] : undefined), [driverLocation?.lat, driverLocation?.lng]);
  const driver = useSmooth(raw);
  const end: [number, number] | undefined = destination ? [destination.lat, destination.lng] : undefined;
  useEffect(() => {
    if (!raw || !end) { setRoute([]); return; }
    const c = new AbortController();
    fetch(`https://router.project-osrm.org/route/v1/driving/${raw[1]},${raw[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`, { signal: c.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { const co = d?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined; if (co) setRoute(co.map(([lng, lat]) => [lat, lng])); const rt = d?.routes?.[0]; if (rt) setOsrm({ km: rt.distance / 1000, min: Math.max(1, Math.round(rt.duration / 60)) }); })
      .catch(() => {});
    return () => c.abort();
  }, [raw?.[0], raw?.[1], destination?.lat, destination?.lng, tick]);
  const remaining = route.length > 1 ? pathKm(route) : raw && end ? km(raw, end) : null;
  useEffect(() => { if (remaining != null && (startKm == null || remaining > startKm)) setStartKm(remaining); }, [remaining]);
  if (!driver) return <div className="flex h-[50vh] min-h-[350px] items-center justify-center bg-card text-center text-muted-foreground">Waiting for the rider’s live location</div>;
  const total = startKm ?? remaining ?? 0;
  const done = Math.max(0, total - (remaining ?? 0));
  const minutes = osrm ? osrm.min : remaining != null ? Math.max(1, Math.round((remaining / 30) * 60)) : null;
  const dur = minutes != null ? fmtDur(minutes) : '';
  const mid = route.length > 1 ? route[Math.floor(route.length / 2)] : undefined;
  const midIcon = L.divIcon({ className: '', html: `<span style="background:#3b82f6;color:#fff;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap">${dur}</span>`, iconSize: [90, 22], iconAnchor: [45, 11] });
  return <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
    <MapContainer center={driver} zoom={16} scrollWheelZoom className="h-full w-full">
      <TileLayer attribution="Tiles © Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      {route.length > 1 && <Polyline positions={route} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.9 }} />}
      {route.length < 2 && raw && end && <Polyline positions={[raw, end]} pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '8 8' }} />}
      {mid && <Marker position={mid} icon={midIcon} interactive={false} />}
      {end && <Marker position={end} icon={pinIcon} />}
      <Marker position={driver} icon={scooterIcon} />
      <Follow position={driver} follow={follow} />
      <Frame points={end ? [raw ?? driver, end] : [raw ?? driver]} />
    </MapContainer>
    <div className="absolute inset-x-3 top-3 z-[500] rounded-2xl bg-background/85 p-3 backdrop-blur">
      {remaining == null ? <p className="text-sm text-muted-foreground">Live Now · destination location not found yet</p> : <>
        <div className="flex items-baseline justify-between gap-2 text-sm"><b className="text-lg">{done.toFixed(2)}km / {total.toFixed(2)}km</b><span className="text-[var(--route-green)]">Live Now • {remaining.toFixed(1)} km • {dur} away</span></div>
        <input type="range" readOnly aria-label="Trip progress" min={0} max={Math.max(total, 0.01)} step={0.01} value={done} className="mt-2 w-full accent-[var(--route-green)]" />
      </>}
    </div>
    {raw && end && <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&origin=${raw[0]},${raw[1]}&destination=${end[0]},${end[1]}&travelmode=driving`} className="absolute bottom-5 left-5 z-[500] rounded-full bg-background/85 px-4 py-2 text-xs font-bold">Open in Google Maps (Free)</a>}
    <Button onClick={() => setFollow((v) => !v)} className="absolute bottom-5 right-5 z-[500] h-11 rounded-full bg-orange text-foreground"><Navigation size={17} /> {follow ? 'Following rider' : 'Live Tracking'}</Button>
  </div>;
}
