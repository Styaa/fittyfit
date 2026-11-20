// Perhitungan jarak GPS (murni, tanpa dependensi → mudah diuji)

export interface GeoPoint {
  lat: number;
  lon: number;
  /** akurasi horizontal (meter) */
  acc: number | null;
  /** waktu (ms) */
  t: number;
}

const R = 6_371_000;
const rad = (d: number) => (d * Math.PI) / 180;

/** Jarak dua titik dalam meter (haversine) */
export function haversine(a: Pick<GeoPoint, 'lat' | 'lon'>, b: Pick<GeoPoint, 'lat' | 'lon'>) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** titik dengan akurasi lebih buruk dari ini diabaikan */
export const MAX_ACCURACY_M = 35;
/** kecepatan di atas ini dianggap lompatan GPS (≈ 25 km/j; jalan/lari tetap terhitung) */
export const MAX_SPEED_MS = 7;

/**
 * Penyaring jarak bertahap:
 * 1. buang titik tidak akurat & lompatan GPS (kecepatan mustahil),
 * 2. haluskan posisi dengan rata-rata beberapa titik terakhir (meredam getaran sinyal),
 * 3. tambahkan jarak hanya jika posisi halus bergeser cukup jauh dari jangkar terakhir.
 */
export class DistanceFilter {
  private buf: GeoPoint[] = [];
  private anchor: GeoPoint | null = null;
  private lastRaw: GeoPoint | null = null;
  constructor(private window = 5) {}

  reset() {
    this.buf = [];
    this.anchor = null;
    this.lastRaw = null;
  }

  /**
   * Sisa jarak di akhir rute: posisi halus selalu sedikit tertinggal,
   * jadi saat selesai tambahkan jarak jangkar → rata-rata titik terakhir (jika cukup jauh dari getaran).
   */
  flush(): number {
    if (!this.anchor || this.buf.length === 0) return 0;
    const tail = this.buf.slice(-2);
    const end = { lat: tail.reduce((a, x) => a + x.lat, 0) / tail.length, lon: tail.reduce((a, x) => a + x.lon, 0) / tail.length };
    const d = haversine(this.anchor, end);
    const acc = Math.max(...tail.map((x) => x.acc ?? 0));
    return d >= Math.max(5, 0.6 * acc) ? d : 0;
  }

  /** Masukkan titik baru, kembalikan jarak (meter) yang ditambahkan */
  push(p: GeoPoint): number {
    if (p.acc != null && p.acc > MAX_ACCURACY_M) return 0;
    if (this.lastRaw) {
      const dt = Math.max(0.001, (p.t - this.lastRaw.t) / 1000);
      if (haversine(this.lastRaw, p) / dt > MAX_SPEED_MS) return 0; // lompatan
    }
    this.lastRaw = p;
    this.buf.push(p);
    if (this.buf.length > this.window) this.buf.shift();
    if (this.buf.length < Math.min(3, this.window)) return 0;
    const n = this.buf.length;
    const smooth: GeoPoint = {
      lat: this.buf.reduce((a, x) => a + x.lat, 0) / n,
      lon: this.buf.reduce((a, x) => a + x.lon, 0) / n,
      acc: Math.max(...this.buf.map((x) => x.acc ?? 0)),
      t: p.t,
    };
    if (!this.anchor) {
      this.anchor = smooth;
      return 0;
    }
    const d = haversine(this.anchor, smooth);
    const threshold = Math.max(8, 0.6 * (smooth.acc ?? 0));
    if (d < threshold) return 0;
    this.anchor = smooth;
    return d;
  }
}

export const fmtKm = (m: number, digits = 2) => (m / 1000).toFixed(digits).replace('.', ',');

/** "mm:ss /km" */
export function fmtPace(distanceM: number, seconds: number) {
  if (distanceM < 50 || seconds <= 0) return '--:--';
  const secPerKm = seconds / (distanceM / 1000);
  if (!isFinite(secPerKm) || secPerKm > 3600) return '--:--';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
