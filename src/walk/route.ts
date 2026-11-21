// Rute Mode Jalan: format simpan ringkas, split per km, penanda km & proyeksi ke gambar (murni → mudah diuji)

/** Titik rute: lintang, bujur, waktu (ms), jarak kumulatif (m), segmen (bertambah setiap jeda→lanjut) */
export interface RoutePoint {
  lat: number;
  lon: number;
  t: number;
  d: number;
  seg: number;
}

/**
 * Format simpan ringkas di WalkLog (delta encoding → angka kecil, hemat ruang):
 * titik pertama absolut, berikutnya selisih dari titik sebelumnya.
 * [lat×1e5, lon×1e5, detik sejak mulai, meter, segmen]
 */
export type PackedPoint = [number, number, number, number, number];

/** cukup untuk menggambar rute & split; ±8 KB per sesi */
export const MAX_POINTS = 600;

export function packRoute(points: RoutePoint[], startedAt: number): PackedPoint[] {
  let prev: PackedPoint = [0, 0, 0, 0, 0];
  return downsample(points, MAX_POINTS).map((p) => {
    const abs: PackedPoint = [Math.round(p.lat * 1e5), Math.round(p.lon * 1e5), Math.max(0, Math.round((p.t - startedAt) / 1000)), Math.round(p.d), p.seg];
    const out = abs.map((v, i) => v - prev[i]) as PackedPoint;
    prev = abs;
    return out;
  });
}

export function unpackRoute(packed: PackedPoint[] | undefined, startedAt: number): RoutePoint[] {
  const acc: PackedPoint = [0, 0, 0, 0, 0];
  return (packed ?? []).map((delta) => {
    for (let i = 0; i < 5; i++) acc[i] += delta[i];
    return { lat: acc[0] / 1e5, lon: acc[1] / 1e5, t: startedAt + acc[2] * 1000, d: acc[3], seg: acc[4] };
  });
}

/** Kurangi jumlah titik secara merata, selalu pertahankan titik pertama/terakhir & batas segmen */
export function downsample(points: RoutePoint[], max: number): RoutePoint[] {
  if (points.length <= max) return points;
  const keep = new Set<number>([0, points.length - 1]);
  for (let i = 1; i < points.length; i++) if (points[i].seg !== points[i - 1].seg) keep.add(i - 1).add(i);
  const step = points.length / (max - keep.size);
  for (let x = 0; x < points.length; x += step) keep.add(Math.floor(x));
  return [...keep].sort((a, b) => a - b).map((i) => points[i]);
}

export interface Split {
  km: number;
  /** jarak split (m) — 1000 kecuali sisa terakhir */
  distanceM: number;
  /** waktu bergerak (detik) */
  seconds: number;
  /** detik per km */
  pace: number;
  partial: boolean;
}

/**
 * Split per km dari waktu bergerak: waktu antar titik dalam segmen yang sama dijumlahkan,
 * jeda (antar segmen) tidak dihitung. Batas km diinterpolasi linier.
 */
export function splitsFromRoute(points: RoutePoint[]): Split[] {
  if (points.length < 2) return [];
  const out: Split[] = [];
  let km = 1;
  let splitStartMove = 0; // waktu bergerak saat split ini dimulai
  let move = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (b.seg !== a.seg) continue; // jeda: tidak menambah waktu/jarak split
    const dt = Math.max(0, (b.t - a.t) / 1000);
    const dd = b.d - a.d;
    // lewati batas km (bisa lebih dari satu kalau titik jarang)
    while (b.d >= km * 1000 && dd > 0) {
      const f = Math.min(1, Math.max(0, (km * 1000 - a.d) / dd));
      const atBoundary = move + dt * f;
      const secs = atBoundary - splitStartMove;
      out.push({ km, distanceM: 1000, seconds: secs, pace: secs, partial: false });
      splitStartMove = atBoundary;
      km++;
    }
    move += dt;
  }
  const total = points[points.length - 1].d;
  const rest = total - (km - 1) * 1000;
  if (rest >= 50) {
    const secs = move - splitStartMove;
    out.push({ km, distanceM: rest, seconds: secs, pace: secs / (rest / 1000), partial: true });
  }
  return out;
}

/** Posisi (lat/lon) setiap batas km untuk penanda di peta rute */
export function kmMarkers(points: RoutePoint[]): { km: number; lat: number; lon: number }[] {
  const out: { km: number; lat: number; lon: number }[] = [];
  let km = 1;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    while (b.d >= km * 1000 && b.d > a.d) {
      const f = (km * 1000 - a.d) / (b.d - a.d);
      out.push({ km, lat: a.lat + (b.lat - a.lat) * f, lon: a.lon + (b.lon - a.lon) * f });
      km++;
    }
  }
  return out;
}

/** Proyeksi lat/lon → koordinat gambar (x,y), menjaga rasio & memusatkan rute */
export function makeProjector(points: { lat: number; lon: number }[], width: number, height: number, pad: number) {
  if (points.length === 0) return () => [width / 2, height / 2] as [number, number];
  const lat0 = points.reduce((a, p) => a + p.lat, 0) / points.length;
  const kx = 111_320 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 110_574;
  const xs = points.map((p) => p.lon * kx);
  const ys = points.map((p) => -p.lat * ky);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 20);
  const spanY = Math.max(maxY - minY, 20);
  const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);
  const offX = (width - (maxX - minX) * scale) / 2;
  const offY = (height - (maxY - minY) * scale) / 2;
  return (p: { lat: number; lon: number }): [number, number] => [offX + (p.lon * kx - minX) * scale, offY + (-p.lat * ky - minY) * scale];
}

export function fmtPaceSec(secPerKm: number) {
  if (!isFinite(secPerKm) || secPerKm <= 0 || secPerKm > 5999) return '--:--';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return s === 60 ? `${m + 1}:00` : `${m}:${String(s).padStart(2, '0')}`;
}
