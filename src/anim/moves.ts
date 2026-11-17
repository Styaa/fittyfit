/* eslint-disable */
// Mesin animasi figur vektor untuk contoh gerakan.
// Tanpa import supaya bisa dipakai di aplikasi (Metro) dan skrip Node (ekspor GIF).
//
// Sudut dalam derajat, sistem layar: 0 = ke atas, 90 = ke depan (kanan), 180 = ke bawah, 270 = ke belakang (kiri).

export type View = 'side' | 'front' | 'top';
export type Limb = [number, number] | 'ik';
export type Leg = [number, number, number?] | 'ik';
export type Joint =
  | 'hip' | 'shoulder' | 'head'
  | 'elbowN' | 'wristN' | 'elbowF' | 'wristF'
  | 'kneeN' | 'ankleN' | 'toeN' | 'kneeF' | 'ankleF' | 'toeF';

export interface Pose {
  t?: number; // torso
  h?: number; // kepala (default = torso)
  a?: Limb; // lengan dekat / kanan
  af?: Limb; // lengan jauh / kiri (default = a)
  l?: Leg; // kaki dekat / kanan
  lf?: Leg; // kaki jauh / kiri (default = l)
  as?: number; // skala panjang lengan (foreshortening)
  ls?: number; // skala panjang kaki
  ts?: number; // skala torso
  db?: 'disk' | 'bar';
  label?: string;
}

export interface Prop {
  type: 'box';
  under: Joint;
  w?: number;
  /** geser horizontal kotak relatif terhadap sendi */
  dx?: number;
}

export interface Move {
  view: View;
  frames: Pose[];
  mode?: 'pingpong' | 'loop' | 'hold';
  /** loop: durasi transisi menuju tiap frame (detik) */
  durs?: number[];
  anchor?: Joint;
  groundFrame?: number;
  db?: 'both' | 'near' | 'none' | 'goblet' | 'hip';
  props?: Prop[];
  /** angkat figur dari lantai (mis. berdiri di atas pijakan) */
  lift?: number;
  bend?: { a?: 1 | -1; af?: 1 | -1; l?: 1 | -1; lf?: 1 | -1 };
}

export const VB = { w: 200, h: 130, floor: 122 };
const L = { T: 30, NECK: 3.5, HEAD: 6.5, UA: 15, FA: 14, TH: 22, SH: 22, FT: 7, SW: 8, HW: 5 };

const rad = (d: number) => (d * Math.PI) / 180;
const dir = (d: number): [number, number] => [Math.sin(rad(d)), -Math.cos(rad(d))];
const add = (p: number[], v: number[], k = 1): [number, number] => [p[0] + v[0] * k, p[1] + v[1] * k];
const angleOf = (from: number[], to: number[]) => {
  const a = (Math.atan2(to[0] - from[0], -(to[1] - from[1])) * 180) / Math.PI;
  return a;
};

type Pt = [number, number];
export type Skeleton = Record<Joint, Pt> & { shoulderN: Pt; shoulderF: Pt; hipN: Pt; hipF: Pt; headC: Pt };

const DEF: Required<Pick<Pose, 't' | 'a' | 'l'>> = { t: 0, a: [180, 180], l: [180, 180, 90] };

function full(p: Pose) {
  const t = p.t ?? DEF.t;
  const a = p.a ?? DEF.a;
  const l = p.l ?? DEF.l;
  return { t, h: p.h ?? t, a, af: p.af ?? a, l, lf: p.lf ?? l, as: p.as ?? 1, ls: p.ls ?? 1, ts: p.ts ?? 1 };
}

const IK_DEFAULT_ARM: [number, number] = [180, 180];
const IK_DEFAULT_LEG: [number, number, number] = [180, 180, 90];

/** FK lokal (pinggul di 0,0) */
function fk(p: Pose, view: View): Skeleton {
  const f = full(p);
  const H: Pt = [0, 0];
  const S = add(H, dir(f.t), L.T * f.ts);
  const headC = add(S, dir(f.h), L.NECK + L.HEAD);
  const mirror = (ang: number) => (view === 'side' ? ang : 2 * f.t - ang);
  const perp = dir(f.t + 90);
  const sN: Pt = view === 'side' ? S : add(S, perp, L.SW);
  const sF: Pt = view === 'side' ? S : add(S, perp, -L.SW);
  const hN: Pt = view === 'side' ? H : add(H, perp, L.HW);
  const hF: Pt = view === 'side' ? H : add(H, perp, -L.HW);
  const arm = (root: Pt, limb: Limb, far: boolean) => {
    const [u, fo] = limb === 'ik' ? IK_DEFAULT_ARM : limb;
    const uu = far ? mirror(u) : u;
    const ff = far ? mirror(fo) : fo;
    const e = add(root, dir(uu), L.UA * f.as);
    const w = add(e, dir(ff), L.FA * f.as);
    return [e, w] as const;
  };
  const leg = (root: Pt, limb: Leg, far: boolean) => {
    const [th, sh, ft = 90] = limb === 'ik' ? IK_DEFAULT_LEG : limb;
    const m = (x: number) => (far ? mirror(x) : x);
    const k = add(root, dir(m(th)), L.TH * f.ls);
    const an = add(k, dir(m(sh)), L.SH * f.ls);
    const toe = view === 'side' ? add(an, dir(ft), L.FT) : add(an, dir(far ? -90 - 0 : 90), 3.5);
    return [k, an, toe] as const;
  };
  const [eN, wN] = arm(sN, f.a, false);
  const [eF, wF] = arm(sF, f.af, true);
  const [kN, aN, tN] = leg(hN, f.l, false);
  const [kF, aF, tF] = leg(hF, f.lf, true);
  return {
    hip: H, shoulder: S, head: headC, headC,
    shoulderN: sN, shoulderF: sF, hipN: hN, hipF: hF,
    elbowN: eN, wristN: wN, elbowF: eF, wristF: wF,
    kneeN: kN, ankleN: aN, toeN: tN, kneeF: kF, ankleF: aF, toeF: tF,
  } as Skeleton;
}

function shift(s: Skeleton, dx: number, dy: number): Skeleton {
  const o: any = {};
  for (const k of Object.keys(s)) o[k] = [(s as any)[k][0] + dx, (s as any)[k][1] + dy];
  return o;
}

function rotTop(s: Skeleton): Skeleton {
  const o: any = {};
  for (const k of Object.keys(s)) {
    const [x, y] = (s as any)[k];
    o[k] = [-y, x];
  }
  return o;
}

/** IK 2 tulang: kembalikan posisi siku/lutut */
function ik2(root: Pt, target: Pt, a: number, b: number, bend: number): Pt {
  const dx = target[0] - root[0];
  const dy = target[1] - root[1];
  let d = Math.hypot(dx, dy);
  d = Math.max(Math.abs(a - b) + 0.01, Math.min(a + b - 0.01, d));
  const cosA = (a * a + d * d - b * b) / (2 * a * d);
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const base = Math.atan2(dy, dx);
  const ang = base + bend * alpha;
  return [root[0] + Math.cos(ang) * a, root[1] + Math.sin(ang) * a];
}

const CONTACT: Partial<Record<keyof Skeleton, number>> = { head: L.HEAD, headC: L.HEAD };

function lowest(s: Skeleton) {
  let m = -Infinity;
  for (const k of Object.keys(s) as (keyof Skeleton)[]) {
    const r = CONTACT[k] ?? 2.5;
    m = Math.max(m, s[k][1] + r);
  }
  return m;
}

export interface Prepared {
  move: Move;
  ref: Skeleton; // frame referensi (dunia)
  gi: number;
  anchorPos: Pt;
  dx: number; // geser horizontal untuk centering
  dy: number;
  k: number; // skala agar figur mengisi kanvas
  pivot: Pt;
  /** sudut hasil IK per frame (untuk interpolasi ke pose bebas) */
  resolved: Pose[];
  boxes: { x: number; y: number; w: number; h: number }[];
}

function toWorld(m: Move, p: Pose): Skeleton {
  let s = fk(p, m.view);
  if (m.view === 'top') s = rotTop(s);
  return s;
}

export function prepare(m: Move): Prepared {
  const gi = m.groundFrame ?? 0;
  let ref = toWorld(m, m.frames[gi]);
  if (m.view === 'top') {
    ref = shift(ref, 0, VB.h / 2);
  } else {
    ref = shift(ref, 0, VB.floor - (m.lift ?? 0) - lowest(ref));
  }
  const anchor = m.anchor ?? (m.view === 'top' ? 'hip' : 'ankleN');
  const pivot: Pt = m.view === 'top' ? [VB.w / 2, VB.h / 2] : [VB.w / 2, VB.floor];
  const prep: Prepared = { move: m, ref, gi, anchorPos: ref[anchor], dx: 0, dy: 0, k: 1, pivot, resolved: [], boxes: [] };
  // sudut hasil IK tiap frame
  prep.resolved = m.frames.map((f, i) => {
    const sk = solveRaw(prep, i, i, 0);
    const r: Pose = { ...f };
    if (f.a === 'ik') r.a = [angleOf(sk.shoulderN, sk.elbowN), angleOf(sk.elbowN, sk.wristN)];
    if (f.af === 'ik') {
      const u = angleOf(sk.shoulderF, sk.elbowF);
      const fo = angleOf(sk.elbowF, sk.wristF);
      const t = full(f).t;
      r.af = m.view === 'side' ? [u, fo] : [2 * t - u, 2 * t - fo];
    }
    if (f.l === 'ik') r.l = [angleOf(sk.hipN, sk.kneeN), angleOf(sk.kneeN, sk.ankleN), angleOf(sk.ankleN, sk.toeN)];
    if (f.lf === 'ik') r.lf = [angleOf(sk.hipF, sk.kneeF), angleOf(sk.kneeF, sk.ankleF), angleOf(sk.ankleF, sk.toeF)];
    return r;
  });
  // bounding box seluruh frame → centering & skala
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const n = m.frames.length;
  for (let i = 0; i < n; i++) {
    for (const t of [0, 0.25, 0.5, 0.75]) {
      const s = solveRaw(prep, i, (i + 1) % n, t);
      for (const k of Object.keys(s) as (keyof Skeleton)[]) {
        const r = CONTACT[k] ?? 3;
        minX = Math.min(minX, s[k][0] - r);
        maxX = Math.max(maxX, s[k][0] + r);
        minY = Math.min(minY, s[k][1] - r);
        maxY = Math.max(maxY, s[k][1] + r);
      }
    }
  }
  for (const pr of m.props ?? []) {
    const j = ref[pr.under];
    const w = pr.w ?? 24;
    minX = Math.min(minX, j[0] - w / 2 + (pr.dx ?? 0));
    maxX = Math.max(maxX, j[0] + w / 2 + (pr.dx ?? 0));
  }
  prep.dx = VB.w / 2 - (minX + maxX) / 2;
  if (m.view === 'top') prep.dy = VB.h / 2 - (minY + maxY) / 2;
  const bw = maxX - minX;
  const bh = m.view === 'top' ? maxY - minY : VB.floor - minY;
  prep.k = Math.min(1.45, (VB.w * 0.9) / bw, m.view === 'top' ? (VB.h * 0.86) / bh : (VB.floor - 6) / bh);
  for (const pr of m.props ?? []) {
    const j = ref[pr.under];
    const top = j[1] + 2.5;
    const w = pr.w ?? 24;
    const x0 = scalePt(prep, [j[0] - w / 2 + (pr.dx ?? 0) + prep.dx, top]);
    const x1 = scalePt(prep, [j[0] + w / 2 + (pr.dx ?? 0) + prep.dx, top]);
    prep.boxes.push({ x: x0[0], y: x0[1], w: x1[0] - x0[0], h: VB.floor - x0[1] });
  }
  return prep;
}

function scalePt(prep: Prepared, p: Pt): Pt {
  return [prep.pivot[0] + (p[0] - prep.pivot[0]) * prep.k, prep.pivot[1] + (p[1] - prep.pivot[1]) * prep.k];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpLimb = (a: any, b: any, t: number) => {
  if (a === 'ik' || b === 'ik') return 'ik';
  return a.map((v: number, i: number) => lerp(v, b[i] ?? v, t));
};

function lerpPose(p: Pose, q: Pose, t: number): Pose {
  const a = full(p);
  const b = full(q);
  return {
    t: lerp(a.t, b.t, t),
    h: lerp(a.h, b.h, t),
    a: lerpLimb(a.a, b.a, t),
    af: lerpLimb(a.af, b.af, t),
    l: lerpLimb(a.l, b.l, t),
    lf: lerpLimb(a.lf, b.lf, t),
    as: lerp(a.as, b.as, t),
    ls: lerp(a.ls, b.ls, t),
    ts: lerp(a.ts, b.ts, t),
    db: t < 0.5 ? p.db : q.db,
  };
}

type LimbKey = 'a' | 'af' | 'l' | 'lf';

/** Skeleton dunia (sebelum centering/skala) di antara frame i dan j */
function solveRaw(prep: Prepared, i: number, j: number, t: number): Skeleton {
  const m = prep.move;
  const fi = m.frames[i];
  const fj = m.frames[j];
  // tentukan mode tiap anggota badan
  const ikOf: Record<LimbKey, boolean> = { a: false, af: false, l: false, lf: false };
  const src = (f: Pose, idx: number) => (prep.resolved[idx] && prep.resolved.length ? prep.resolved[idx] : f);
  let pi: Pose = { ...fi };
  let pj: Pose = { ...fj };
  for (const key of ['a', 'af', 'l', 'lf'] as LimbKey[]) {
    const vi = full(fi)[key];
    const vj = full(fj)[key];
    const ii = vi === 'ik';
    const jj = vj === 'ik';
    if (ii && jj) ikOf[key] = true;
    else if (ii && j === prep.gi) ikOf[key] = true;
    else if (jj && i === prep.gi) ikOf[key] = true;
    else if (ii || jj) {
      // campuran IK ↔ pose bebas: pakai sudut hasil IK
      if (ii) (pi as any)[key] = (src(fi, i) as any)[key] ?? (key[0] === 'a' ? IK_DEFAULT_ARM : IK_DEFAULT_LEG);
      if (jj) (pj as any)[key] = (src(fj, j) as any)[key] ?? (key[0] === 'a' ? IK_DEFAULT_ARM : IK_DEFAULT_LEG);
    }
    if (ikOf[key]) {
      (pi as any)[key] = 'ik';
      (pj as any)[key] = 'ik';
    }
  }
  const pose = lerpPose(pi, pj, t);
  let s = toWorld(m, pose);
  const anchor = m.anchor ?? (m.view === 'top' ? 'hip' : 'ankleN');
  s = shift(s, prep.anchorPos[0] - s[anchor][0], prep.anchorPos[1] - s[anchor][1]);
  const bend = m.bend ?? {};
  const f = full(pose);
  if (ikOf.a) s.elbowN = ik2(s.shoulderN, (s.wristN = prep.ref.wristN), L.UA * f.as, L.FA * f.as, bend.a ?? 1);
  if (ikOf.af) s.elbowF = ik2(s.shoulderF, (s.wristF = prep.ref.wristF), L.UA * f.as, L.FA * f.as, bend.af ?? bend.a ?? 1);
  if (ikOf.l) {
    s.ankleN = prep.ref.ankleN;
    s.toeN = prep.ref.toeN;
    s.kneeN = ik2(s.hipN, s.ankleN, L.TH * f.ls, L.SH * f.ls, bend.l ?? -1);
  }
  if (ikOf.lf) {
    s.ankleF = prep.ref.ankleF;
    s.toeF = prep.ref.toeF;
    s.kneeF = ik2(s.hipF, s.ankleF, L.TH * f.ls, L.SH * f.ls, bend.lf ?? bend.l ?? -1);
  }
  return s;
}

/** Skeleton akhir (dengan centering & skala) di antara frame i dan j */
export function solve(prep: Prepared, i: number, j: number, t: number): Skeleton {
  const s = shift(solveRaw(prep, i, j, t), prep.dx, prep.dy);
  const o: any = {};
  for (const k of Object.keys(s)) o[k] = scalePt(prep, (s as any)[k]);
  return o;
}

// ---------------- Timeline ----------------
export interface Seg {
  from: number;
  to: number;
  dur: number;
  phase: string;
}

export const PHASE_ID = { ecc: 'TURUN', pause: 'JEDA', con: 'NAIK', hold: 'TAHAN' };

export function timeline(m: Move, tempo?: string): Seg[] {
  const n = m.frames.length;
  if (m.mode === 'hold' || n === 1) {
    if (n === 1) return [{ from: 0, to: 0, dur: 2, phase: PHASE_ID.hold }];
    return [
      { from: 0, to: 1, dur: 1.6, phase: PHASE_ID.hold },
      { from: 1, to: 0, dur: 1.6, phase: PHASE_ID.hold },
    ];
  }
  if (m.mode === 'loop') {
    const durs = m.durs ?? m.frames.map(() => 1);
    return m.frames.map((f, i) => ({ from: i, to: (i + 1) % n, dur: durs[(i + 1) % n] ?? 1, phase: m.frames[(i + 1) % n].label ?? '' }));
  }
  const tp = (tempo && /^[0-9xX]{4}$/.test(tempo) ? tempo : '2010').split('').map((c) => (c.toUpperCase() === 'X' ? 0.6 : parseInt(c, 10)));
  const ecc = Math.max(0.8, tp[0]);
  const con = Math.max(0.6, tp[2]);
  const segs: Seg[] = [];
  for (let i = 0; i < n - 1; i++) segs.push({ from: i, to: i + 1, dur: ecc / (n - 1), phase: PHASE_ID.ecc });
  if (tp[1] > 0) segs.push({ from: n - 1, to: n - 1, dur: tp[1], phase: PHASE_ID.pause });
  for (let i = n - 1; i > 0; i--) segs.push({ from: i, to: i - 1, dur: con / (n - 1), phase: PHASE_ID.con });
  if (tp[3] > 0) segs.push({ from: 0, to: 0, dur: tp[3], phase: PHASE_ID.pause });
  return segs;
}

export const cycleLength = (segs: Seg[]) => segs.reduce((a, s) => a + s.dur, 0);

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function sampleAt(prep: Prepared, segs: Seg[], time: number) {
  const total = cycleLength(segs);
  let t = ((time % total) + total) % total;
  for (const s of segs) {
    if (t <= s.dur) {
      const k = s.dur === 0 ? 1 : ease(t / s.dur);
      return { skel: solve(prep, s.from, s.to, k), phase: s.phase, pose: k < 0.5 ? prep.move.frames[s.from] : prep.move.frames[s.to] };
    }
    t -= s.dur;
  }
  const last = segs[segs.length - 1];
  return { skel: solve(prep, last.to, last.to, 0), phase: last.phase, pose: prep.move.frames[last.to] };
}

// ---------------- Bentuk (untuk renderer SVG / PIL) ----------------
export type Shape =
  | { k: 'line'; x1: number; y1: number; x2: number; y2: number; w: number; c: string; o?: number }
  | { k: 'circle'; cx: number; cy: number; r: number; fill: string; stroke?: string; w?: number; o?: number }
  | { k: 'rect'; x: number; y: number; w: number; h: number; fill: string; stroke?: string; sw?: number; o?: number };

export const COLORS = {
  bg: '#0A0812',
  near: '#C4B5FD',
  nearGlow: '#8B5CF6',
  far: '#5B4A8F',
  torso: '#d9ceff',
  head: '#15111F',
  floor: '#3a3350',
  box: '#1e1a2b',
  boxStroke: '#4a3d7c',
  plate: '#8B5CF6',
  plateFar: '#4a3d7c',
  handle: '#cbc3d7',
  ghost: '#8B5CF6',
};

function dumbbell(out: Shape[], at: Pt, axisDeg: number, style: 'disk' | 'bar', far: boolean) {
  const plate = far ? COLORS.plateFar : COLORS.plate;
  if (style === 'disk') {
    out.push({ k: 'circle', cx: at[0], cy: at[1], r: 4.8, fill: plate, stroke: far ? COLORS.far : COLORS.near, w: 0.8 });
    out.push({ k: 'circle', cx: at[0], cy: at[1], r: 1.4, fill: COLORS.handle });
    return;
  }
  const d = dir(axisDeg);
  const p1 = add(at, d, -6);
  const p2 = add(at, d, 6);
  out.push({ k: 'line', x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], w: 1.6, c: COLORS.handle });
  const pd = dir(axisDeg + 90);
  for (const p of [add(at, d, -5), add(at, d, 5)]) {
    const a = add(p, pd, -3.6);
    const b = add(p, pd, 3.6);
    out.push({ k: 'line', x1: a[0], y1: a[1], x2: b[0], y2: b[1], w: 3.2, c: plate });
  }
}

function seg(out: Shape[], a: Pt, b: Pt, w: number, c: string, o?: number) {
  out.push({ k: 'line', x1: a[0], y1: a[1], x2: b[0], y2: b[1], w, c, o });
}

function figure(out: Shape[], s: Skeleton, ghost = false, k = 1, sym = false) {
  const HR = L.HEAD * k;
  if (ghost) {
    const c = COLORS.ghost;
    const o = 0.13;
    for (const [a, b] of [
      [s.hip, s.shoulder], [s.shoulderN, s.elbowN], [s.elbowN, s.wristN], [s.shoulderF, s.elbowF], [s.elbowF, s.wristF],
      [s.hipN, s.kneeN], [s.kneeN, s.ankleN], [s.hipF, s.kneeF], [s.kneeF, s.ankleF],
    ] as [Pt, Pt][])
      seg(out, a, b, 3, c, o);
    out.push({ k: 'circle', cx: s.headC[0], cy: s.headC[1], r: HR, fill: 'none', stroke: c, w: 1.5, o });
    return;
  }
  // jauh (pada tampilan depan/atas: sama terang dengan sisi dekat)
  const farC = sym ? COLORS.near : COLORS.far;
  for (const [a, b, w] of [
    [s.hipF, s.kneeF, 4], [s.kneeF, s.ankleF, 4], [s.ankleF, s.toeF, 3.4], [s.shoulderF, s.elbowF, 3.6], [s.elbowF, s.wristF, 3.4],
  ] as [Pt, Pt, number][]) {
    if (sym) seg(out, a, b, w + 4, COLORS.nearGlow, 0.22);
    seg(out, a, b, w, farC);
  }
  // torso
  seg(out, s.hip, s.shoulder, 9, COLORS.nearGlow, 0.25);
  seg(out, s.hip, s.shoulder, 5.4, COLORS.torso);
  if (s.shoulderN[0] !== s.shoulderF[0] || s.shoulderN[1] !== s.shoulderF[1]) {
    seg(out, s.shoulderF, s.shoulderN, 4, COLORS.torso);
    seg(out, s.hipF, s.hipN, 4, COLORS.torso);
  }
  out.push({ k: 'circle', cx: s.headC[0], cy: s.headC[1], r: HR + 2.5, fill: COLORS.nearGlow, o: 0.18 });
  out.push({ k: 'circle', cx: s.headC[0], cy: s.headC[1], r: HR, fill: COLORS.head, stroke: COLORS.torso, w: 2 });
  // dekat (dengan glow)
  for (const [a, b, w] of [
    [s.hipN, s.kneeN, 4.4], [s.kneeN, s.ankleN, 4.4], [s.ankleN, s.toeN, 3.6],
    [s.shoulderN, s.elbowN, 4], [s.elbowN, s.wristN, 3.8],
  ] as [Pt, Pt, number][]) {
    seg(out, a, b, w + 4, COLORS.nearGlow, 0.22);
    seg(out, a, b, w, COLORS.near);
  }
  for (const j of [s.elbowN, s.kneeN, s.wristN, s.ankleN]) out.push({ k: 'circle', cx: j[0], cy: j[1], r: 1.7, fill: '#ffffff' });
}

export function render(prep: Prepared, segs: Seg[], time: number) {
  const m = prep.move;
  const out: Shape[] = [];
  if (m.view !== 'top') {
    out.push({ k: 'line', x1: 6, y1: VB.floor + 0.5, x2: VB.w - 6, y2: VB.floor + 0.5, w: 1.2, c: COLORS.floor });
  }
  for (const b of prep.boxes) out.push({ k: 'rect', x: b.x, y: b.y, w: b.w, h: b.h, fill: COLORS.box, stroke: COLORS.boxStroke, sw: 1 });
  // jejak pose ekstrem
  if (m.frames.length > 1) {
    figure(out, solve(prep, 0, 0, 0), true, prep.k);
    figure(out, solve(prep, m.frames.length - 1, m.frames.length - 1, 0), true, prep.k);
  }
  const { skel: s, phase, pose } = sampleAt(prep, segs, time);
  figure(out, s, false, prep.k, m.view !== 'side');
  const style = pose.db ?? 'disk';
  const fa = (e: Pt, w: Pt) => angleOf(e, w) + 90;
  const db = m.db ?? 'both';
  if (db === 'both' || db === 'near') {
    if (db === 'both') dumbbell(out, s.wristF, fa(s.elbowF, s.wristF), style, m.view === 'side');
    dumbbell(out, s.wristN, fa(s.elbowN, s.wristN), style, false);
  } else if (db === 'goblet') {
    const mid: Pt = [(s.wristN[0] + s.wristF[0]) / 2, (s.wristN[1] + s.wristF[1]) / 2];
    dumbbell(out, mid, m.view === 'side' ? angleOf(s.hip, s.shoulder) : angleOf(s.hip, s.shoulder) + 90, 'bar', false);
  } else if (db === 'hip') {
    dumbbell(out, [s.hip[0], s.hip[1] - 4.5], 0, 'disk', false);
  }
  return { shapes: out, phase };
}

// ---------------- Definisi gerakan ----------------
const LIE_LEGS: Leg = [45, 150, 60]; // telentang, lutut ditekuk, kaki menapak

export const MOVES: Record<string, Move> = {
  // ===== PUSH A =====
  'db floor press': {
    view: 'side', anchor: 'hip', db: 'both',
    frames: [
      { t: -90, a: [0, 0], l: LIE_LEGS },
      { t: -90, a: [100, 5], l: LIE_LEGS },
    ],
  },
  'db squeeze floor press': {
    view: 'side', anchor: 'hip', db: 'near',
    frames: [
      { t: -90, a: [0, 0], l: LIE_LEGS },
      { t: -90, a: [95, 10], l: LIE_LEGS },
    ],
  },
  'standing db shoulder press': {
    view: 'front', db: 'both',
    frames: [
      { a: [12, 2], l: [174, 178] },
      { a: [96, 0], l: [174, 178] },
    ],
  },
  'db lateral raise': {
    view: 'front', db: 'both',
    frames: [
      { a: [86, 80], l: [174, 178] },
      { a: [168, 166], l: [174, 178] },
    ],
  },
  'diamond push-up': {
    view: 'side', anchor: 'toeN', db: 'none', bend: { a: 1 },
    frames: [
      { t: 66, a: [178, 178], l: [246, 246, 170] },
      { t: 80, a: 'ik', l: [260, 260, 170] },
    ],
  },
  'one-arm db overhead triceps extension': {
    view: 'side', db: 'near',
    frames: [
      { h: 10, a: [8, 6], af: [178, 160] },
      { h: 10, a: [24, 205], af: [178, 160] },
    ],
  },
  // ===== PULL A =====
  'one-arm db row': {
    view: 'side', db: 'near',
    frames: [
      { t: 62, h: 75, a: [245, 178], af: [150, 175], l: [160, 188], lf: [198, 192] },
      { t: 62, h: 75, a: [172, 172], af: [150, 175], l: [160, 188], lf: [198, 192] },
    ],
  },
  'db renegade row': {
    view: 'side', anchor: 'toeN', db: 'both', mode: 'loop', durs: [1, 1, 1, 1],
    frames: [
      { t: 66, a: [178, 178], l: [246, 246, 170], label: 'PLANK' },
      { t: 66, a: [250, 182], af: 'ik', l: [246, 246, 170], label: 'TARIK KANAN' },
      { t: 66, a: 'ik', af: 'ik', l: [246, 246, 170], label: 'PLANK' },
      { t: 66, a: 'ik', af: [250, 182], l: [246, 246, 170], label: 'TARIK KIRI' },
    ],
  },
  'db reverse fly': {
    view: 'front', db: 'both',
    frames: [
      { ts: 0.55, h: 0, a: [96, 92], l: [172, 186] },
      { ts: 0.55, h: 0, a: [176, 178], l: [172, 186] },
    ],
  },
  'superman pull': {
    view: 'side', anchor: 'hip', db: 'none',
    frames: [
      { t: 80, h: 76, a: [250, 285], l: [278, 278, 270] },
      { t: 80, h: 76, a: [320, 330], as: 0.25, l: [278, 278, 270] },
      { t: 80, h: 76, a: [432, 432], l: [278, 278, 270] },
    ],
  },
  'db bicep curl': {
    view: 'side', db: 'both',
    frames: [
      { a: [172, 18], db: 'disk' },
      { a: [178, 178], db: 'disk' },
    ],
  },
  'db hammer curl': {
    view: 'side', db: 'both',
    frames: [
      { a: [172, 25], db: 'bar' },
      { a: [178, 178], db: 'bar' },
    ],
  },
  // ===== LEG A =====
  'db goblet squat': {
    view: 'side', db: 'goblet',
    frames: [
      { t: 4, a: [165, 18], l: [180, 180] },
      { t: 30, a: [150, 40], l: [96, 200] },
    ],
  },
  'db bulgarian split squat': {
    view: 'side', db: 'both', groundFrame: 0, props: [{ type: 'box', under: 'ankleF', w: 26, dx: -6 }], bend: { lf: 1 },
    frames: [
      { t: 4, a: [178, 178], l: [162, 186], lf: [212, 238, 200] },
      { t: 14, a: [178, 178], l: [100, 196], lf: 'ik' },
    ],
  },
  'db romanian deadlift': {
    view: 'side', db: 'both',
    frames: [
      { t: 2, a: [178, 178], l: [176, 184] },
      { t: 78, h: 72, a: [178, 178], l: [170, 186] },
    ],
  },
  'single-leg glute bridge': {
    view: 'side', anchor: 'shoulder', db: 'none', bend: { l: -1 },
    frames: [
      { t: 250, a: [100, 95], l: [72, 170, 70], lf: [72, 72, 72] },
      { t: 270, a: [100, 95], l: 'ik', lf: [58, 58, 58] },
    ],
  },
  'db standing calf raise': {
    view: 'side', anchor: 'toeN', db: 'both', lift: 14, props: [{ type: 'box', under: 'toeN', w: 30, dx: 12 }],
    frames: [
      { a: [178, 178], l: [180, 180, 150] },
      { a: [178, 178], l: [180, 180, 70] },
    ],
  },
  plank: {
    view: 'side', anchor: 'toeN', db: 'none', mode: 'hold',
    frames: [
      { t: 76, a: [180, 90], l: [256, 256, 170] },
      { t: 75, a: [181, 90], l: [255, 255, 170] },
    ],
  },
  // ===== PUSH B =====
  'feet-elevated push-up': {
    view: 'side', anchor: 'toeN', db: 'none', bend: { a: 1 }, props: [{ type: 'box', under: 'toeN', w: 22 }],
    frames: [
      { t: 98, a: [180, 180], l: [278, 278, 175] },
      { t: 104, a: 'ik', l: [284, 284, 175] },
    ],
  },
  'db floor fly': {
    view: 'top', db: 'both',
    frames: [
      { a: [90, 92], as: 0.22, l: [180, 180], ls: 0.7 },
      { a: [90, 95], as: 1, l: [180, 180], ls: 0.7 },
    ],
  },
  'pike push-up': {
    view: 'side', anchor: 'toeN', db: 'none', bend: { a: 1 },
    frames: [
      { t: 140, h: 160, a: [152, 152], l: [218, 218, 120] },
      { t: 152, h: 175, a: 'ik', l: [212, 212, 120] },
    ],
  },
  'db arnold press': {
    view: 'front', db: 'both',
    frames: [
      { a: [10, 2], l: [174, 178] },
      { a: [96, 0], l: [174, 178] },
      { a: [196, 345], l: [174, 178] },
    ],
  },
  'close-grip push-up': {
    view: 'side', anchor: 'toeN', db: 'none', bend: { a: 1 },
    frames: [
      { t: 66, a: [180, 180], l: [246, 246, 170] },
      { t: 80, a: 'ik', l: [260, 260, 170] },
    ],
  },
  'db triceps kickback': {
    view: 'side', db: 'near',
    frames: [
      { t: 60, h: 72, a: [242, 242], af: [150, 175], l: [160, 188], lf: [198, 192] },
      { t: 60, h: 72, a: [242, 165], af: [150, 175], l: [160, 188], lf: [198, 192] },
    ],
  },
  // ===== PULL B =====
  'db bent-over row': {
    view: 'side', db: 'both',
    frames: [
      { t: 55, h: 68, a: [248, 186], l: [164, 192] },
      { t: 55, h: 68, a: [176, 176], l: [164, 192] },
    ],
  },
  'prone y-t-w raise': {
    view: 'top', db: 'none', mode: 'loop', durs: [1.2, 1.2, 1.2],
    frames: [
      { a: [28, 28], l: [180, 180], label: 'Y' },
      { a: [90, 90], l: [180, 180], label: 'T' },
      { a: [118, 40], l: [180, 180], label: 'W' },
    ],
  },
  'db pullover': {
    view: 'side', anchor: 'hip', db: 'goblet',
    frames: [
      { t: -90, a: [0, 0], l: LIE_LEGS },
      { t: -90, a: [-80, -95], l: LIE_LEGS },
    ],
  },
  'superman hold + row': {
    view: 'side', anchor: 'hip', db: 'none',
    frames: [
      { t: 80, h: 76, a: [245, 290], l: [278, 278, 270] },
      { t: 80, h: 76, a: [320, 335], as: 0.3, l: [278, 278, 270] },
      { t: 80, h: 76, a: [410, 430], l: [278, 278, 270] },
    ],
  },
  'db concentration curl': {
    view: 'side', db: 'near', props: [{ type: 'box', under: 'hip', w: 26, dx: -2 }],
    frames: [
      { t: 38, h: 55, a: [165, 20], af: [150, 120], l: [92, 180], lf: [92, 180] },
      { t: 38, h: 55, a: [165, 172], af: [150, 120], l: [92, 180], lf: [92, 180] },
    ],
  },
  'db zottman curl': {
    view: 'side', db: 'both', mode: 'loop', durs: [3, 1, 1, 1],
    frames: [
      { a: [172, 22], db: 'disk', label: 'PUTAR' },
      { a: [178, 178], db: 'bar', label: 'TURUN (PRONASI)' },
      { a: [178, 178], db: 'disk', label: 'PUTAR' },
      { a: [172, 22], db: 'disk', label: 'NAIK' },
    ],
  },
  // ===== LEG B =====
  'db reverse lunge': {
    view: 'side', db: 'both',
    frames: [
      { t: 2, a: [178, 178], l: [178, 182], lf: [182, 180] },
      { t: 6, a: [178, 178], l: [100, 188], lf: [200, 262, 175] },
    ],
  },
  'db step-up': {
    view: 'side', db: 'both', groundFrame: 1, props: [{ type: 'box', under: 'ankleN', w: 30, dx: 3 }],
    frames: [
      { t: 2, a: [178, 178], l: [180, 180], lf: [182, 178] },
      { t: 14, a: [178, 178], l: [118, 196], lf: [190, 186] },
    ],
  },
  'single-leg rdl': {
    view: 'side', db: 'both',
    frames: [
      { t: 2, a: [178, 178], l: [178, 182], lf: [190, 196, 120] },
      { t: 84, h: 78, a: [178, 178], l: [172, 186], lf: [262, 264, 175] },
    ],
  },
  'db hip thrust': {
    view: 'side', anchor: 'shoulder', groundFrame: 0, db: 'hip', bend: { l: -1 },
    props: [{ type: 'box', under: 'shoulder', w: 22, dx: -6 }],
    frames: [
      { t: 256, a: [130, 60], l: [86, 182, 90] },
      { t: 300, a: [150, 70], l: 'ik' },
    ],
  },
  'single-leg calf raise': {
    view: 'side', anchor: 'toeN', db: 'near', lift: 14, props: [{ type: 'box', under: 'toeN', w: 30, dx: 12 }],
    frames: [
      { a: [178, 178], af: [178, 170], l: [180, 180, 150], lf: [192, 262, 170] },
      { a: [178, 178], af: [178, 170], l: [180, 180, 70], lf: [192, 262, 170] },
    ],
  },
  'hollow body hold': {
    view: 'side', anchor: 'hip', db: 'none', mode: 'hold',
    frames: [
      { t: 282, h: 300, a: [290, 290], l: [76, 76, 80] },
      { t: 280, h: 298, a: [288, 288], l: [78, 78, 82] },
    ],
  },
};

export const moveKey = (name: string) => name.trim().toLowerCase();
export const getMove = (name: string): Move | undefined => MOVES[moveKey(name)];
