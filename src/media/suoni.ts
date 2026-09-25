// I suoni degli FX, fatti al volo (niente file, niente diritti): rumore filtrato che passa (whoosh, swish), colpi
// bassi (impatto, colpo, battito), zap, glitch, scatto, salite e discese, il nastro che si ferma, una campanella,
// il piatto al contrario. Sempre uguali (il rumore ha il suo seme), fatti una volta e poi tenuti da parte.
// Lo stesso buffer suona nel monitor e finisce nell'export (src/media/audio.ts).
import type { Project } from '../core/tipi';
import { dbToGain } from '../core/progetto';
import { piccoSuono } from '../core/blocchi';
import { suono, SUONI } from '../core/suoni';
import { f2s } from '../core/timecode';

const SR = 48000;
const cache = new Map<string, AudioBuffer>();

/** rumore bianco con il suo seme: ogni volta lo stesso */
function rumore(seme: number) {
  let x = seme >>> 0 || 1;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) / 4294967296) * 2 - 1; };
}

/** filtro biquad (RBJ) con la frequenza che può cambiare nel tempo */
class Filtro {
  private x1 = 0; private x2 = 0; private y1 = 0; private y2 = 0;
  private b0 = 1; private b1 = 0; private b2 = 0; private a1 = 0; private a2 = 0;
  constructor(private tipo: 'lp' | 'hp' | 'bp', private q = 0.707) {}
  imposta(freq: number) {
    const w = (2 * Math.PI * Math.min(freq, SR * 0.45)) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * this.q);
    let b0: number, b1: number, b2: number;
    if (this.tipo === 'lp') { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = (1 - cs) / 2; }
    else if (this.tipo === 'hp') { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = (1 + cs) / 2; }
    else { b0 = al; b1 = 0; b2 = -al; }
    const a0 = 1 + al;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = (-2 * cs) / a0; this.a2 = (1 - al) / a0;
  }
  passa(x: number) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

const esp = (a: number, b: number, x: number) => a * Math.pow(b / a, Math.max(0, Math.min(1, x)));
const liscio = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };

type Voce = (t: number, i: number) => [number, number];

/** i suoni: una funzione per campione che dà sinistro e destro */
function voce(id: string, durata: number): Voce {
  const n1 = rumore(7), n2 = rumore(11);
  switch (id) {
    case 'whoosh': case 'swish': {
      const corto = id === 'swish';
      const pk = corto ? 0.2 : 0.45;
      const fL = new Filtro('bp', corto ? 1.6 : 1.1), fR = new Filtro('bp', corto ? 1.6 : 1.1);
      return (t, i) => {
        const x = t < pk ? t / pk : 1 + (t - pk) / (durata - pk);
        const freq = corto ? esp(1400, 7000, x / 1.4) : x < 1 ? esp(260, 2600, x) : esp(2600, 420, x - 1);
        if (i % 32 === 0) { fL.imposta(freq); fR.imposta(freq * 1.06); }
        const env = t < pk ? Math.pow(t / pk, 2.2) : Math.exp(-(t - pk) * (corto ? 16 : 7));
        const pan = Math.max(0, Math.min(1, t / durata));
        const a = fL.passa(n1()) * env, b = fR.passa(n2()) * env;
        return [a * (1.25 - pan * 0.5), b * (0.75 + pan * 0.5)];
      };
    }
    case 'impatto': {
      const lp = new Filtro('lp', 0.8); lp.imposta(900);
      let ph = 0;
      return (t) => {
        ph += (2 * Math.PI * esp(120, 36, t / 0.9)) / SR;
        const sub = Math.sin(ph) * Math.exp(-t * 2.6);
        const botto = lp.passa(n1()) * Math.exp(-t * 28) * 0.9;
        const v = Math.tanh((sub * 1.4 + botto) * 1.6);
        return [v, v];
      };
    }
    case 'colpo': {
      const hp = new Filtro('hp', 0.9); hp.imposta(1800);
      let ph = 0;
      return (t) => {
        ph += (2 * Math.PI * esp(170, 48, t / 0.18)) / SR;
        const cassa = Math.sin(ph) * Math.exp(-t * 11);
        const rull = hp.passa(n1()) * Math.exp(-t * 22) * 0.7;
        const v = Math.tanh((cassa + rull) * 1.5);
        return [v, v];
      };
    }
    case 'zap': {
      const hp = new Filtro('hp', 0.7); hp.imposta(5000);
      let ph = 0;
      const brillo = [3120, 4410, 5230, 6600];
      return (t) => {
        ph += (2 * Math.PI * esp(2600, 170, t / 0.32)) / SR;
        const raggio = Math.sin(ph) * Math.exp(-t * 6) * 0.8;
        const scintille = brillo.reduce((s, f, k) => s + Math.sin(2 * Math.PI * f * t + k) * (0.5 + 0.5 * Math.sin(t * (37 + k * 11))), 0) * 0.08 * Math.exp(-t * 4.5);
        const sfrigola = hp.passa(n1()) * Math.exp(-t * 12) * 0.5;
        return [raggio + scintille + sfrigola, raggio + scintille * 0.8 + sfrigola * 1.1];
      };
    }
    case 'glitch': {
      const pezzi: { da: number; tipo: number; f: number }[] = [];
      const r = rumore(23);
      for (let t = 0; t < durata;) { const l = 0.018 + (r() + 1) * 0.025; pezzi.push({ da: t, tipo: Math.floor((r() + 1) * 1.99), f: 180 + (r() + 1) * 900 }); t += l; }
      let k = 0, tenuto = 0;
      return (t, i) => {
        while (k < pezzi.length - 1 && pezzi[k + 1].da <= t) k++;
        const pz = pezzi[k];
        let v = 0;
        if (pz.tipo === 0) v = Math.sign(Math.sin(2 * Math.PI * pz.f * t)) * 0.6;
        else { if (i % 12 === 0) tenuto = Math.round(n1() * 4) / 4; v = tenuto * 0.8; }
        const env = Math.exp(-t * 2.5) * (t > durata - 0.04 ? (durata - t) / 0.04 : 1);
        return [v * env, (k % 2 ? v : -v) * env];
      };
    }
    case 'scatto': {
      const hp = new Filtro('hp', 0.8); hp.imposta(2500);
      return (t) => {
        const c1 = t < 0.012 ? 1 - t / 0.012 : 0, c2 = t > 0.11 && t < 0.125 ? 1 - (t - 0.11) / 0.015 : 0;
        const tonfo = Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t * 40) * 0.5;
        const v = hp.passa(n1()) * (c1 + c2 * 0.8) + tonfo;
        return [v, v];
      };
    }
    case 'riser': {
      const bp = new Filtro('bp', 1.4);
      let ph = 0;
      return (t, i) => {
        const x = t / durata;
        if (i % 32 === 0) bp.imposta(esp(220, 6000, x));
        ph += (2 * Math.PI * esp(180, 1300, x)) / SR;
        const fine = t > durata - 0.05 ? (durata - t) / 0.05 : 1;
        const env = Math.pow(x, 2) * fine;
        const v = (bp.passa(n1()) * 1.2 + Math.sin(ph) * 0.35 + Math.sin(ph * 1.5) * 0.15) * env;
        return [v, bp.passa(n2()) * 1.2 * env + Math.sin(ph) * 0.35 * env];
      };
    }
    case 'discesa': {
      const lp = new Filtro('lp', 1);
      let ph = 0;
      return (t, i) => {
        const x = t / durata;
        if (i % 32 === 0) lp.imposta(esp(6000, 200, x));
        ph += (2 * Math.PI * esp(1300, 55, x)) / SR;
        const env = Math.exp(-x * 2.2) * liscio(t / 0.02) * (1 - liscio((x - 0.85) / 0.15));
        const v = (Math.sin(ph) * 0.6 + lp.passa(n1()) * 0.5) * env;
        return [v, v];
      };
    }
    case 'nastro': {
      let ph = 0;
      const lp = new Filtro('lp', 0.7);
      return (t, i) => {
        const x = t / durata;
        const vel = Math.pow(1 - x, 2);
        if (i % 32 === 0) lp.imposta(300 + 3500 * vel);
        ph += (2 * Math.PI * 110 * vel) / SR;
        const sega = ((ph / (2 * Math.PI)) % 1) * 2 - 1, sega2 = ((ph * 1.5 / (2 * Math.PI)) % 1) * 2 - 1;
        const v = lp.passa((sega + sega2 * 0.6) * 0.5) * (1 - liscio((x - 0.8) / 0.2));
        return [v, v];
      };
    }
    case 'battito': {
      let ph = 0;
      return (t) => {
        const t2 = t > 0.28 ? t - 0.28 : -1;
        ph += (2 * Math.PI * esp(75, 42, (t2 > 0 ? t2 : t) / 0.15)) / SR;
        const a = Math.exp(-t * 16), b = t2 > 0 ? Math.exp(-t2 * 13) * 0.8 : 0;
        const v = Math.tanh(Math.sin(ph) * (a + b) * 1.8);
        return [v, v];
      };
    }
    case 'campanella': {
      const parz = [[1, 1, 2.2], [2.76, 0.5, 3.4], [5.4, 0.25, 5], [8.93, 0.12, 7]];
      return (t) => {
        let v = 0;
        for (const [k, a, d] of parz) v += Math.sin(2 * Math.PI * 1320 * k * t) * a * Math.exp(-t * d);
        v *= liscio(t / 0.002) * 0.5;
        return [v, v * 0.92 + Math.sin(2 * Math.PI * 1320.8 * t) * 0.04 * Math.exp(-t * 2.2)];
      };
    }
    case 'riverso': {
      const hp = new Filtro('hp', 0.7); hp.imposta(3200);
      const hp2 = new Filtro('hp', 0.7); hp2.imposta(3000);
      return (t) => {
        const pk = durata - 0.05;
        const env = t < pk ? Math.pow(Math.exp((t - pk) * 3.2), 1.4) : Math.max(0, 1 - (t - pk) / 0.05);
        return [hp.passa(n1()) * env * 1.4, hp2.passa(n2()) * env * 1.4];
      };
    }
  }
  return () => [0, 0];
}

/** il buffer del suono (fatto una volta sola), a −6 dB di picco */
export function bufferSuono(id: string): AudioBuffer | null {
  const s = suono(id);
  if (!s) return null;
  let b = cache.get(id);
  if (b) return b;
  const n = Math.round(s.durata * SR);
  const L = new Float32Array(n), R = new Float32Array(n);
  const v = voce(id, s.durata);
  let pk = 1e-6;
  for (let i = 0; i < n; i++) {
    const [a, c] = v(i / SR, i);
    L[i] = a; R[i] = c;
    pk = Math.max(pk, Math.abs(a), Math.abs(c));
  }
  // niente clic all'inizio e alla fine
  const bordo = Math.min(96, n >> 3);
  for (let i = 0; i < bordo; i++) { const k = i / bordo; L[n - 1 - i] *= k; R[n - 1 - i] *= k; }
  const g = 0.5 / pk;
  for (let i = 0; i < n; i++) { L[i] *= g; R[i] *= g; }
  try {
    b = new AudioBuffer({ length: n, numberOfChannels: 2, sampleRate: SR });
  } catch {
    return null;
  }
  b.copyToChannel(L, 0);
  b.copyToChannel(R, 1);
  cache.set(id, b);
  return b;
}

export interface SuonoFx { id: string; buf: AudioBuffer; at: number; gain: number }

/** i suoni accesi degli FX del progetto, con il secondo in cui partono (il colpo cade sul punto forte del blocco) */
export function suoniFx(p: Project): SuonoFx[] {
  const accese = new Set(p.tracks.filter((t) => t.kind === 'video' && !t.mute).map((t) => t.id));
  const out: SuonoFx[] = [];
  for (const c of p.clips) {
    const b = c.fxb;
    if (c.kind !== 'fx' || !b?.audio || !b.suono || !accese.has(c.track)) continue;
    const s = suono(b.suono), buf = bufferSuono(b.suono);
    if (!s || !buf) continue;
    out.push({ id: c.id, buf, at: f2s(piccoSuono(p, c), p.rate) - s.picco, gain: dbToGain(b.volume ?? 0) });
  }
  return out;
}

/** tutti i suoni pronti (per le prove) */
export const tuttiISuoni = () => SUONI.map((s) => ({ id: s.id, buf: bufferSuono(s.id) }));
