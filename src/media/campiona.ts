// Prendere un fotogramma di una ripresa (o un'immagine) in piccolo, come pixel RGBA da guardare: serve al contagocce
// della chiave, al colore dello sfondo trovato da solo e al ritaglio con l'AI. Già girato per il verso giusto.
import { VideoSampleSink } from 'mediabunny';
import { mediaRT } from './libreria';

export interface Pixel { w: number; h: number; data: Uint8ClampedArray; t: number }

let tela: OffscreenCanvas | null = null;

/** le misure a cui portare w×h perché il lato lungo sia "lato" (mai ingrandire) */
export function misuraPer(w: number, h: number, lato: number): { w: number; h: number } {
  const k = Math.min(1, lato / Math.max(w, h, 1));
  return { w: Math.max(2, Math.round(w * k)), h: Math.max(2, Math.round(h * k)) };
}

function leggi(w0: number, h0: number, lato: number, t: number, disegna: (ctx: OffscreenCanvasRenderingContext2D, w: number, h: number) => void): Pixel {
  const { w, h } = misuraPer(w0, h0, lato);
  if (!tela || tela.width !== w || tela.height !== h) tela = new OffscreenCanvas(w, h);
  const ctx = tela.getContext('2d', { willReadFrequently: true })!;
  ctx.clearRect(0, 0, w, h);
  disegna(ctx, w, h);
  return { w, h, data: ctx.getImageData(0, 0, w, h).data, t };
}

/** la grandezza dell'immagine che si vede (con la rotazione dei metadati) */
export function grandezzaMedia(mediaId: string): { w: number; h: number } | null {
  const r = mediaRT(mediaId);
  if (r?.image) return { w: r.image.width, h: r.image.height };
  return null;
}

/**
 * Il fotogramma di "mediaId" all'istante t (secondi della sorgente), con il lato lungo al massimo "lato".
 * Una sola chiamata alla volta per tela: i dati si copiano, si possono tenere.
 */
export async function pixelAl(mediaId: string, t: number, lato = 512): Promise<Pixel | null> {
  const r = mediaRT(mediaId);
  if (!r) return null;
  if (r.image) {
    const img = r.image;
    const p = leggi(img.width, img.height, lato, t, (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h));
    return { ...p, data: new Uint8ClampedArray(p.data) };
  }
  if (!r.v || !r.vDecodable) return null;
  const sink = new VideoSampleSink(r.v);
  const s = await sink.getSample(Math.max(0, t));
  if (!s) return null;
  try {
    const w0 = s.rotation % 180 ? s.displayHeight : s.displayWidth, h0 = s.rotation % 180 ? s.displayWidth : s.displayHeight;
    const p = leggi(w0, h0, lato, s.timestamp, (ctx) => s.drawWithFit(ctx, { fit: 'fill' }));
    return { ...p, data: new Uint8ClampedArray(p.data) };
  } finally { s.close(); }
}

/** il colore al punto (x, y in frazioni 0..1) — la media di un quadratino di 5×5 pixel, per non prendere il rumore */
export function coloreIn(p: Pixel, x: number, y: number, raggio = 2): [number, number, number] {
  const cx = Math.max(0, Math.min(p.w - 1, Math.round(x * p.w - 0.5))), cy = Math.max(0, Math.min(p.h - 1, Math.round(y * p.h - 0.5)));
  let r = 0, g = 0, b = 0, n = 0;
  for (let j = -raggio; j <= raggio; j++) {
    for (let i = -raggio; i <= raggio; i++) {
      const xx = cx + i, yy = cy + j;
      if (xx < 0 || yy < 0 || xx >= p.w || yy >= p.h) continue;
      const k = (yy * p.w + xx) * 4;
      r += p.data[k]; g += p.data[k + 1]; b += p.data[k + 2]; n++;
    }
  }
  return n ? [r / n, g / n, b / n] : [0, 0, 0];
}
