// I fotogrammi per i monitor e per il compositore.
// Due modi, come i videoregistratori: "flusso" in riproduzione (decodifica in avanti con un piccolo
// anticipo, i tagli sono puliti perché la clip dopo si scalda prima) e "ricerca" da fermo o in shuttle
// (va al fotogramma esatto; se ne arrivano tanti di fila vince l'ultimo).
import { VideoSampleSink, type VideoSample } from 'mediabunny';
import { mediaRT, quandoDecoderOccupato } from './libreria';

export type Fotogramma = VideoSample | ImageBitmap;

const CODA = 5;

class Flusso {
  queue: VideoSample[] = [];
  current: VideoSample | null = null;
  done = false;
  dead = false;
  lastUse = performance.now();
  private iter: AsyncGenerator<VideoSample, void, unknown>;
  private pumping = false;

  constructor(sink: VideoSampleSink, public from: number) {
    this.iter = sink.samples(Math.max(0, from));
    void this.pump();
  }

  private async pump() {
    if (this.pumping) return;
    this.pumping = true;
    try {
      while (!this.dead && this.queue.length < CODA) {
        const r = await this.iter.next();
        if (this.dead) { r.value?.close(); break; }
        if (r.done) { this.done = true; break; }
        this.queue.push(r.value);
        avvisa();
      }
    } catch {
      this.done = true;
    }
    this.pumping = false;
  }

  /** il fotogramma da mostrare al tempo t: butta quelli passati, tiene l'ultimo raggiunto */
  at(t: number): VideoSample | null {
    this.lastUse = performance.now();
    while (this.queue.length && this.queue[0].timestamp <= t + 1e-4) {
      this.current?.close();
      this.current = this.queue.shift()!;
    }
    if (!this.done) void this.pump();
    return this.current;
  }

  /** quanto è avanti la decodifica rispetto a t (per capire se il flusso è rimasto indietro) */
  ahead(t: number) {
    const last = this.queue[this.queue.length - 1] ?? this.current;
    return last ? last.timestamp - t : -Infinity;
  }

  close() {
    this.dead = true;
    this.current?.close();
    this.current = null;
    for (const s of this.queue) s.close();
    this.queue.length = 0;
    void this.iter.return(undefined).catch(() => {});
  }
}

class Ricerca {
  current: VideoSample | null = null;
  want: number | null = null;
  busy = false;
  lastUse = performance.now();
  constructor(private sink: VideoSampleSink) {}

  at(t: number): VideoSample | null {
    this.lastUse = performance.now();
    const c = this.current;
    const covers = c && c.timestamp <= t + 1e-4 && t < c.timestamp + Math.max(c.duration, 1 / 120) - 1e-4;
    if (!covers) {
      this.want = t;
      if (!this.busy) void this.run();
    }
    return c;
  }

  private async run() {
    this.busy = true;
    while (this.want !== null) {
      const t = this.want;
      this.want = null;
      try {
        const s = await this.sink.getSample(t);
        if (s) {
          this.current?.close();
          this.current = s;
          avvisa();
        }
      } catch { /* decoder in errore: si riprova alla prossima richiesta */ }
    }
    this.busy = false;
  }

  close() {
    this.current?.close();
    this.current = null;
    this.want = null;
  }
}

const sinks = new Map<string, VideoSampleSink>();
const flussi = new Map<string, Flusso>();
const ricerche = new Map<string, Ricerca>();

// il monitor ha la precedenza sulle miniature della timeline: una ricerca in corso o un flusso in riproduzione
quandoDecoderOccupato(() => flussi.size > 0 || [...ricerche.values()].some((r) => r.busy));

function sinkDi(mediaId: string): VideoSampleSink | null {
  let s = sinks.get(mediaId);
  if (s) return s;
  const r = mediaRT(mediaId);
  if (!r?.v || !r.vDecodable) return null;
  s = new VideoSampleSink(r.v);
  sinks.set(mediaId, s);
  return s;
}

const ascoltatori = new Set<() => void>();
let avvisoInCoda = false;
function avvisa() {
  if (avvisoInCoda) return;
  avvisoInCoda = true;
  queueMicrotask(() => { avvisoInCoda = false; for (const f of ascoltatori) f(); });
}
/** chi disegna si iscrive qui: viene chiamato quando arriva un fotogramma nuovo */
export const quandoFotogramma = (fn: () => void) => { ascoltatori.add(fn); return () => ascoltatori.delete(fn); };

/**
 * Il fotogramma della sorgente mediaId al tempo t per la "voce" key (una clip, il Player…).
 * In riproduzione usa il flusso, da fermo la ricerca. Non aspetta mai: ritorna quello che c'è.
 */
export function fotogramma(key: string, mediaId: string, t: number, flusso: boolean): Fotogramma | null {
  const r = mediaRT(mediaId);
  if (!r) return null;
  if (r.image) return r.image;
  const sink = sinkDi(mediaId);
  if (!sink) return null;
  const k = key + '|' + mediaId;
  if (flusso) {
    let f = flussi.get(k);
    // flusso nuovo se non c'è, se si è tornati indietro, o se si è saltati troppo avanti
    if (f && (t < f.from - 0.05 || (f.current && t < f.current.timestamp - 0.05) || (f.done && !f.queue.length && f.current && t > f.current.timestamp + 1) || f.ahead(t) < -1.5)) {
      f.close();
      flussi.delete(k);
      f = undefined;
    }
    if (!f) {
      f = new Flusso(sink, t);
      flussi.set(k, f);
      // mentre il flusso parte mostra quello che la ricerca aveva già
      const rc = ricerche.get(k);
      const now = f.at(t);
      return now ?? rc?.current ?? null;
    }
    const s = f.at(t);
    if (s) return s;
    return ricerche.get(k)?.current ?? null;
  }
  let rc = ricerche.get(k);
  if (!rc) {
    rc = new Ricerca(sink);
    ricerche.set(k, rc);
  }
  const fl = flussi.get(k);
  const got = rc.at(t);
  if (!got && fl?.current) return fl.current;
  return got;
}

/** scalda il decoder della clip che sta per arrivare, così il taglio è pulito */
export function prepara(key: string, mediaId: string, t: number) {
  const sink = sinkDi(mediaId);
  if (!sink) return;
  const k = key + '|' + mediaId;
  const f = flussi.get(k);
  if (f && Math.abs(f.from - t) < 0.5 && !f.dead) { f.lastUse = performance.now(); return; }
  f?.close();
  flussi.set(k, new Flusso(sink, t));
}

/** chiude i flussi non usati da un po' (libera i decoder e la memoria video) */
export function pulisci(maxEta = 1500) {
  const now = performance.now();
  for (const [k, f] of flussi) if (now - f.lastUse > maxEta) { f.close(); flussi.delete(k); }
  for (const [k, r] of ricerche) if (now - r.lastUse > 8000) { r.close(); ricerche.delete(k); }
}

/** ferma tutti i flussi (stop o salto): la ricerca resta per il fermo immagine */
export function fermaFlussi() {
  for (const [k, f] of flussi) {
    // il fotogramma corrente passa alla ricerca, così lo stop non fa sparire l'immagine
    const rc = ricerche.get(k);
    if (rc && f.current && !rc.current) { rc.current = f.current.clone(); }
    f.close();
  }
  flussi.clear();
}

export function dimenticaMedia(mediaId: string) {
  sinks.delete(mediaId);
  for (const [k, f] of flussi) if (k.endsWith('|' + mediaId)) { f.close(); flussi.delete(k); }
  for (const [k, r] of ricerche) if (k.endsWith('|' + mediaId)) { r.close(); ricerche.delete(k); }
}

export function statoDecoder() {
  return { flussi: flussi.size, ricerche: ricerche.size };
}
