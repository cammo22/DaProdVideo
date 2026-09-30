// Il tracking: segna un oggetto in un fotogramma e il programma lo ritrova in tutti gli altri della ripresa.
// Si prende una tesserina attorno al punto, in bianco e nero e piccola (192 punti di larghezza); in ogni fotogramma
// dopo, si cerca dove somiglia di più (correlazione normalizzata: regge ai cambi di luce) attorno a dove era prima.
// La tesserina si aggiorna piano piano, così segue l'oggetto anche se cambia un po' (gira, si avvicina).
// Si va avanti dal punto segnato fino alla fine della clip e all'indietro fino all'inizio.
import { VideoSampleSink } from 'mediabunny';
import type { Traccia } from '../core/tipi';
import { levigaPunti } from '../core/traccia';
import { mediaRT } from './libreria';

/** larghezza di lavoro in punti (basta e avanza, e il conto è veloce) */
const LAV = 192;
/** quanti fotogrammi al secondo si guardano al massimo (in mezzo si va in linea retta) */
const HZ = 20;

interface Grigio { w: number; h: number; d: Uint8Array; t: number }

export interface OpzioniInseguimento {
  /** l'istante (secondi della sorgente) in cui hai segnato l'oggetto */
  da: number;
  /** dove (frazioni 0..1 dell'immagine, dall'angolo in alto a sinistra) */
  x: number;
  y: number;
  /** quanto è grande la tesserina, in parti della larghezza (0.04..0.4) */
  lato?: number;
  /** gli istanti fra cui cercare (secondi della sorgente) */
  inizio: number;
  fine: number;
  /** avanza: 0..1 */
  avanza?: (k: number) => void;
  /** chi mette true ferma il lavoro (si tiene quello già fatto) */
  ferma?: () => boolean;
}

/** un fotogramma decodificato → grigio piccolo, già girato per il verso giusto */
function daCampione(s: import('mediabunny').VideoSample, tela: OffscreenCanvas | null): { g: Grigio; tela: OffscreenCanvas } {
  const w0 = s.rotation % 180 ? s.displayHeight : s.displayWidth, h0 = s.rotation % 180 ? s.displayWidth : s.displayHeight;
  const w = LAV, h = Math.max(8, Math.round((LAV * h0) / Math.max(1, w0)));
  if (!tela || tela.width !== w || tela.height !== h) tela = new OffscreenCanvas(w, h);
  const ctx = tela.getContext('2d', { willReadFrequently: true })!;
  s.drawWithFit(ctx, { fit: 'fill' });
  const im = ctx.getImageData(0, 0, w, h).data;
  const d = new Uint8Array(w * h);
  for (let i = 0, j = 0; i < d.length; i++, j += 4) d[i] = (im[j] * 77 + im[j + 1] * 150 + im[j + 2] * 29) >> 8;
  return { g: { w, h, d, t: s.timestamp }, tela };
}

/** somme e somme dei quadrati su tutto il fotogramma (per la media e la varianza di ogni tesserina in un colpo) */
function integrali(g: Grigio) {
  const W = g.w + 1;
  const s = new Float64Array(W * (g.h + 1)), q = new Float64Array(W * (g.h + 1));
  for (let y = 0; y < g.h; y++) {
    let r = 0, r2 = 0;
    for (let x = 0; x < g.w; x++) {
      const v = g.d[y * g.w + x];
      r += v; r2 += v * v;
      s[(y + 1) * W + x + 1] = s[y * W + x + 1] + r;
      q[(y + 1) * W + x + 1] = q[y * W + x + 1] + r2;
    }
  }
  return { s, q, W };
}

/** la tesserina di partenza (senza la media) e la sua deviazione */
interface Modello { m: Float32Array; lato: number; dev: number }

function taglia(g: Grigio, cx: number, cy: number, lato: number): Modello {
  const m = new Float32Array(lato * lato);
  const x0 = Math.round(cx - lato / 2), y0 = Math.round(cy - lato / 2);
  let somma = 0;
  for (let y = 0; y < lato; y++) for (let x = 0; x < lato; x++) {
    const v = g.d[Math.max(0, Math.min(g.h - 1, y0 + y)) * g.w + Math.max(0, Math.min(g.w - 1, x0 + x))];
    m[y * lato + x] = v; somma += v;
  }
  const media = somma / m.length;
  let q = 0;
  for (let i = 0; i < m.length; i++) { m[i] -= media; q += m[i] * m[i]; }
  return { m, lato, dev: Math.sqrt(q) };
}

/** dove somiglia di più il modello, cercando attorno a (cx, cy) nel raggio dato: posizione (con la mezza cifra decimale) e sicurezza */
function cerca(g: Grigio, mod: Modello, cx: number, cy: number, raggio: number): { x: number; y: number; k: number } {
  const { s, q, W } = integrali(g);
  const L = mod.lato, n = L * L;
  const xa = Math.max(0, Math.round(cx - L / 2) - raggio), xb = Math.min(g.w - L, Math.round(cx - L / 2) + raggio);
  const ya = Math.max(0, Math.round(cy - L / 2) - raggio), yb = Math.min(g.h - L, Math.round(cy - L / 2) + raggio);
  const nx = Math.max(1, xb - xa + 1), ny = Math.max(1, yb - ya + 1);
  const punteggi = new Float32Array(nx * ny).fill(-1);
  let best = -2, bx = xa, by = ya;
  for (let y = ya; y <= yb; y++) {
    for (let x = xa; x <= xb; x++) {
      const S = s[(y + L) * W + x + L] - s[y * W + x + L] - s[(y + L) * W + x] + s[y * W + x];
      const Q = q[(y + L) * W + x + L] - q[y * W + x + L] - q[(y + L) * W + x] + q[y * W + x];
      const varianza = Q - (S * S) / n;
      if (varianza < 1e-3) continue;
      let num = 0;
      for (let j = 0; j < L; j++) {
        const riga = (y + j) * g.w + x, mj = j * L;
        for (let i = 0; i < L; i++) num += g.d[riga + i] * mod.m[mj + i];
      }
      const k = num / (Math.sqrt(varianza) * mod.dev + 1e-9);
      punteggi[(y - ya) * nx + (x - xa)] = k;
      if (k > best) { best = k; bx = x; by = y; }
    }
  }
  // mezzo punto in più, con una parabola attorno al massimo
  let fx = 0, fy = 0;
  const v = (x: number, y: number) => (x >= xa && x <= xb && y >= ya && y <= yb ? punteggi[(y - ya) * nx + (x - xa)] : best);
  const dx = v(bx - 1, by) - 2 * best + v(bx + 1, by), dy = v(bx, by - 1) - 2 * best + v(bx, by + 1);
  if (dx < -1e-6) fx = Math.max(-0.5, Math.min(0.5, (v(bx - 1, by) - v(bx + 1, by)) / (2 * dx)));
  if (dy < -1e-6) fy = Math.max(-0.5, Math.min(0.5, (v(bx, by - 1) - v(bx, by + 1)) / (2 * dy)));
  return { x: bx + fx + L / 2, y: by + fy + L / 2, k: best };
}

/** il modello di adesso = quello di partenza mescolato con la tesserina appena trovata (l'oggetto cambia piano piano,
 *  ma ripartire sempre da quello vero evita che il punto scivoli via un po' alla volta) */
function aggiorna(mod: Modello, base: Modello, nuovo: Modello, peso: number) {
  let q = 0;
  for (let i = 0; i < mod.m.length; i++) { mod.m[i] = base.m[i] * (1 - peso) + nuovo.m[i] * peso; q += mod.m[i] * mod.m[i]; }
  mod.dev = Math.sqrt(q);
}

/** passa un tratto di fotogrammi (in ordine di seguito) dalla posizione di partenza: i punti trovati e la sicurezza minima */
function percorri(frames: Grigio[], mod0: Modello, x0: number, y0: number, avanza: () => void, ferma: () => boolean) {
  const mod: Modello = { m: Float32Array.from(mod0.m), lato: mod0.lato, dev: mod0.dev };
  const punti: { t: number; x: number; y: number }[] = [];
  let cx = x0, cy = y0, minimo = 1;
  const raggio = Math.max(10, Math.round(mod.lato * 1.3));
  for (const g of frames) {
    if (ferma()) break;
    const r = cerca(g, mod, cx, cy, raggio);
    if (r.k > 0.3) {
      cx = r.x; cy = r.y;
      if (r.k > 0.8) aggiorna(mod, mod0, taglia(g, cx, cy, mod.lato), 0.3);
    }
    minimo = Math.min(minimo, Math.max(0, r.k));
    punti.push({ t: g.t, x: cx / g.w, y: cy / g.h });
    avanza();
  }
  return { punti, minimo };
}

/**
 * Segue un oggetto per tutta la ripresa. Ritorna i punti (secondi della sorgente e posizione nell'immagine), oppure
 * null se la ripresa non si può leggere. Si può fermare con `ferma`: si tiene quello già trovato.
 */
export async function seguiOggetto(mediaId: string, o: OpzioniInseguimento): Promise<Traccia | null> {
  const r = mediaRT(mediaId);
  if (!r?.v || !r.vDecodable) return null;
  const sink = new VideoSampleSink(r.v);
  const ferma = o.ferma ?? (() => false);
  const passo = 1 / HZ;
  // tutti i fotogrammi da guardare, in grigio (uno ogni 1/HZ di secondo); così si può andare anche all'indietro
  const tutti: Grigio[] = [];
  let tela: OffscreenCanvas | null = null;
  let ultimo = -Infinity;
  const durata = Math.max(0.05, o.fine - o.inizio);
  try {
    for await (const s of sink.samples(o.inizio, o.fine + 1e-3)) {
      if (ferma()) { s.close(); break; }
      if (s.timestamp - ultimo >= passo - 1e-4) {
        try { const c = daCampione(s, tela); tela = c.tela; tutti.push(c.g); ultimo = s.timestamp; } catch { /* un fotogramma che non si legge: si salta */ }
      }
      s.close();
      o.avanza?.(Math.min(0.45, ((s.timestamp - o.inizio) / durata) * 0.45));
    }
  } catch { /* la ripresa finisce prima */ }
  if (tutti.length < 2) return null;
  // il fotogramma più vicino a dove hai segnato
  let i0 = 0;
  for (let i = 1; i < tutti.length; i++) if (Math.abs(tutti[i].t - o.da) < Math.abs(tutti[i0].t - o.da)) i0 = i;
  const rif = tutti[i0];
  const lato = Math.max(7, Math.min(Math.round(rif.w * (o.lato ?? 0.12)) | 1, Math.min(rif.w, rif.h) - 2));
  const cx = o.x * rif.w, cy = o.y * rif.h;
  const mod = taglia(rif, cx, cy, lato);
  if (mod.dev < 1) return null;
  const tot = tutti.length;
  let fatti = 0;
  const avanza = () => { fatti++; if (fatti % 6 === 0) o.avanza?.(0.45 + 0.55 * (fatti / tot)); };
  const avanti = percorri(tutti.slice(i0 + 1), mod, cx, cy, avanza, ferma);
  const indietro = percorri(tutti.slice(0, i0).reverse(), mod, cx, cy, avanza, ferma);
  const punti = levigaPunti([...indietro.punti, { t: rif.t, x: o.x, y: o.y }, ...avanti.punti]);
  o.avanza?.(1);
  return { punti, da: rif.t, fiducia: Math.min(avanti.minimo, indietro.minimo) };
}
