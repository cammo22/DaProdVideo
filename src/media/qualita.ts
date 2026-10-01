// Quanto è venuta bene una foto: nitidezza (quanto cambiano i bordi), luce (né buia né bruciata) e contrasto; e una
// "firma" di 64 bit per riconoscere le foto quasi uguali (le raffiche del telefono). DaProdMontage ne ha bisogno per
// scegliere quando le foto sono più di quelle che servono. Lavora su un'immagine piccola (96..128 punti).
import type { Pixel } from './campiona';

export interface Qualita { nitidezza: number; luce: number; contrasto: number; punteggio: number; firma: string }

const grigio = (p: { w: number; h: number; data: Uint8ClampedArray | Uint8Array }) => {
  const g = new Float32Array(p.w * p.h);
  for (let i = 0; i < g.length; i++) g[i] = (p.data[i * 4] * 0.299 + p.data[i * 4 + 1] * 0.587 + p.data[i * 4 + 2] * 0.114) / 255;
  return g;
};

/** 16 cifre esadecimali: ogni bit dice se un quadratino dell'8×8 è più chiaro della media */
export function firmaImmagine(g: Float32Array, w: number, h: number): string {
  const celle = new Float32Array(64);
  for (let cy = 0; cy < 8; cy++) for (let cx = 0; cx < 8; cx++) {
    const x0 = Math.floor((cx * w) / 8), x1 = Math.max(x0 + 1, Math.floor(((cx + 1) * w) / 8)), y0 = Math.floor((cy * h) / 8), y1 = Math.max(y0 + 1, Math.floor(((cy + 1) * h) / 8));
    let s = 0, n = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { s += g[y * w + x]; n++; }
    celle[cy * 8 + cx] = s / Math.max(1, n);
  }
  const media = celle.reduce((a, b) => a + b, 0) / 64;
  let out = '';
  for (let i = 0; i < 64; i += 4) out += ((celle[i] > media ? 8 : 0) | (celle[i + 1] > media ? 4 : 0) | (celle[i + 2] > media ? 2 : 0) | (celle[i + 3] > media ? 1 : 0)).toString(16);
  return out;
}

export function misuraQualita(p: Pixel): Qualita {
  const { w, h } = p;
  const g = grigio(p);
  let somma = 0, somma2 = 0;
  for (const v of g) { somma += v; somma2 += v * v; }
  const media = somma / g.length, sd = Math.sqrt(Math.max(0, somma2 / g.length - media * media));
  // la nitidezza: varianza del laplaciano (i bordi netti la alzano, la sfocatura la abbassa)
  let l = 0, l2 = 0, n = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const v = 4 * g[y * w + x] - g[y * w + x - 1] - g[y * w + x + 1] - g[(y - 1) * w + x] - g[(y + 1) * w + x];
    l += v; l2 += v * v; n++;
  }
  const varL = n ? l2 / n - (l / n) ** 2 : 0;
  const nitidezza = Math.max(0, Math.min(1, Math.log10(1 + varL * 800) / 2.6));
  const luce = Math.max(0, Math.min(1, 1 - Math.abs(media - 0.48) * 2.1));
  const contrasto = Math.max(0, Math.min(1, sd / 0.22));
  const punteggio = 0.55 * nitidezza + 0.3 * luce + 0.15 * contrasto;
  return { nitidezza, luce, contrasto, punteggio, firma: firmaImmagine(g, w, h) };
}
