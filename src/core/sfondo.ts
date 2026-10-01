// Togliere lo sfondo: le cose pure (niente browser, niente modelli) che servono sia alla chiave a colori sia al
// ritaglio con l'AI: i valori di partenza, la firma dei parametri, dove cadono i campioni nel tempo, il colore
// dello sfondo trovato da solo, il riquadro di una maschera, la levigatura da un fotogramma all'altro.
import type { Clip, MediaItem, Ritaglio, VideoFx } from './tipi';

export const RITAGLIO0: Ritaglio = { modo: 'soggetto', modello: 'ben2', bordo: 0, morbido: 0.3, qualita: 1 };

/** precisione: fotogrammi al secondo, lato lungo dell'immagine che si dà al modello, e il nome */
export const QUALITA_RITAGLIO = [
  { nome: 'Veloce', hz: 4, lato: 384 },
  { nome: 'Buona', hz: 8, lato: 512 },
  { nome: 'Alta', hz: 12, lato: 768 },
] as const;

/** il tetto di memoria per tutte le maschere di una clip (se sono troppe si guarda un po' meno spesso) */
export const BUDGET_MASCHERE = 120 * 1024 * 1024;

/** le chiavi a colori al loro valore di partenza */
export const CHIAVI = [
  { id: 'verde', nome: 'Green screen', colore: '#00b140' },
  { id: 'verdeVivo', nome: 'Verde vivo', colore: '#00ff2a' },
  { id: 'blu', nome: 'Blue screen', colore: '#0047bb' },
  { id: 'magenta', nome: 'Magenta', colore: '#ff00cc' },
] as const;

export const SPILL0 = 0.5;

/** i colori della chiave accesi (il principale più gli altri, al massimo tre) */
export const coloriChiave = (fx: Pick<VideoFx, 'keyColor' | 'keyColori'>) => [fx.keyColor, ...(fx.keyColori ?? [])].slice(0, 3);

export function hexRgb(h: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})/i.exec(h ?? '');
  if (!m) return [0, 0, 0];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const rgbHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

/** la firma dei parametri di un ritaglio: se cambia, le maschere fatte non valgono più */
export function firmaRitaglio(media: string, r: Ritaglio): string {
  const punti = r.modo === 'oggetti' ? (r.punti ?? []).map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)},${p.dentro ? 1 : 0}`).join(';') : '';
  return [media, r.modo, r.modello, r.qualita, punti, r.modo === 'oggetti' ? (r.da ?? 0).toFixed(2) : '', r.segui ? 's' : ''].join('|');
}

/** i fotogrammi da elaborare: da "da" a "a" (secondi della sorgente), ogni 1/hz, abbassando hz se le maschere
 *  non starebbero nel budget (w×h byte l'una). Mai meno di 2 al secondo. */
export function istantiCampioni(da: number, a: number, hz: number, w: number, h: number, budget = BUDGET_MASCHERE): { t0: number; dt: number; n: number; hz: number } {
  const durata = Math.max(1e-3, a - da);
  let f = Math.max(1, hz);
  const per = Math.max(1, w * h);
  while (f > 2 && Math.ceil(durata * f) + 1 > budget / per) f = Math.max(2, f - 1);
  const n = Math.max(1, Math.ceil(durata * f) + 1);
  return { t0: da, dt: n > 1 ? durata / (n - 1) : durata, n, hz: f };
}

/** fra quali due campioni cade il tempo t, e quanto verso il secondo (0..1) */
export function campioneAl(t: number, t0: number, dt: number, n: number): { i: number; j: number; k: number } {
  if (n <= 1 || dt <= 0) return { i: 0, j: 0, k: 0 };
  const x = Math.max(0, Math.min(n - 1, (t - t0) / dt));
  const i = Math.min(n - 2, Math.floor(x));
  return { i, j: i + 1, k: x - i };
}

/** il colore di sfondo che si vede lungo i bordi del fotogramma (per la chiave "trovalo da solo"): il colore
 *  più saturo che occupa almeno un quarto della cornice; se non c'è, la media della cornice */
export function coloreDominante(rgba: Uint8ClampedArray | Uint8Array, w: number, h: number): { colore: string; saturazione: number; quota: number } {
  const B = 24;
  const n = new Array<number>(B).fill(0), sr = new Array<number>(B).fill(0), sg = new Array<number>(B).fill(0), sb = new Array<number>(B).fill(0);
  const spessore = Math.max(2, Math.round(Math.min(w, h) * 0.08));
  let tot = 0, mr = 0, mg = 0, mb = 0;
  const passo = Math.max(1, Math.floor(Math.max(w, h) / 160));
  for (let y = 0; y < h; y += passo) {
    for (let x = 0; x < w; x += passo) {
      if (x >= spessore && x < w - spessore && y >= spessore && y < h - spessore) { x = Math.max(x, w - spessore - 1); continue; }
      const i = (y * w + x) * 4;
      const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      tot++; mr += r; mg += g; mb += b;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const s = mx ? (mx - mn) / mx : 0;
      if (s < 0.25 || mx < 40) continue;
      let hh: number;
      const d = mx - mn;
      if (mx === r) hh = ((g - b) / d + 6) % 6; else if (mx === g) hh = (b - r) / d + 2; else hh = (r - g) / d + 4;
      const k = Math.min(B - 1, Math.floor((hh / 6) * B));
      n[k]++; sr[k] += r; sg[k] += g; sb[k] += b;
    }
  }
  if (!tot) return { colore: '#00b140', saturazione: 0, quota: 0 };
  // un bucket e i due vicini (il verde di un fondale cade a cavallo di due)
  let best = 0, bk = -1;
  for (let k = 0; k < B; k++) {
    const c = n[k] + n[(k + 1) % B] + n[(k + B - 1) % B];
    if (c > best) { best = c; bk = k; }
  }
  if (bk >= 0 && best >= tot * 0.25) {
    let a = 0, r = 0, g = 0, b = 0;
    for (const k of [bk, (bk + 1) % B, (bk + B - 1) % B]) { a += n[k]; r += sr[k]; g += sg[k]; b += sb[k]; }
    const R = r / a, G = g / a, Bb = b / a, mx = Math.max(R, G, Bb), mn = Math.min(R, G, Bb);
    return { colore: rgbHex(R, G, Bb), saturazione: mx ? (mx - mn) / mx : 0, quota: best / tot };
  }
  return { colore: rgbHex(mr / tot, mg / tot, mb / tot), saturazione: 0, quota: 0 };
}

/** il riquadro di quello che la maschera tiene (frazioni 0..1), il centro e quanta parte dell'immagine occupa */
export function riquadroMaschera(m: Uint8Array, w: number, h: number, soglia = 128): { x0: number; y0: number; x1: number; y1: number; cx: number; cy: number; area: number } | null {
  let x0 = w, y0 = h, x1 = -1, y1 = -1, n = 0, sx = 0, sy = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (m[y * w + x] < soglia) continue;
      n++; sx += x; sy += y;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  if (!n) return null;
  return { x0: x0 / w, y0: y0 / h, x1: (x1 + 1) / w, y1: (y1 + 1) / h, cx: sx / n / w, cy: sy / n / h, area: n / (w * h) };
}

/** levigatura da un fotogramma all'altro: dove il vicino è quasi uguale si mescola un po' (meno tremolio sui bordi),
 *  dove è molto diverso è movimento vero e si lascia com'è */
export function levigaMaschere(ms: Uint8Array[]): void {
  if (ms.length < 3) return;
  let prima = Uint8Array.from(ms[0]);
  for (let i = 1; i < ms.length - 1; i++) {
    const m = ms[i], dopo = ms[i + 1];
    const mia = Uint8Array.from(m);
    for (let k = 0; k < m.length; k++) {
      const a = prima[k], b = dopo[k], v = mia[k];
      let s = v * 2, pesi = 2;
      if (Math.abs(a - v) < 48) { s += a; pesi++; }
      if (Math.abs(b - v) < 48) { s += b; pesi++; }
      m[k] = Math.round(s / pesi);
    }
    prima = mia;
  }
}

/** ridimensiona una maschera (bilineare) */
export function ridimensionaMaschera(m: Uint8Array, w: number, h: number, W: number, H: number): Uint8Array {
  if (w === W && h === H) return m;
  const o = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    const fy = Math.max(0, Math.min(h - 1, ((y + 0.5) * h) / H - 0.5)), y0 = Math.floor(fy), y1 = Math.min(h - 1, y0 + 1), ty = fy - y0;
    for (let x = 0; x < W; x++) {
      const fx = Math.max(0, Math.min(w - 1, ((x + 0.5) * w) / W - 0.5)), x0 = Math.floor(fx), x1 = Math.min(w - 1, x0 + 1), tx = fx - x0;
      const a = m[y0 * w + x0] * (1 - tx) + m[y0 * w + x1] * tx, b = m[y1 * w + x0] * (1 - tx) + m[y1 * w + x1] * tx;
      o[y * W + x] = Math.round(a * (1 - ty) + b * ty);
    }
  }
  return o;
}

/** l'istante della sorgente (secondi) dove la clip comincia e dove finisce */
export function trattoSorgente(c: Clip, r: number): { da: number; a: number } {
  return { da: c.srcIn, a: c.srcIn + (c.len / r) * c.speed };
}

/** il ritaglio vale per questa clip? (serve un video o un'immagine vera) */
export const puoRitagliare = (m: MediaItem | undefined) => !!m && (m.type === 'image' || m.type === 'video') && m.width > 0;
