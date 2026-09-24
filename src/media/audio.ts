// Il banco audio: tracce con volume, panorama, muto e solo; clip con linea elastica del volume, dissolvenze e
// incroci; il tono di riferimento. Lo stesso grafo serve la riproduzione e l'export (OfflineAudioContext).
import { AudioBufferSink } from 'mediabunny';
import type { Clip, Project } from '../core/tipi';
import { dbToGain, end, keyValue, mediaOf } from '../core/progetto';
import { f2s } from '../core/timecode';
import { mediaRT } from './libreria';

const SUONA = new Set(['media', 'tone', 'beep']);

/** la clip audio attaccata dopo c con transizione in testa (allunga c per l'incrocio) */
function codaIncrocio(p: Project, c: Clip): number {
  const n = p.clips.find((x) => x.track === c.track && x.id !== c.id && x.start === end(c) && x.trIn);
  return n?.trIn ? n.trIn.len : 0;
}

/** guadagno lineare della clip al fotogramma locale lf (linea elastica × dissolvenze × incroci) */
export function guadagnoClip(c: Clip, lf: number, coda: number): number {
  const db = c.gainKeys.length ? keyValue(c.gainKeys, lf, c.gain) : c.gain;
  let g = dbToGain(db);
  if (c.fadeIn > 0 && lf < c.fadeIn) g *= Math.max(0, lf / c.fadeIn);
  if (c.fadeOut > 0 && lf > c.len - c.fadeOut) g *= Math.max(0, (c.len - lf) / c.fadeOut);
  if (c.trIn && lf < c.trIn.len) g *= Math.max(0, lf / c.trIn.len);
  if (lf >= c.len) g *= coda > 0 ? Math.max(0, 1 - (lf - c.len) / coda) : 0;
  if (lf < 0) g = 0;
  return g;
}

/** punti dell'inviluppo (fotogrammi locali) dove il guadagno cambia pendenza */
function puntiInviluppo(c: Clip, coda: number): number[] {
  const s = new Set<number>([0, c.len, c.len + coda]);
  const add = (a: number, b: number) => { for (let i = 0; i <= 6; i++) s.add(a + ((b - a) * i) / 6); };
  if (c.fadeIn) add(0, c.fadeIn);
  if (c.fadeOut) add(c.len - c.fadeOut, c.len);
  if (c.trIn) add(0, c.trIn.len);
  if (coda) add(c.len, c.len + coda);
  for (let i = 0; i < c.gainKeys.length; i++) {
    s.add(c.gainKeys[i].f);
    if (i) add(c.gainKeys[i - 1].f, c.gainKeys[i].f);
  }
  return [...s].filter((x) => x >= 0 && x <= c.len + coda).sort((a, b) => a - b);
}

/** programma l'inviluppo su un GainNode: t0 = tempo del contesto in cui la timeline è a startSec */
function applicaInviluppo(g: GainNode, p: Project, c: Clip, coda: number, t0: number, startSec: number, now: number) {
  const r = p.rate;
  const toCtx = (lf: number) => t0 + f2s(c.start + lf, r) - startSec;
  const pts = puntiInviluppo(c, coda);
  const lfNow = ((now - t0 + startSec) * r.num) / r.den - c.start;
  g.gain.cancelScheduledValues(0);
  g.gain.setValueAtTime(guadagnoClip(c, Math.max(0, lfNow), coda), Math.max(now, toCtx(0)));
  for (const lf of pts) {
    const when = toCtx(lf);
    if (when <= now) continue;
    g.gain.linearRampToValueAtTime(guadagnoClip(c, lf, coda), when);
  }
}

interface Voce {
  clip: Clip;
  gain: GainNode;
  pan: StereoPannerNode;
  nodes: (AudioBufferSourceNode | OscillatorNode)[];
  iter?: AsyncGenerator<{ buffer: AudioBuffer; timestamp: number }, void, unknown>;
  until: number;
  finita: boolean;
  pumping: boolean;
}

export interface Misure { l: number; r: number; lPeak: number; rPeak: number }

class Banco {
  ctx: AudioContext | null = null;
  master!: GainNode;
  private anL!: AnalyserNode;
  private anR!: AnalyserNode;
  private bufL = new Float32Array(2048);
  private bufR = new Float32Array(2048);
  private tracce = new Map<string, { gain: GainNode; pan: StereoPannerNode; an: AnalyserNode }>();
  private voci = new Map<string, Voce>();
  private timer = 0;
  /** tempo del contesto in cui la timeline era a startSec */
  private t0 = 0;
  private startSec = 0;
  private attivo = false;
  private p: Project | null = null;
  private modo: 'timeline' | 'player' = 'timeline';
  private playerMedia: string | null = null;
  volumeMaster = 1;

  sveglia() {
    if (!this.ctx) {
      this.ctx = new AudioContext({ sampleRate: 48000, latencyHint: 'interactive' });
      const ctx = this.ctx;
      this.master = ctx.createGain();
      const split = ctx.createChannelSplitter(2);
      this.anL = ctx.createAnalyser();
      this.anR = ctx.createAnalyser();
      this.anL.fftSize = this.anR.fftSize = 2048;
      this.master.connect(split);
      split.connect(this.anL, 0);
      split.connect(this.anR, 1);
      this.master.connect(ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /** secondi di timeline adesso (l'orologio è quello della scheda audio: il video lo segue) */
  ora(): number {
    if (!this.ctx || !this.attivo) return this.startSec;
    return this.startSec + (this.ctx.currentTime - this.t0);
  }

  get suonando() { return this.attivo; }

  private bus(trackId: string) {
    let b = this.tracce.get(trackId);
    if (!b) {
      const ctx = this.ctx!;
      const gain = ctx.createGain(), pan = ctx.createStereoPanner(), an = ctx.createAnalyser();
      an.fftSize = 1024;
      gain.connect(pan);
      pan.connect(this.master);
      pan.connect(an);
      b = { gain, pan, an };
      this.tracce.set(trackId, b);
    }
    return b;
  }

  /** aggiorna volumi, panorami, muti e solo delle tracce (anche mentre suona) */
  aggiornaTracce(p: Project) {
    if (!this.ctx) return;
    const solo = p.tracks.some((t) => t.kind === 'audio' && t.solo);
    for (const t of p.tracks) {
      if (t.kind !== 'audio') continue;
      const b = this.bus(t.id);
      const on = !t.mute && (!solo || t.solo);
      b.gain.gain.setTargetAtTime(on ? dbToGain(t.volume) : 0, this.ctx.currentTime, 0.015);
      b.pan.pan.setTargetAtTime(t.pan, this.ctx.currentTime, 0.015);
    }
    this.master.gain.setTargetAtTime(this.volumeMaster, this.ctx.currentTime, 0.015);
  }

  /** parte dalla timeline al secondo startSec */
  suona(p: Project, startSec: number) {
    this.ferma();
    const ctx = this.sveglia();
    this.p = p;
    this.modo = 'timeline';
    this.startSec = startSec;
    this.t0 = ctx.currentTime + 0.06;
    this.attivo = true;
    this.aggiornaTracce(p);
    this.giro();
    this.timer = window.setInterval(() => this.giro(), 40);
  }

  /** riproduce una sorgente del contenitore (il Player) dal secondo t */
  suonaSorgente(p: Project, mediaId: string, t: number) {
    this.ferma();
    const ctx = this.sveglia();
    this.p = p;
    this.modo = 'player';
    this.playerMedia = mediaId;
    this.startSec = t;
    this.t0 = ctx.currentTime + 0.06;
    this.attivo = true;
    this.master.gain.setTargetAtTime(this.volumeMaster, ctx.currentTime, 0.015);
    this.giro();
    this.timer = window.setInterval(() => this.giro(), 40);
  }

  /** il progetto è cambiato mentre suona: ricalcola le voci */
  rimescola(p: Project) {
    if (!this.attivo || this.modo !== 'timeline') return;
    const now = this.ora();
    this.suona(p, now);
  }

  ferma() {
    this.attivo = false;
    clearInterval(this.timer);
    for (const v of this.voci.values()) this.chiudiVoce(v);
    this.voci.clear();
  }

  private chiudiVoce(v: Voce) {
    v.finita = true;
    for (const n of v.nodes) { try { n.stop(); } catch { /* già fermo */ } n.disconnect(); }
    v.gain.disconnect();
    v.pan.disconnect();
    void v.iter?.return(undefined).catch(() => {});
  }

  private giro() {
    if (!this.attivo || !this.ctx || !this.p) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const pos = this.ora();
    const p = this.p;
    const ANTICIPO = 1.5;
    if (this.modo === 'player') {
      const id = 'player';
      if (!this.voci.has(id) && this.playerMedia) {
        const m = p.media.find((x) => x.id === this.playerMedia);
        const r = mediaRT(this.playerMedia);
        if (m && r?.a && r.aDecodable) {
          const fake = { id, track: '', kind: 'media', media: m.id, start: 0, len: 1e9, srcIn: 0, speed: 1, gain: 0, gainKeys: [], fadeIn: 0, fadeOut: 0, pan: 0 } as unknown as Clip;
          const gain = ctx.createGain(), pan = ctx.createStereoPanner();
          gain.connect(pan);
          pan.connect(this.master);
          const v: Voce = { clip: fake, gain, pan, nodes: [], until: now, finita: false, pumping: false };
          v.iter = new AudioBufferSink(r.a).buffers(this.startSec) as Voce['iter'];
          this.voci.set(id, v);
        }
      }
      const v = this.voci.get(id);
      if (v) void this.pompa(v, 0, 1e9, 0);
      return;
    }
    const fr = p.rate;
    for (const c of p.clips) {
      if (!SUONA.has(c.kind) || this.voci.has(c.id)) continue;
      const t = p.tracks.find((x) => x.id === c.track);
      if (!t || t.kind !== 'audio') continue;
      const coda = codaIncrocio(p, c);
      const cs = f2s(c.start, fr), ce = f2s(end(c) + coda, fr);
      if (ce <= pos || cs > pos + ANTICIPO) continue;
      const gain = ctx.createGain(), pan = ctx.createStereoPanner();
      pan.pan.value = c.pan;
      gain.connect(pan);
      pan.connect(this.bus(c.track).gain);
      applicaInviluppo(gain, p, c, coda, this.t0, this.startSec, now);
      const v: Voce = { clip: c, gain, pan, nodes: [], until: now, finita: false, pumping: false };
      this.voci.set(c.id, v);
      if (c.kind === 'tone' || c.kind === 'beep') {
        const o = ctx.createOscillator();
        o.frequency.value = c.gen?.freq ?? 1000;
        const lv = ctx.createGain();
        lv.gain.value = dbToGain(c.gen?.level ?? -18);
        o.connect(lv).connect(gain);
        const a = this.t0 + cs - this.startSec, b = this.t0 + ce - this.startSec;
        o.start(Math.max(now, a));
        o.stop(Math.max(now + 0.01, b));
        v.nodes.push(o);
        v.finita = true;
        continue;
      }
      const m = mediaOf(p, c);
      const r = c.media ? mediaRT(c.media) : undefined;
      if (!m || !r?.a || !r.aDecodable) { v.finita = true; continue; }
      const fromTl = Math.max(pos, cs);
      const srcFrom = c.srcIn + (fromTl - cs) * c.speed;
      const srcTo = c.srcIn + (ce - cs) * c.speed;
      v.iter = new AudioBufferSink(r.a).buffers(Math.max(0, srcFrom - 0.05), srcTo) as Voce['iter'];
    }
    for (const v of this.voci.values()) {
      if (v.iter && !v.finita) {
        const c = v.clip;
        const cs = f2s(c.start, fr);
        const ce = f2s(end(c) + codaIncrocio(p, c), fr);
        void this.pompa(v, cs, ce, c.srcIn);
      }
    }
    // voci finite da tempo: via
    for (const [id, v] of this.voci) {
      const c = v.clip;
      if (this.modo === 'timeline' && f2s(end(c) + codaIncrocio(p, c), fr) < pos - 0.5) {
        this.chiudiVoce(v);
        this.voci.delete(id);
      }
    }
  }

  /** decodifica e mette in coda i pezzi di audio fino a poco più avanti di adesso */
  private async pompa(v: Voce, cs: number, ce: number, srcIn: number) {
    if (v.pumping || v.finita || !this.ctx) return;
    v.pumping = true;
    const ctx = this.ctx;
    try {
      while (!v.finita && v.until < ctx.currentTime + 1.0) {
        const r = await v.iter!.next();
        if (v.finita || !this.attivo) break;
        if (r.done) { v.finita = true; break; }
        const { buffer, timestamp } = r.value;
        // tempo di timeline dell'inizio del pezzo
        const tl = cs + (timestamp - srcIn) / (v.clip.speed || 1);
        let when = this.t0 + tl - this.startSec;
        let offset = 0;
        const now = ctx.currentTime;
        const clipStart = this.t0 + cs - this.startSec;
        const clipEnd = this.t0 + ce - this.startSec;
        if (when < clipStart) { offset += clipStart - when; when = clipStart; }
        if (when < now) { offset += now - when; when = now; }
        const dur = Math.min(buffer.duration - offset, clipEnd - when);
        v.until = this.t0 + tl - this.startSec + buffer.duration;
        if (dur <= 0.0005) { if (when >= clipEnd) v.finita = true; continue; }
        const s = ctx.createBufferSource();
        s.buffer = buffer;
        s.connect(v.gain);
        s.start(when, offset, dur);
        s.onended = () => { const i = v.nodes.indexOf(s); if (i >= 0) v.nodes.splice(i, 1); s.disconnect(); };
        v.nodes.push(s);
      }
    } catch { v.finita = true; }
    v.pumping = false;
  }

  /** livelli per i VU: rms (per la lancetta) e picco (per il led) dei due canali, 0..1 */
  misure(): Misure {
    if (!this.ctx) return { l: 0, r: 0, lPeak: 0, rPeak: 0 };
    this.anL.getFloatTimeDomainData(this.bufL);
    this.anR.getFloatTimeDomainData(this.bufR);
    const mis = (b: Float32Array) => {
      let s = 0, pk = 0;
      for (let i = 0; i < b.length; i++) { const x = b[i]; s += x * x; const a = x < 0 ? -x : x; if (a > pk) pk = a; }
      return [Math.sqrt(s / b.length), pk];
    };
    const [l, lPeak] = mis(this.bufL), [r, rPeak] = mis(this.bufR);
    return { l, r, lPeak, rPeak };
  }

  private bufT = new Float32Array(1024);
  /** livello di picco di una traccia (per il mixer) */
  livelloTraccia(trackId: string): number {
    const b = this.tracce.get(trackId);
    if (!b) return 0;
    b.an.getFloatTimeDomainData(this.bufT);
    let pk = 0;
    for (let i = 0; i < this.bufT.length; i++) { const a = Math.abs(this.bufT[i]); if (a > pk) pk = a; }
    return pk;
  }
}

export const banco = new Banco();

/**
 * Mixaggio per l'export: rende l'audio della timeline da fromSec a toSec in pezzi (così un'ora di
 * montaggio non chiede gigabyte di memoria). Chiama onChunk con ogni AudioBuffer in ordine.
 */
export async function* mixaggio(p: Project, fromSec: number, toSec: number): AsyncGenerator<AudioBuffer> {
  const SR = p.sampleRate || 48000;
  const PEZZO = 10;
  const solo = p.tracks.some((t) => t.kind === 'audio' && t.solo);
  const fr = p.rate;
  for (let a = fromSec; a < toSec - 1e-6; a += PEZZO) {
    const b = Math.min(toSec, a + PEZZO);
    const len = Math.max(1, Math.round((b - a) * SR));
    const ctx = new OfflineAudioContext({ numberOfChannels: 2, length: len, sampleRate: SR });
    const master = ctx.createGain();
    master.connect(ctx.destination);
    const bus = new Map<string, GainNode>();
    for (const t of p.tracks) {
      if (t.kind !== 'audio') continue;
      const g = ctx.createGain(), pn = ctx.createStereoPanner();
      g.gain.value = !t.mute && (!solo || t.solo) ? dbToGain(t.volume) : 0;
      pn.pan.value = t.pan;
      g.connect(pn).connect(master);
      bus.set(t.id, g);
    }
    const lavori: Promise<void>[] = [];
    for (const c of p.clips) {
      if (!SUONA.has(c.kind)) continue;
      const tb = bus.get(c.track);
      if (!tb) continue;
      const coda = codaIncrocio(p, c);
      const cs = f2s(c.start, fr), ce = f2s(end(c) + coda, fr);
      if (ce <= a || cs >= b) continue;
      const g = ctx.createGain(), pn = ctx.createStereoPanner();
      pn.pan.value = c.pan;
      g.connect(pn).connect(tb);
      applicaInviluppo(g, p, c, coda, 0, a, 0);
      if (c.kind === 'tone' || c.kind === 'beep') {
        const o = ctx.createOscillator();
        o.frequency.value = c.gen?.freq ?? 1000;
        const lv = ctx.createGain();
        lv.gain.value = dbToGain(c.gen?.level ?? -18);
        o.connect(lv).connect(g);
        o.start(Math.max(0, cs - a));
        o.stop(Math.max(0.001, Math.min(b, ce) - a));
        continue;
      }
      const r = c.media ? mediaRT(c.media) : undefined;
      if (!r?.a || !r.aDecodable) continue;
      const from = Math.max(a, cs), to = Math.min(b, ce);
      const srcFrom = c.srcIn + (from - cs) * c.speed;
      const srcTo = c.srcIn + (to - cs) * c.speed;
      lavori.push((async () => {
        const sink = new AudioBufferSink(r.a!);
        for await (const { buffer, timestamp } of sink.buffers(Math.max(0, srcFrom - 0.05), srcTo + 0.05)) {
          let when = cs + (timestamp - c.srcIn) / c.speed - a;
          let offset = 0;
          const lo = from - a;
          if (when < lo) { offset = lo - when; when = lo; }
          const dur = Math.min(buffer.duration - offset, to - a - when);
          if (dur <= 0) continue;
          const s = ctx.createBufferSource();
          s.buffer = buffer;
          s.connect(g);
          s.start(when, offset, dur);
        }
      })());
    }
    await Promise.all(lavori);
    yield await ctx.startRendering();
  }
}
