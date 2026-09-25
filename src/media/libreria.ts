// Il contenitore (bin): i file importati, aperti con Mediabunny (WebCodecs) e tenuti vivi finché servono.
// Qui nascono anche la locandina, le miniature della timeline e la forma d'onda dell'audio.
import {
  ALL_FORMATS, AudioBufferSink, BlobSource, CanvasSink, Input, StreamSource,
  type InputAudioTrack, type InputVideoTrack,
} from 'mediabunny';
import type { MediaItem } from '../core/tipi';
import { uid } from '../core/progetto';
import { invoke, isTauri, type FileScelto } from '../platform';
import { accodaProxy, type Proxy } from './proxy';

export type StatoMedia = 'caricamento' | 'ok' | 'offline' | 'errore';

export interface MediaRT {
  id: string;
  file?: File;
  path?: string;
  input?: Input;
  v?: InputVideoTrack;
  a?: InputAudioTrack;
  image?: ImageBitmap;
  poster?: CanvasImageSource;
  /** picchi dell'audio: massimo assoluto per ogni centesimo di secondo */
  peaks?: Float32Array;
  peaksDone: number;
  stato: StatoMedia;
  errore?: string;
  vDecodable: boolean;
  aDecodable: boolean;
  /** misura del colore per il colore automatico (livelli, bianco, luce) */
  colore?: Analisi;
  /** la copia leggera per i monitor (src/media/proxy.ts) */
  proxy?: Proxy;
  proxyStato?: 'coda' | 'lavoro' | 'pronto' | 'no' | 'errore';
  proxyProg?: number;
}

export interface Analisi {
  lo: [number, number, number];
  hi: [number, number, number];
  wb: [number, number, number];
  /** esponente per le mezzetinte: < 1 schiarisce le riprese buie */
  gamma: number;
}

const rt = new Map<string, MediaRT>();
export const mediaRT = (id: string) => rt.get(id);
export const PEAKS_PER_SEC = 100;

const IMMAGINI = /\.(jpe?g|png|webp|gif|bmp|avif)$/i;
let ac3Pronto: Promise<void> | null = null;

/** AC-3 (le videocamere AVCHD) non lo decodifica nessun browser: si carica il decoder WASM solo se serve */
async function assicuraAc3() {
  if (!ac3Pronto) ac3Pronto = import('@mediabunny/ac3').then((m) => { m.registerAc3Decoder(); });
  return ac3Pronto;
}

function sorgente(r: MediaRT) {
  if (r.file) return new BlobSource(r.file, { maxCacheSize: 32 * 1024 * 1024 });
  const path = r.path!;
  return new StreamSource({
    getSize: () => invoke<number>('media_dimensione', { path }),
    read: async (start: number, end: number) => {
      const buf = await invoke<ArrayBuffer>('media_leggi', { path, start, end });
      return new Uint8Array(buf);
    },
    maxCacheSize: 32 * 1024 * 1024,
    prefetchProfile: 'fileSystem',
  });
}

async function leggiTutto(r: MediaRT): Promise<Blob> {
  if (r.file) return r.file;
  const size = await invoke<number>('media_dimensione', { path: r.path! });
  const buf = await invoke<ArrayBuffer>('media_leggi', { path: r.path!, start: 0, end: size });
  return new Blob([buf]);
}

/** apre (o riapre) il runtime di un media già descritto nel progetto */
export async function apri(item: MediaItem, sel: { file?: File; path?: string }): Promise<MediaRT> {
  const old = rt.get(item.id);
  if (old?.input) old.input.dispose();
  const r: MediaRT = { id: item.id, file: sel.file, path: sel.path, stato: 'caricamento', peaksDone: 0, vDecodable: false, aDecodable: false };
  rt.set(item.id, r);
  try {
    if (item.type === 'image') {
      r.image = await createImageBitmap(await leggiTutto(r));
      r.poster = r.image;
      r.vDecodable = true;
      r.stato = 'ok';
      r.colore = analizza([r.image]);
      return r;
    }
    r.input = new Input({ source: sorgente(r), formats: ALL_FORMATS });
    r.v = (await r.input.getPrimaryVideoTrack()) ?? undefined;
    r.a = (await r.input.getPrimaryAudioTrack()) ?? undefined;
    if (r.a && /ac3|eac3/.test(String(r.a.codec ?? await r.a.getCodec()))) await assicuraAc3();
    r.vDecodable = r.v ? await r.v.canDecode() : false;
    r.aDecodable = r.a ? await r.a.canDecode() : false;
    r.stato = 'ok';
    if (r.v && r.vDecodable) {
      const dur = item.duration || 1;
      const cs = new CanvasSink(r.v, { width: 320, fit: 'contain' });
      const w = await cs.getCanvas(Math.min(dur * 0.1, 2)).catch(() => null) ?? await cs.getCanvas(0).catch(() => null);
      if (w) r.poster = w.canvas;
      void misuraColore(r, dur);
      void accodaProxy(item, r, () => sorgente(r));
    }
    if (r.a && r.aDecodable) void calcolaPicchi(r, item.duration);
  } catch (e) {
    r.stato = 'errore';
    r.errore = e instanceof Error ? e.message : String(e);
  }
  return r;
}

/** legge un file nuovo e crea la sua scheda per il contenitore */
export async function importa(sel: FileScelto): Promise<{ item: MediaItem; rt: MediaRT } | { errore: string; nome: string }> {
  const id = uid('m');
  const nome = sel.name;
  const base: MediaItem = {
    id, name: nome, type: 'video', duration: 0, t0: 0, width: 0, height: 0, fps: 0, rotation: 0,
    hasVideo: false, hasAudio: false, channels: 0, sampleRate: 0, vcodec: '', acodec: '', container: '',
    size: sel.file?.size ?? 0, lastModified: sel.file?.lastModified ?? 0, path: sel.path, markIn: null, markOut: null,
  };
  try {
    if (sel.path && isTauri) {
      base.size = await invoke<number>('media_dimensione', { path: sel.path });
    }
    if (IMMAGINI.test(nome) || sel.file?.type.startsWith('image/')) {
      base.type = 'image';
      base.container = nome.split('.').pop()?.toUpperCase() ?? 'IMG';
      const r = await apri(base, sel);
      if (r.stato !== 'ok' || !r.image) return { errore: r.errore ?? 'immagine non leggibile', nome };
      base.width = r.image.width;
      base.height = r.image.height;
      base.hasVideo = true;
      return { item: base, rt: r };
    }
    const r: MediaRT = { id, file: sel.file, path: sel.path, stato: 'caricamento', peaksDone: 0, vDecodable: false, aDecodable: false };
    rt.set(id, r);
    const input = new Input({ source: sorgente(r), formats: ALL_FORMATS });
    r.input = input;
    const fmt = await input.getFormat().catch(() => null);
    if (!fmt) {
      input.dispose();
      // niente video né audio: forse è una foto senza estensione (su Android i file arrivano come content://)
      try {
        const img = await createImageBitmap(await leggiTutto(r));
        img.close();
        rt.delete(id);
        return importa({ ...sel, name: /\.[a-z0-9]{2,4}$/i.test(nome) ? nome : nome + '.jpg' });
      } catch { /* non è nemmeno un'immagine */ }
      rt.delete(id);
      return { errore: 'formato non riconosciuto', nome };
    }
    base.container = fmt.name;
    const v = await input.getPrimaryVideoTrack();
    const a = await input.getPrimaryAudioTrack();
    if (!v && !a) { rt.delete(id); input.dispose(); return { errore: 'nessuna traccia video o audio', nome }; }
    base.duration = await input.computeDuration();
    base.t0 = Math.max(0, await input.getFirstTimestamp().catch(() => 0));
    if (v) {
      base.hasVideo = true;
      base.width = await v.getDisplayWidth();
      base.height = await v.getDisplayHeight();
      base.rotation = await v.getRotation();
      base.vcodec = String((await v.getCodec()) ?? '?');
      const fr = await v.computeFrameRateMetrics({ targetPacketCount: 120 }).catch(() => null);
      base.fps = fr ? Math.round(fr.bestGuessFrameRate * 1000) / 1000 : 25;
      r.v = v;
      r.vDecodable = await v.canDecode();
    }
    if (a) {
      base.hasAudio = true;
      base.acodec = String((await a.getCodec()) ?? '?');
      base.channels = await a.getNumberOfChannels();
      base.sampleRate = await a.getSampleRate();
      r.a = a;
      if (/ac3|eac3/.test(base.acodec)) await assicuraAc3();
      r.aDecodable = await a.canDecode();
    }
    base.type = v ? 'video' : 'audio';
    if (v && !r.vDecodable && !(a && r.aDecodable)) {
      return { errore: `il video ${base.vcodec.toUpperCase()} non si decodifica su questo sistema`, nome };
    }
    r.stato = 'ok';
    if (v && r.vDecodable) {
      const cs = new CanvasSink(v, { width: 320, fit: 'contain' });
      const w = await cs.getCanvas(Math.min(base.duration * 0.1, 2)).catch(() => null) ?? await cs.getCanvas(0).catch(() => null);
      if (w) r.poster = w.canvas;
      void misuraColore(r, base.duration);
      void accodaProxy(base, r, () => sorgente(r));
    }
    if (a && r.aDecodable) void calcolaPicchi(r, base.duration);
    return { item: base, rt: r };
  } catch (e) {
    rt.delete(id);
    return { errore: e instanceof Error ? e.message : String(e), nome };
  }
}

export function chiudi(id: string) {
  const r = rt.get(id);
  r?.input?.dispose();
  r?.proxy?.input.dispose();
  if (r?.path && isTauri) void invoke('media_chiudi', { path: r.path }).catch(() => {});
  r?.image?.close();
  rt.delete(id);
}

// ——— colore automatico ———
const onAnalisi = new Set<() => void>();
/** chi disegna si iscrive qui: il colore automatico di una ripresa è pronto */
export const quandoAnalisi = (fn: () => void) => { onAnalisi.add(fn); return () => onAnalisi.delete(fn); };

/** livelli, bianco e luce misurati su qualche fotogramma in piccolo: bastano pochi millisecondi */
export function analizza(immagini: CanvasImageSource[]): Analisi {
  const W = 64, H = 36;
  const tela = new OffscreenCanvas(W, H);
  const ctx = tela.getContext('2d', { willReadFrequently: true })!;
  const ist = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
  let n = 0;
  for (const im of immagini) {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(im, 0, 0, W, H);
    const d = ctx.getImageData(0, 0, W, H).data;
    for (let i = 0; i < d.length; i += 4) { ist[0][d[i]]++; ist[1][d[i + 1]]++; ist[2][d[i + 2]]++; n++; }
  }
  const perc = (h: Uint32Array, q: number) => { let s = 0; const lim = q * n; for (let i = 0; i < 256; i++) { s += h[i]; if (s >= lim) return i / 255; } return 1; };
  const lo = [0, 1, 2].map((c) => Math.min(perc(ist[c], 0.004), 0.12)) as [number, number, number];
  const hi = [0, 1, 2].map((c) => Math.max(perc(ist[c], 0.996), 0.7)) as [number, number, number];
  // medie dopo i livelli: il grigio medio dice quanto è sbilanciato il bianco e quanto è buia la ripresa
  const media = [0, 1, 2].map((c) => {
    let s = 0;
    for (let i = 0; i < 256; i++) s += Math.max(0, Math.min(1, (i / 255 - lo[c]) / Math.max(0.05, hi[c] - lo[c]))) * ist[c][i];
    return s / Math.max(1, n);
  });
  const grigio = (media[0] + media[1] + media[2]) / 3;
  const wb = media.map((m) => 1 + (Math.max(0.86, Math.min(1.16, grigio / Math.max(0.02, m))) - 1) * 0.7) as [number, number, number];
  const luce = Math.max(0.02, Math.min(0.98, grigio));
  const gamma = Math.max(0.72, Math.min(1.25, Math.log(0.45) / Math.log(luce)));
  return { lo, hi, wb, gamma };
}

async function misuraColore(r: MediaRT, durata: number) {
  if (!r.v) return;
  try {
    // prima il monitor: la misura aspetta che il decoder sia libero
    for (let attese = 0; decoderOccupato() && attese < 100; attese++) await new Promise((ok) => setTimeout(ok, 50));
    const cs = new CanvasSink(r.v, { width: 96, fit: 'contain' });
    const d = Math.max(0.1, durata);
    const ts = [0.08, 0.3, 0.5, 0.7, 0.92].map((k) => (r.v ? k * d : 0));
    const tele: CanvasImageSource[] = [];
    for await (const w of cs.canvasesAtTimestamps(ts)) if (w) tele.push(w.canvas);
    if (tele.length) r.colore = analizza(tele);
    for (const fn of onAnalisi) fn();
  } catch { /* niente colore automatico per questa ripresa */ }
}

// ——— forma d'onda ———
type Ascoltatore = (id: string) => void;
const onPicchi = new Set<Ascoltatore>();
export const quandoPicchi = (fn: Ascoltatore) => { onPicchi.add(fn); return () => onPicchi.delete(fn); };

async function calcolaPicchi(r: MediaRT, durata: number) {
  if (!r.a) return;
  const n = Math.max(1, Math.ceil(durata * PEAKS_PER_SEC));
  const peaks = new Float32Array(n);
  r.peaks = peaks;
  r.peaksDone = 0;
  const sink = new AudioBufferSink(r.a);
  let ultimo = performance.now();
  let fetta = performance.now();
  try {
    for await (const { buffer, timestamp } of sink.buffers()) {
      const sr = buffer.sampleRate;
      const ch = buffer.numberOfChannels;
      const data: Float32Array[] = [];
      for (let c = 0; c < ch; c++) data.push(buffer.getChannelData(c));
      const per = sr / PEAKS_PER_SEC;
      const first = Math.floor(timestamp * PEAKS_PER_SEC);
      const len = buffer.length;
      for (let i = 0; i < len; i += 4) {
        let m = 0;
        for (let c = 0; c < ch; c++) { const x = Math.abs(data[c][i]); if (x > m) m = x; }
        const b = first + Math.floor(i / per);
        if (b >= 0 && b < n && m > peaks[b]) peaks[b] = m;
      }
      r.peaksDone = Math.min(n, first + Math.ceil(len / per));
      if (performance.now() - ultimo > 250) {
        ultimo = performance.now();
        for (const fn of onPicchi) fn(r.id);
      }
      // a fette brevi: la forma d'onda si calcola senza bloccare l'interfaccia
      if (performance.now() - fetta > 12) {
        await new Promise((ok) => setTimeout(ok, 0));
        fetta = performance.now();
      }
      if (rt.get(r.id) !== r) return;
    }
  } catch { /* forma d'onda incompleta: pazienza */ }
  r.peaksDone = n;
  for (const fn of onPicchi) fn(r.id);
}

// ——— miniature della timeline ———
const THUMB_W = 128;
const LIMITE_MINIATURE = 1800;
const cache = new Map<string, CanvasImageSource>();
const inCoda = new Map<string, Set<number>>();
const lavorando = new Set<string>();
const onMiniatura = new Set<() => void>();
export const quandoMiniature = (fn: () => void) => { onMiniatura.add(fn); return () => onMiniatura.delete(fn); };

/** miniatura al tempo t (già quantizzato da chi chiede): se non c'è la mette in coda e ritorna null */
export function miniatura(id: string, t: number): CanvasImageSource | null {
  const r = rt.get(id);
  if (!r) return null;
  if (r.image) return r.image;
  const k = id + '@' + t.toFixed(3);
  const c = cache.get(k);
  if (c) {
    cache.delete(k);
    cache.set(k, c); // LRU: torna in fondo
    return c;
  }
  if (!r.v || !r.vDecodable) return null;
  if (!inCoda.has(id)) inCoda.set(id, new Set());
  inCoda.get(id)!.add(t);
  if (!lavorando.has(id)) void lavoraMiniature(id);
  return null;
}

/** chi usa il decoder per i monitor dice qui se è occupato: le miniature aspettano il loro turno */
let decoderOccupato: () => boolean = () => false;
export function quandoDecoderOccupato(fn: () => boolean) { decoderOccupato = fn; }

async function lavoraMiniature(id: string) {
  const r = rt.get(id);
  if (!r?.v) return;
  lavorando.add(id);
  const sink = new CanvasSink(r.proxy?.v ?? r.v, { width: THUMB_W, fit: 'contain' });
  try {
    while (inCoda.get(id)?.size) {
      // prima il fotogramma del monitor e la riproduzione, poi le miniature
      for (let attese = 0; decoderOccupato() && attese < 100; attese++) await new Promise((ok) => setTimeout(ok, 40));
      const ts = [...inCoda.get(id)!].sort((a, b) => a - b).slice(0, 8);
      for (const t of ts) inCoda.get(id)!.delete(t);
      let i = 0;
      for await (const w of sink.canvasesAtTimestamps(ts)) {
        const t = ts[i++];
        if (w) cache.set(id + '@' + t.toFixed(3), w.canvas);
      }
      while (cache.size > LIMITE_MINIATURE) cache.delete(cache.keys().next().value!);
      for (const fn of onMiniatura) fn();
    }
  } catch { /* file sparito o decoder in errore */ }
  lavorando.delete(id);
}

export function svuotaMiniature(id?: string) {
  for (const k of [...cache.keys()]) if (!id || k.startsWith(id + '@')) cache.delete(k);
}
