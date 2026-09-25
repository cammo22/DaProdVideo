// I fotogrammi per i monitor e per il compositore.
// Due modi, come i videoregistratori: "flusso" in riproduzione (decodifica in avanti con un piccolo
// anticipo, i tagli sono puliti perché la clip dopo si scalda prima) e "ricerca" da fermo o in shuttle
// (va al fotogramma esatto; se ne arrivano tanti di fila vince l'ultimo, e in avanti di poco si continua a
// leggere col cursore: la rotella decodifica un fotogramma per passo).
// Se la ripresa ha il suo proxy (src/media/proxy.ts) si legge quello: leggero e con un fotogramma chiave ogni
// mezzo secondo, così si parte da qualunque punto all'istante. Da fermo, se il monitor è più grande del proxy,
// dopo un attimo arriva il fotogramma nitido dell'originale.
import { EncodedPacketSink, VideoSampleSink, type VideoSample } from 'mediabunny';
import { mediaRT, quandoDecoderOccupato, type MediaRT } from './libreria';
import { modoProxy, quandoProxy } from './proxy';

export type Fotogramma = VideoSample | ImageBitmap;
type Qualita = 'p' | 'o';

const CODA = 5;
const conti = { flussi: 0 };

interface Lettore { vs: VideoSampleSink; ps: EncodedPacketSink }

class Flusso {
  queue: VideoSample[] = [];
  current: VideoSample | null = null;
  done = false;
  dead = false;
  /** è arrivato il primo fotogramma? Con i fotogrammi chiave radi può volerci un attimo: nel frattempo il flusso
   *  NON va buttato (prima si ricreava a ogni giro e il video restava fermo fino al taglio dopo) */
  partito = false;
  /** meglio ripartire da capo: c'è un fotogramma chiave più avanti di dove sta decodificando */
  ripartire = false;
  lastUse = performance.now();
  private iter: AsyncGenerator<VideoSample, void, unknown>;
  private pumping = false;
  private controllo = 0;

  constructor(private l: Lettore, public from: number) {
    conti.flussi++;
    this.iter = l.vs.samples(Math.max(0, from));
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
        this.partito = true;
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

  /** l'ultimo istante decodificato (o quello di partenza se non è ancora arrivato niente) */
  private ultimo() {
    const last = this.queue[this.queue.length - 1] ?? this.current;
    return last ? last.timestamp : this.from;
  }

  /** quanto è avanti la decodifica rispetto a t (negativo = indietro) */
  ahead(t: number) { return this.ultimo() - t; }

  /**
   * Il flusso è rimasto indietro: conviene ripartire? Solo se fra dove sta decodificando e t c'è un fotogramma
   * chiave, altrimenti ripartire vorrebbe dire rifare lo stesso lavoro (ed è così che il video si fermava).
   */
  valuta(t: number) {
    const now = performance.now();
    if (now - this.controllo < 400 || this.ripartire) return;
    this.controllo = now;
    const da = this.ultimo();
    void this.l.ps.getKeyPacket(t, { metadataOnly: true }).then((k) => {
      if (k && k.timestamp > da + 0.25 && !this.dead) this.ripartire = true;
    }).catch(() => {});
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

const copre = (c: VideoSample | null, t: number) => !!c && c.timestamp <= t + 1e-4 && t < c.timestamp + Math.max(c.duration, 1 / 120) - 1e-4;

class Ricerca {
  current: VideoSample | null = null;
  want: number | null = null;
  busy = false;
  dead = false;
  lastUse = performance.now();
  /** il cursore: legge in avanti dall'ultimo fotogramma, così i passi in avanti costano un fotogramma solo */
  private iter: AsyncGenerator<VideoSample, void, unknown> | null = null;
  /** il fotogramma dopo current, già letto dal cursore */
  private dopo: VideoSample | null = null;
  constructor(private sink: VideoSampleSink) {}

  at(t: number): VideoSample | null {
    this.lastUse = performance.now();
    if (!copre(this.current, t)) {
      this.want = t;
      if (!this.busy) void this.run();
    }
    return this.current;
  }

  copre(t: number) { return copre(this.current, t); }

  /** chiude il cursore (libera il decoder) ma tiene il fotogramma mostrato */
  riposa() {
    if (!this.busy) this.chiudiCursore();
  }

  private chiudiCursore() {
    this.dopo?.close();
    this.dopo = null;
    void this.iter?.return(undefined).catch(() => {});
    this.iter = null;
  }

  private async prossimo(): Promise<VideoSample | null> {
    if (this.dopo) { const d = this.dopo; this.dopo = null; return d; }
    const r = await this.iter!.next();
    return r.done ? null : r.value;
  }

  private async run() {
    this.busy = true;
    while (this.want !== null && !this.dead) {
      const t = this.want;
      this.want = null;
      try {
        const c = this.current;
        const avanti = !!this.iter && !!c && t >= c.timestamp && t - c.timestamp < 3;
        if (!avanti) {
          this.chiudiCursore();
          this.iter = this.sink.samples(Math.max(0, t));
        }
        // legge fino al fotogramma che copre t; quello dopo resta pronto per il passo seguente
        for (;;) {
          const s = await this.prossimo();
          if (this.dead) { s?.close(); break; }
          if (!s) break;
          if (s.timestamp > t + 1e-4 && this.current) { this.dopo = s; break; }
          this.current?.close();
          this.current = s;
          if (copre(s, t)) { avvisa(); if (this.want !== null) break; }
        }
      } catch {
        // decoder in errore: si riparte da capo alla prossima richiesta
        this.chiudiCursore();
      }
      if (!this.dead) avvisa();
    }
    this.busy = false;
  }

  close() {
    this.dead = true;
    this.current?.close();
    this.current = null;
    this.want = null;
    this.chiudiCursore();
  }
}

const lettori = new Map<string, Lettore>();
const flussi = new Map<string, Flusso>();
const ricerche = new Map<string, Ricerca>();
/** dove sta chiedendo ogni voce e da quando: il fotogramma nitido si chiede solo quando ci si ferma */
const fermo = new Map<string, { t: number; da: number }>();

// il monitor ha la precedenza sulle miniature della timeline: una ricerca in corso o un flusso in riproduzione
quandoDecoderOccupato(() => flussi.size > 0 || [...ricerche.values()].some((r) => r.busy));

/** il proxy della ripresa, se c'è ed è pronto (con "proxy: mai" i monitor leggono sempre gli originali) */
const proxyDi = (r: MediaRT) => (r.proxy && modoProxy() !== 'mai' ? r.proxy : null);
// proxy pronto o modo cambiato: si ridisegna (i flussi nuovi prendono la qualità giusta da soli)
quandoProxy(() => avvisa());

function lettoreDi(mediaId: string, q: Qualita): Lettore | null {
  const k = mediaId + '|' + q;
  let l = lettori.get(k);
  if (l) return l;
  const r = mediaRT(mediaId);
  const track = q === 'p' ? r?.proxy?.v : r?.vDecodable ? r.v : undefined;
  if (!track) return null;
  l = { vs: new VideoSampleSink(track), ps: new EncodedPacketSink(track) };
  lettori.set(k, l);
  return l;
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

function ricerca(k: string, l: Lettore): Ricerca {
  let rc = ricerche.get(k);
  if (!rc) { rc = new Ricerca(l.vs); ricerche.set(k, rc); }
  return rc;
}

/** il flusso della voce k: nuovo se non c'è, se si è tornati indietro o se conviene ripartire più avanti */
function flussoDi(k: string, l: Lettore, t: number): Flusso {
  let f = flussi.get(k);
  if (f) {
    const indietro = t < f.from - 0.05 || (!!f.current && t < f.current.timestamp - 0.05);
    const finito = f.done && !f.queue.length && !!f.current && t > f.current.timestamp + 1;
    if (indietro || finito || f.ripartire) { f.close(); flussi.delete(k); f = undefined; }
    else if (f.ahead(t) < -0.6) f.valuta(t);
  }
  if (!f) { f = new Flusso(l, t); flussi.set(k, f); }
  return f;
}

/**
 * Il fotogramma della sorgente mediaId al tempo t per la "voce" key (una clip, il Player…).
 * In riproduzione usa il flusso, da fermo la ricerca. Non aspetta mai: ritorna quello che c'è.
 * larghezza = quanti pixel servono (0 = va bene anche il proxy).
 */
export function fotogramma(key: string, mediaId: string, t: number, flusso: boolean, larghezza = 0): Fotogramma | null {
  const r = mediaRT(mediaId);
  if (!r) return null;
  if (r.image) return r.image;
  const px = proxyDi(r);
  const q: Qualita = px ? 'p' : 'o';
  const l = lettoreDi(mediaId, q);
  if (!l) return null;
  const base = key + '|' + mediaId + '|';
  const k = base + q;
  if (flusso) {
    const f = flussoDi(k, l, t);
    const s = f.at(t);
    if (s) return s;
    // mentre il flusso parte si mostra quello che la ricerca aveva già (di una qualità o dell'altra)
    return ricerche.get(k)?.current ?? ricerche.get(base + (q === 'p' ? 'o' : 'p'))?.current ?? f.current;
  }
  const fl = flussi.get(k);
  const veloce = ricerca(k, l).at(t);
  if (px && larghezza > px.w * 1.1) {
    // il monitor è più grande del proxy: fermi da un attimo, arriva il fotogramma dell'originale
    const now = performance.now();
    const st = fermo.get(base);
    if (!st || Math.abs(st.t - t) > 1e-4) fermo.set(base, { t, da: now });
    const lo = lettoreDi(mediaId, 'o');
    if (lo) {
      const fermoDa = now - (fermo.get(base)?.da ?? now);
      const rn = ricerche.get(base + 'o');
      if (fermoDa >= 140) {
        const n = ricerca(base + 'o', lo).at(t);
        if (n && copre(n, t)) return n;
      } else {
        if (rn?.copre(t)) return rn.current;
        setTimeout(avvisa, 150);
      }
    }
  }
  if (!veloce && fl?.current) return fl.current;
  return veloce ?? ricerche.get(base + (q === 'p' ? 'o' : 'p'))?.current ?? null;
}

/** la voce ha già un fotogramma per t? (il play aspetta un attimo i flussi, così parte in sincrono) */
export function pronto(key: string, mediaId: string, t: number): boolean {
  const r = mediaRT(mediaId);
  if (!r || r.image || !r.vDecodable) return true;
  const k = key + '|' + mediaId + '|' + (proxyDi(r) ? 'p' : 'o');
  const f = flussi.get(k);
  return !!f && (f.partito || f.done) && f.ahead(t) > -0.1;
}

/** scalda il decoder della clip che sta per arrivare, così il taglio è pulito */
export function prepara(key: string, mediaId: string, t: number) {
  const r = mediaRT(mediaId);
  if (!r || r.image) return;
  const q: Qualita = proxyDi(r) ? 'p' : 'o';
  const l = lettoreDi(mediaId, q);
  if (!l) return;
  const k = key + '|' + mediaId + '|' + q;
  const f = flussi.get(k);
  if (f && Math.abs(f.from - t) < 0.5 && !f.dead) { f.lastUse = performance.now(); return; }
  f?.close();
  flussi.set(k, new Flusso(l, t));
}

/** chiude i flussi non usati da un po' (libera i decoder e la memoria video) */
export function pulisci(maxEta = 1500) {
  const now = performance.now();
  for (const [k, f] of flussi) if (now - f.lastUse > maxEta) { f.close(); flussi.delete(k); }
  for (const [k, r] of ricerche) {
    if (now - r.lastUse > 8000) { r.close(); ricerche.delete(k); }
    else if (now - r.lastUse > 2000) r.riposa();
  }
}
setInterval(() => pulisci(), 1000);

/** ferma tutti i flussi (stop o salto): la ricerca resta per il fermo immagine */
export function fermaFlussi() {
  for (const [k, f] of flussi) {
    // il fotogramma corrente passa alla ricerca, così lo stop non fa sparire l'immagine
    const rc = ricerche.get(k);
    if (f.current && (!rc || !rc.current)) {
      const [, mediaId, q] = k.split('|').slice(-3);
      const l = lettoreDi(mediaId, q as Qualita);
      if (l) ricerca(k, l).current = f.current.clone();
    }
    f.close();
  }
  flussi.clear();
}

/** chi ha finito di guardare (l'anteprima del contenitore) libera il suo fotogramma */
export function lascia(key: string, mediaId: string) {
  for (const q of ['p', 'o']) {
    const k = key + '|' + mediaId + '|' + q;
    ricerche.get(k)?.close();
    ricerche.delete(k);
  }
}

/** la ripresa è sparita o ha cambiato proxy: via decoder, flussi e ricerche */
export function dimenticaMedia(mediaId: string, soloProxy = false) {
  const tocca = (k: string) => k.includes('|' + mediaId + '|') && (!soloProxy || k.endsWith('|p'));
  for (const k of [...lettori.keys()]) if ((k + '|').startsWith(mediaId + '|') && (!soloProxy || k.endsWith('|p'))) lettori.delete(k);
  for (const [k, f] of flussi) if (tocca(k)) { f.close(); flussi.delete(k); }
  for (const [k, r] of ricerche) if (tocca(k)) { r.close(); ricerche.delete(k); }
  avvisa();
}

export function statoDecoder() {
  return { flussi: flussi.size, ricerche: ricerche.size, nati: conti.flussi };
}
