"""Beri nama kelompok (community) knowledge graph Graphify secara otomatis.

Graphify mengacak nomor kelompok setiap kali graph dibangun ulang, jadi nama
manual mudah hilang. Skrip ini menamai kelompok berdasarkan file yang dominan.

Pemakaian (atau cukup: npm run graph):
    graphify update . && graphify cluster-only . --no-label
    python3 scripts/graph-labels.py
    graphify cluster-only .
"""
import collections
import json
import os
import sys

OUT = os.path.join(os.path.dirname(__file__), '..', 'graphify-out')

FILE_NAMES = {
    'src/app/session.tsx': 'Layar Aplikasi & Sesi Latihan',
    'src/store/logic.ts': 'Logika Game: XP, Atribut, Quest & Gelar',
    'src/store/types.ts': 'Model Data & State Store',
    'src/store/store.tsx': 'Model Data & State Store',
    'src/anim/moves.ts': 'Mesin Animasi Gerakan',
    'modules/shadow-lock/index.ts': 'Lockdown & Notifikasi (JS)',
    'src/notify/notify.ts': 'Root Layout, Daemon & Notifikasi',
    'src/app/_layout.tsx': 'Root Layout, Daemon & Notifikasi',
    'src/notify/plan.ts': 'Jadwal Notifikasi & Hari Latihan',
    'src/components/ui.tsx': 'UI Kit, Tema & Navigasi Tab',
    'src/theme.ts': 'UI Kit, Tema & Navigasi Tab',
    'src/components/charts.tsx': 'UI Kit, Tema & Navigasi Tab',
    'app.json': 'Konfigurasi app.json',
    'scripts/render_gifs.py': 'Render GIF Gerakan (Python)',
    'scripts/export-moves.mjs': 'Render GIF Gerakan (Python)',
    'scripts/make-icons.js': 'Generator Ikon Aplikasi',
    'tsconfig.json': 'Konfigurasi TypeScript',
    'modules/shadow-lock/package.json': 'Paket modul shadow-lock',
    'modules/shadow-lock/android/build.gradle': 'Gradle modul Lockdown',
    'src/store/program8.ts': 'Program 8 Minggu & Data Awal',
    'src/store/defaults.ts': 'Program 8 Minggu & Data Awal',
    'src/store/penalty.ts': 'Penalty Quest & Rest Pass',
    'src/components/penalty.tsx': 'Penalty Quest & Rest Pass',
    'src/store/dates.ts': 'Tanggal, Streak & Aturan Lockdown',
    'src/store/lock.ts': 'Tanggal, Streak & Aturan Lockdown',
    'src/store/attr-info.ts': 'Info Atribut & Cara Menaikkan',
    'src/components/attr-sheet.tsx': 'Info Atribut & Cara Menaikkan',
    'src/components/rest-banner.tsx': 'Rest Timer Global',
    'src/components/move-demo.tsx': 'Mesin Animasi Gerakan',
    'src/components/program.tsx': 'Program 8 Minggu & Data Awal',
}


def rel(path):
    path = (path or '').replace('\\', '/')
    marker = '/fittyfit/'
    return path.split(marker, 1)[1] if marker in path else path


def candidates(nodes):
    """Nama-nama kandidat, dari file paling dominan ke yang berikutnya"""
    files = collections.Counter(rel(n.get('source_file')) for n in nodes if n.get('source_file'))
    out = []
    ranked = files.most_common()
    for i, (f, count) in enumerate(ranked):
        # package.json hanya menentukan nama jika memang file paling dominan;
        # file lain dipertimbangkan jika memuat minimal 15% anggota kelompok
        if f == 'package.json' and i > 0:
            continue
        if i > 0 and count < 0.15 * len(nodes):
            break
        name = name_for(nodes, f)
        if name not in out:
            out.append(name)
    return out or [name_for(nodes, '')]


def name_for(nodes, top):
    labels = [n.get('label') or '' for n in nodes]
    if top == 'package.json':
        if 'dependencies' in labels:
            return 'Dependensi Runtime'
        if 'scripts' in labels:
            return 'Skrip npm'
        if 'package.json' in labels:
            return 'package.json & Dependensi Lain'
        pkg = next((l for l in labels if '@' not in l[1:]), labels[0])
        return f'Dependensi: {pkg}'
    if top.endswith('.kt'):
        return 'Modul Native Lockdown (Kotlin)'
    if top in FILE_NAMES:
        return FILE_NAMES[top]
    if top.startswith('src/app/'):
        return 'Layar Aplikasi & Sesi Latihan'
    return f'Kode: {os.path.basename(top) or "lainnya"}'


def main():
    graph = json.load(open(os.path.join(OUT, 'graph.json'), encoding='utf-8'))
    by = collections.defaultdict(list)
    for n in graph['nodes']:
        if n.get('community') is not None:
            by[n['community']].append(n)
    labels, used = {}, collections.Counter()
    for cid in sorted(by, key=lambda c: -len(by[c])):
        cands = candidates(by[cid])
        name = next((c for c in cands if c not in used), cands[0])
        used[name] += 1
        if used[name] > 1:
            name = f'{name} ({used[name]})'
        labels[str(cid)] = name
    json.dump(dict(sorted(labels.items(), key=lambda x: int(x[0]))), open(os.path.join(OUT, '.graphify_labels.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # signature lama & label sementara membuat graphify mengganti nama dengan nama file → hapus
    for f in ('.graphify_labels.json.sig', '.graphify_labels.pending.json'):
        try:
            os.remove(os.path.join(OUT, f))
        except FileNotFoundError:
            pass
    print(f'{len(labels)} kelompok diberi nama')


if __name__ == '__main__':
    sys.exit(main())
