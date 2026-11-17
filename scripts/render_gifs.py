"""Render GIF contoh gerakan dari JSON hasil scripts/export-moves.mjs.

Pemakaian:
    node --experimental-strip-types scripts/export-moves.mjs /tmp/moves.json
    python3 scripts/render_gifs.py /tmp/moves.json docs/gerakan
"""
import json
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

SS = 3  # supersampling
OUT_W = 400  # lebar GIF
HEADER = 46
FOOTER = 30

FONT_DIR = os.path.join(os.path.dirname(__file__), '..', 'node_modules', '@expo-google-fonts')


def font(path, size):
    try:
        return ImageFont.truetype(os.path.join(FONT_DIR, path), size)
    except OSError:
        return ImageFont.load_default()


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


BG = hex_rgb('#0A0812')


def mix(c, o):
    rgb = hex_rgb(c)
    return tuple(round(BG[i] + (rgb[i] - BG[i]) * o) for i in range(3))


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def draw_frame(shapes, vb, scale):
    w, h = int(vb['w'] * scale), int(vb['h'] * scale)
    im = Image.new('RGB', (w, h), BG)
    d = ImageDraw.Draw(im)
    for s in shapes:
        o = s.get('o', 1)
        if s['k'] == 'line':
            col = mix(s['c'], o)
            lw = max(1, round(s['w'] * scale))
            x1, y1, x2, y2 = (s['x1'] * scale, s['y1'] * scale, s['x2'] * scale, s['y2'] * scale)
            d.line((x1, y1, x2, y2), fill=col, width=lw)
            r = lw / 2
            d.ellipse((x1 - r, y1 - r, x1 + r, y1 + r), fill=col)
            d.ellipse((x2 - r, y2 - r, x2 + r, y2 + r), fill=col)
        elif s['k'] == 'circle':
            cx, cy, r = s['cx'] * scale, s['cy'] * scale, s['r'] * scale
            fill = None if s['fill'] == 'none' else mix(s['fill'], o)
            outline = mix(s['stroke'], o) if s.get('stroke') else None
            width = max(1, round((s.get('w') or 0) * scale)) if outline else 0
            d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fill, outline=outline, width=width)
        elif s['k'] == 'rect':
            x, y = s['x'] * scale, s['y'] * scale
            d.rounded_rectangle((x, y, x + s['w'] * scale, y + s['h'] * scale), radius=2 * scale,
                                fill=mix(s['fill'], o), outline=mix(s['stroke'], o) if s.get('stroke') else None,
                                width=max(1, round(s.get('sw', 1) * scale)))
    return im


def main(src, out_dir):
    data = json.load(open(src))
    vb = data['vb']
    os.makedirs(out_dir, exist_ok=True)
    scale_out = OUT_W / vb['w']
    fig_h = int(vb['h'] * scale_out)
    title_f = font('chivo/800ExtraBold/Chivo_800ExtraBold.ttf', 19)
    sub_f = font('jetbrains-mono/500Medium/JetBrainsMono_500Medium.ttf', 12)
    phase_f = font('chivo/700Bold/Chivo_700Bold.ttf', 13)
    index = []
    for m in data['moves']:
        frames = []
        for fr in m['frames']:
            big = draw_frame(fr['shapes'], vb, scale_out * SS)
            fig = big.resize((OUT_W, fig_h), Image.LANCZOS)
            canvas = Image.new('RGB', (OUT_W, HEADER + fig_h + FOOTER), BG)
            canvas.paste(fig, (0, HEADER))
            d = ImageDraw.Draw(canvas)
            d.text((14, 8), m['name'].upper(), font=title_f, fill=hex_rgb('#d0bcff'))
            tempo = m.get('tempo') or ''
            sub = (m.get('workout') or '') + (f' · tempo {"-".join(tempo)}' if tempo else '')
            d.text((14, 29), sub, font=sub_f, fill=hex_rgb('#958ea0'))
            d.line((0, HEADER - 1, OUT_W, HEADER - 1), fill=hex_rgb('#221e2e'))
            yb = HEADER + fig_h
            d.line((0, yb, OUT_W, yb), fill=hex_rgb('#1d1829'))
            d.ellipse((14, yb + 11, 22, yb + 19), fill=hex_rgb('#34D399'))
            d.text((30, yb + 7), fr['phase'] or '', font=phase_f, fill=hex_rgb('#34D399'))
            d.text((OUT_W - 110, yb + 8), 'SHADOW FIT', font=sub_f, fill=hex_rgb('#5d5770'))
            frames.append(canvas.quantize(colors=64, method=Image.MEDIANCUT, dither=Image.NONE))
        ms = 1000 * m['duration'] / len(frames)
        # gabungkan frame identik berturut-turut (fase jeda) → file lebih kecil
        uniq, durs = [], []
        for f in frames:
            if uniq and f.tobytes() == uniq[-1].tobytes():
                durs[-1] += ms
            else:
                uniq.append(f)
                durs.append(ms)
        name = slug(m['name'])
        path = os.path.join(out_dir, f'{name}.gif')
        uniq[0].save(path, save_all=True, append_images=uniq[1:], duration=[round(d) for d in durs], loop=0, optimize=True, disposal=1)
        frames = uniq
        index.append((m.get('day') or 9, m.get('workout') or '', m['name'], f'{name}.gif'))
        print(f'{path}  ({len(frames)} frame, {os.path.getsize(path) // 1024} KB)')
    # README galeri
    index.sort()
    days = {1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu'}
    lines = ['# Contoh Gerakan (animasi)', '', 'Animasi vektor setiap gerakan Program Hipertrofi 8 Minggu, diputar sesuai tempo program.',
             'Dibuat otomatis dengan `scripts/export-moves.mjs` + `scripts/render_gifs.py` dari definisi di `src/anim/moves.ts`.', '']
    cur = None
    for day, workout, name, file in index:
        if workout != cur:
            cur = workout
            lines += ['', f'## {days.get(day, "")} — {workout}', '']
        lines.append(f'**{name}**  ')
        lines.append(f'![{name}]({file})')
        lines.append('')
    open(os.path.join(out_dir, 'README.md'), 'w').write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
