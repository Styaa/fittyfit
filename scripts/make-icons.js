// Membuat ikon aplikasi Shadow Fit (SVG → PNG via Playwright Chromium)
// Jalankan: node scripts/make-icons.js
const { chromium } = require('playwright');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'images');

function hexPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Emblem: heksagon bercahaya + dumbbell diagonal. mode: 'color' | 'mono' */
function emblem(scale, mode) {
  const c = 512;
  const R = 330;
  const mono = mode === 'mono';
  const stroke = mono ? '#fff' : 'url(#edge)';
  const plate = mono ? '#fff' : 'url(#plate)';
  const handle = mono ? '#fff' : '#e9ddff';
  const db = `
    <g transform="rotate(-45 ${c} ${c})">
      <rect x="${c - 150}" y="${c - 17}" width="300" height="34" rx="17" fill="${handle}"/>
      <rect x="${c - 214}" y="${c - 108}" width="60" height="216" rx="18" fill="${plate}"/>
      <rect x="${c + 154}" y="${c - 108}" width="60" height="216" rx="18" fill="${plate}"/>
      <rect x="${c - 262}" y="${c - 78}" width="42" height="156" rx="14" fill="${plate}"/>
      <rect x="${c + 220}" y="${c - 78}" width="42" height="156" rx="14" fill="${plate}"/>
    </g>`;
  return `
  <g transform="translate(${c} ${c}) scale(${scale}) translate(${-c} ${-c})">
    ${mono ? '' : `<polygon points="${hexPoints(c, c, R)}" fill="#14102a"/>`}
    ${mono ? '' : `<polygon points="${hexPoints(c, c, R)}" fill="none" stroke="#8B5CF6" stroke-width="60" opacity="0.35" filter="url(#blur)"/>`}
    <polygon points="${hexPoints(c, c, R)}" fill="none" stroke="${stroke}" stroke-width="26" stroke-linejoin="round"/>
    ${mono ? '' : `<polygon points="${hexPoints(c, c, R - 44)}" fill="none" stroke="#8B5CF6" stroke-width="4" opacity="0.45"/>`}
    ${mono ? '' : `<g filter="url(#blur)" opacity="0.65">${db}</g>`}
    ${db}
    ${mono ? '' : `<circle cx="${c + 150}" cy="${c - 230}" r="10" fill="#fff" opacity="0.9"/><circle cx="${c + 150}" cy="${c - 230}" r="26" fill="#C4B5FD" opacity="0.25" filter="url(#blur)"/>`}
  </g>`;
}

function background() {
  // pola heksagon samar
  const hexes = [];
  const w = 56;
  const h = 97;
  for (let y = -h; y < 1024 + h; y += h * 0.75 * 1.0) {
    const row = Math.round(y / (h * 0.75));
    for (let x = -w; x < 1024 + w; x += w) {
      const ox = row % 2 ? w / 2 : 0;
      hexes.push(`<polygon points="${hexPoints(x + ox, y, h / 2 - 2)}" fill="none" stroke="#8B5CF6" stroke-opacity="0.07" stroke-width="2"/>`);
    }
  }
  return `
    <rect width="1024" height="1024" fill="#0A0812"/>
    <rect width="1024" height="1024" fill="url(#glow)"/>
    ${hexes.join('')}
    <rect width="1024" height="1024" fill="url(#vig)"/>`;
}

const defs = `
  <defs>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#E9DDFF"/><stop offset="0.5" stop-color="#C4B5FD"/><stop offset="1" stop-color="#8B5CF6"/>
    </linearGradient>
    <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C4B5FD"/><stop offset="1" stop-color="#7C3AED"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="60%">
      <stop offset="0" stop-color="#3b2a6e" stop-opacity="0.95"/><stop offset="1" stop-color="#0A0812" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="72%">
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/>
    </radialGradient>
    <filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>`;

const svg = (body, size = 1024) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">${defs}${body}</svg>`;

const files = [
  // ikon utama (iOS & umum): latar penuh, tanpa transparansi
  { name: 'icon.png', size: 1024, body: background() + emblem(1, 'color'), transparent: false },
  // Android adaptive: latar & depan terpisah (depan di zona aman ±66%)
  { name: 'android-icon-background.png', size: 1024, body: background(), transparent: false },
  { name: 'android-icon-foreground.png', size: 1024, body: emblem(0.78, 'color'), transparent: true },
  { name: 'android-icon-monochrome.png', size: 1024, body: emblem(0.78, 'mono'), transparent: true },
  // splash: emblem saja di atas latar #0A0812
  { name: 'splash-icon.png', size: 1024, body: emblem(1, 'color'), transparent: true },
  { name: 'favicon.png', size: 48, body: background() + emblem(1.12, 'color'), transparent: false },
];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 1 });
  for (const f of files) {
    await p.setViewportSize({ width: f.size, height: f.size });
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg(f.body, f.size)}</body></html>`);
    await p.screenshot({ path: path.join(OUT, f.name), omitBackground: f.transparent, clip: { x: 0, y: 0, width: f.size, height: f.size } });
    console.log('✓', f.name, f.size);
  }
  await b.close();
})();
