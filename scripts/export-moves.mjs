// Ekspor bentuk vektor per frame untuk semua gerakan (JSON) → dipakai scripts/render_gifs.py
// Jalankan: node --experimental-strip-types scripts/export-moves.mjs out.json
import { writeFileSync } from 'node:fs';
import { MOVES, prepare, timeline, cycleLength, render, VB } from '../src/anim/moves.ts';
import { programWorkouts } from '../src/store/program8.ts';

const FPS = 10;
const tempoOf = {};
const display = {};
for (const w of programWorkouts()) for (const e of w.exercises) {
  tempoOf[e.name.toLowerCase()] = e.tempo;
  display[e.name.toLowerCase()] = { name: e.name, workout: w.name, day: w.day };
}

const out = { vb: VB, fps: FPS, moves: [] };
for (const [key, move] of Object.entries(MOVES)) {
  const prep = prepare(move);
  const segs = timeline(move, tempoOf[key]);
  const total = cycleLength(segs);
  const n = Math.min(160, Math.max(12, Math.round(total * FPS)));
  const frames = [];
  for (let i = 0; i < n; i++) {
    const { shapes, phase } = render(prep, segs, (total * i) / n);
    frames.push({ shapes, phase });
  }
  out.moves.push({ key, ...(display[key] ?? { name: key }), tempo: tempoOf[key] ?? '', duration: total, frames });
}
writeFileSync(process.argv[2] || 'moves.json', JSON.stringify(out));
console.log(`${out.moves.length} gerakan`);
