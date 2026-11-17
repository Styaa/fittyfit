// Membuat HTML lembar pratinjau semua gerakan (untuk pengecekan visual)
import { writeFileSync } from 'node:fs';
import { MOVES, prepare, timeline, cycleLength, render, VB, COLORS } from '../src/anim/moves.ts';

const toSvg = (shapes, label) => {
  const els = shapes.map((s) => {
    const o = s.o != null ? ` opacity="${s.o}"` : '';
    if (s.k === 'line') return `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="${s.c}" stroke-width="${s.w}" stroke-linecap="round"${o}/>`;
    if (s.k === 'circle') return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="${s.fill}" ${s.stroke ? `stroke="${s.stroke}" stroke-width="${s.w}"` : ''}${o}/>`;
    return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="2" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.sw}"${o}/>`;
  });
  return `<svg viewBox="0 0 ${VB.w} ${VB.h}" width="200" height="130" style="background:${COLORS.bg}">${els.join('')}<text x="4" y="10" fill="#958ea0" font-size="7" font-family="monospace">${label}</text></svg>`;
};

const only = process.argv[2];
let html = '<html><body style="background:#000;margin:0;font-family:monospace;color:#ccc">';
for (const [name, move] of Object.entries(MOVES)) {
  if (only && !name.includes(only)) continue;
  const prep = prepare(move);
  const segs = timeline(move, '3111');
  const total = cycleLength(segs);
  html += `<div style="display:flex;gap:2px;margin:2px"><div style="width:110px;font-size:10px">${name}</div>`;
  for (let i = 0; i < 5; i++) {
    const t = (total * i) / 5;
    const { shapes, phase } = render(prep, segs, t);
    html += toSvg(shapes, phase);
  }
  html += '</div>';
}
html += '</body></html>';
writeFileSync(process.argv[3] || '/tmp/anim-sheet.html', html);
console.log('ok');
