// I sottotitoli: le righe con il loro tempo, il file .srt (esporta e importa: così si possono anche portare
// quelli fatti con altri programmi o con l'AI) e i "tempi dai dialoghi": il programma ascolta dove si parla e
// prepara le righe vuote al punto giusto, così resta solo da scrivere.
import type { Project, Sottotitolo, Sottotitoli } from './tipi';
import { end, uid } from './progetto';
import { fps } from './timecode';
import { mediaRT, PEAKS_PER_SEC } from '../media/libreria';

export const SOTTO0: Sottotitoli = { righe: [], nelVideo: true, dimensione: 46, fascia: true, alto: false, lingua: 'it' };

export const LINGUE: [string, string][] = [
  ['it', 'Italiano'], ['en', 'Inglese'], ['es', 'Spagnolo'], ['fr', 'Francese'], ['de', 'Tedesco'], ['pt', 'Portoghese'],
  ['nap', 'Napoletano'], ['ar', 'Arabo'], ['zh', 'Cinese'], ['ja', 'Giapponese'],
];

export const sottotitoliDi = (p: Project): Sottotitoli => p.sottotitoli ?? SOTTO0;

/**
 * Dove si parla, in fotogrammi. Si ascolta l'audio delle riprese (le clip audio legate a un video: la presa
 * diretta, non la musica); se non ce ne sono, tutto l'audio. Soglia sul rumore di fondo, pause brevi unite,
 * frasi lunghe spezzate.
 */
export function tempiDaiDialoghi(p: Project): { da: number; a: number }[] {
  const r = fps(p.rate);
  const audio = new Set(p.tracks.filter((t) => t.kind === 'audio' && !t.mute).map((t) => t.id));
  const tutte = p.clips.filter((c) => c.kind === 'media' && audio.has(c.track) && c.media && mediaRT(c.media)?.peaks);
  const video = new Set(p.tracks.filter((t) => t.kind === 'video').map((t) => t.id));
  const presa = tutte.filter((c) => c.link && p.clips.some((v) => v.link === c.link && video.has(v.track)));
  const clip = presa.length ? presa : tutte;
  if (!clip.length) return [];
  const fine = Math.max(...clip.map(end));
  const passo = 1 / PEAKS_PER_SEC;
  const n = Math.ceil((fine / r) / passo);
  const en = new Float32Array(n);
  for (const c of clip) {
    const pk = mediaRT(c.media!)!.peaks!;
    const g = Math.pow(10, (c.gain <= -60 ? -120 : c.gain) / 20);
    const a = Math.floor((c.start / r) / passo), b = Math.min(n, Math.ceil((end(c) / r) / passo));
    for (let i = a; i < b; i++) {
      const src = Math.floor((c.srcIn + (i * passo - c.start / r) * c.speed) * PEAKS_PER_SEC);
      if (src >= 0 && src < pk.length) en[i] = Math.max(en[i], pk[src] * g);
    }
  }
  // la soglia: un po' sopra il rumore di fondo (il 25° percentile dei momenti non muti)
  const db = (x: number) => 20 * Math.log10(Math.max(1e-6, x));
  const vivi = Array.from(en).filter((x) => x > 1e-4).map(db).sort((x, y) => x - y);
  if (!vivi.length) return [];
  const soglia = Math.max(vivi[Math.floor(vivi.length * 0.25)] + 9, -40);
  // si liscia su 60 ms, poi si cercano i tratti sopra la soglia
  const L = 3;
  const su: boolean[] = [];
  for (let i = 0; i < n; i++) {
    let m = 0;
    for (let k = Math.max(0, i - L); k <= Math.min(n - 1, i + L); k++) if (en[k] > m) m = en[k];
    su.push(db(m) > soglia);
  }
  let pezzi: [number, number][] = [];
  for (let i = 0; i < n;) {
    if (!su[i]) { i++; continue; }
    let j = i;
    while (j < n && su[j]) j++;
    pezzi.push([i * passo, j * passo]);
    i = j;
  }
  // pause sotto i 0,35 s: stessa frase
  const uniti: [number, number][] = [];
  for (const x of pezzi) {
    const u = uniti[uniti.length - 1];
    if (u && x[0] - u[1] < 0.35) u[1] = x[1]; else uniti.push([x[0], x[1]]);
  }
  pezzi = uniti.filter(([a, b]) => b - a >= 0.4);
  // frasi lunghe: a pezzi di circa 4 secondi (un sottotitolo si legge in fretta)
  const out: { da: number; a: number }[] = [];
  for (const [a0, b0] of pezzi) {
    const a = Math.max(0, a0 - 0.1), b = b0 + 0.15;
    const quanti = Math.max(1, Math.round((b - a) / 4));
    for (let k = 0; k < quanti; k++) {
      const x = a + ((b - a) * k) / quanti, y = a + ((b - a) * (k + 1)) / quanti;
      out.push({ da: Math.round(x * r), a: Math.round(y * r) });
    }
  }
  return out;
}

/** righe nuove (vuote) dove si parla, senza toccare quelle già scritte */
export function righeDaiDialoghi(p: Project): number {
  const s = (p.sottotitoli ??= structuredClone(SOTTO0));
  let n = 0;
  for (const t of tempiDaiDialoghi(p)) {
    if (s.righe.some((r) => r.da < t.a && r.a > t.da)) continue;
    s.righe.push({ id: uid('s'), da: t.da, a: t.a, testo: '' });
    n++;
  }
  s.righe.sort((x, y) => x.da - y.da);
  return n;
}

// ——— il file .srt ———

function tcSrt(sec: number): string {
  const ms = Math.max(0, Math.round(sec * 1000));
  const hh = Math.floor(ms / 3600000), mm = Math.floor((ms % 3600000) / 60000), ss = Math.floor((ms % 60000) / 1000), mi = ms % 1000;
  const d = (x: number, n = 2) => String(x).padStart(n, '0');
  return `${d(hh)}:${d(mm)}:${d(ss)},${d(mi, 3)}`;
}

export function creaSrt(p: Project): string {
  const r = fps(p.rate);
  return sottotitoliDi(p).righe.filter((x) => x.testo.trim()).sort((a, b) => a.da - b.da)
    .map((x, i) => `${i + 1}\n${tcSrt(x.da / r)} --> ${tcSrt(x.a / r)}\n${x.testo.trim()}\n`).join('\n');
}

/** legge un .srt (o un .vtt): ritorna le righe in fotogrammi */
export function leggiSrt(testo: string, p: Project): Sottotitolo[] {
  const r = fps(p.rate);
  const sec = (t: string) => { const m = t.trim().replace(',', '.').match(/(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)/); return m ? Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]) : NaN; };
  const out: Sottotitolo[] = [];
  for (const blocco of testo.replace(/\r/g, '').split(/\n\s*\n/)) {
    const righe = blocco.split('\n').filter((x) => x.trim() && x.trim() !== 'WEBVTT');
    const i = righe.findIndex((x) => x.includes('-->'));
    if (i < 0) continue;
    const [a, b] = righe[i].split('-->');
    const da = sec(a), fino = sec(b.split(' ').filter(Boolean)[0] ?? '');
    if (!Number.isFinite(da) || !Number.isFinite(fino) || fino <= da) continue;
    out.push({ id: uid('s'), da: Math.round(da * r), a: Math.round(fino * r), testo: righe.slice(i + 1).join('\n').replace(/<[^>]+>/g, '') });
  }
  return out;
}
