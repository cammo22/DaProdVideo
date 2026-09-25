// Gli FX a blocchetti: stanno sulle tracce video, sopra le clip (una striscia sottile in basso sulla riga), e non
// occupano posto: si mettono dove vuoi, anche uno sull'altro. Due famiglie, stesso modo di lavorare:
//  · EFFETTI a tempo: lampo, scossa, zoom, glitch… valgono per la loro traccia e per tutto quello che sta sotto;
//  · TRANSIZIONI: il blocco sta sopra un taglio della sua traccia e passa da una clip all'altra; lungo = lenta.
// Lasciati vicino a un bordo si sistemano da soli: centrati sul taglio fra due clip, all'inizio o alla fine della
// clip. Poi si allungano dai bordi. Un blocco segue la clip su cui sta (quella che ha sotto il suo centro).
// Qui c'è il catalogo, il calcolo di ogni fotogramma (lo stesso per il monitor e per l'export) e le regole per posarli.
import type { BloccoFx, Clip, Project, Transition } from './tipi';
import { end, newClip, newTransition } from './progetto';
import { suonoTransizione } from './suoni';
import { fps } from './timecode';
import { nomeModello, tipoDi } from '../render/transizioni';

export type V3 = [number, number, number];

/** come si muove l'immagine in quel fotogramma: tutti gli effetti accesi si sommano qui */
export interface StatoFx {
  /** ingrandimento (1 = niente) e spostamento in frazioni di quadro, rotazione in radianti */
  zoom: number; dx: number; dy: number; rot: number;
  blur: number; pixel: number; rgb: number; glitch: number; seme: number;
  desat: number; invert: number;
  flash: number; flashCol: V3;
  fade: number; fadeCol: V3;
  luce: number; lucePh: number;
  bande: number; vhs: number;
}

const neutro = (): StatoFx => ({
  zoom: 1, dx: 0, dy: 0, rot: 0, blur: 0, pixel: 0, rgb: 0, glitch: 0, seme: 0, desat: 0, invert: 0,
  flash: 0, flashCol: [1, 1, 1], fade: 0, fadeCol: [0, 0, 0], luce: 0, lucePh: 0, bande: 0, vhs: 0,
});

type Motore = 'flash' | 'scossa' | 'camera' | 'zoomColpo' | 'battito' | 'zoomLento' | 'glitch' | 'rgb' | 'negativo' | 'strobo'
  | 'pixel' | 'sfocaEntra' | 'sfocaEsce' | 'dalColore' | 'alColore' | 'luce' | 'bande' | 'bn' | 'tornaColore' | 'vhs';

export interface EffettoTempo {
  id: string;
  nome: string;
  info: string;
  /** secondi di partenza del blocco */
  durata: number;
  gruppo: 'rapidi' | 'lunghi';
  motore: Motore;
  /** colore di partenza (lampi e dissolvenze) */
  colore?: string;
}

export const EFFETTI_TEMPO: EffettoTempo[] = [
  { id: 'flash', nome: 'Lampo', info: 'un flash bianco: sul taglio o all\'inizio', durata: 0.5, gruppo: 'rapidi', motore: 'flash', colore: '#ffffff' },
  { id: 'lampoNero', nome: 'Lampo nero', info: 'un battito di ciglia al nero', durata: 0.4, gruppo: 'rapidi', motore: 'flash', colore: '#000000' },
  { id: 'scossa', nome: 'Scossa', info: 'la camera trema per il colpo', durata: 0.5, gruppo: 'rapidi', motore: 'scossa' },
  { id: 'zoomColpo', nome: 'Zoom colpo', info: 'un pugno di zoom a tempo', durata: 0.4, gruppo: 'rapidi', motore: 'zoomColpo' },
  { id: 'glitch', nome: 'Glitch', info: 'righe che saltano, colori che scappano', durata: 0.6, gruppo: 'rapidi', motore: 'glitch' },
  { id: 'rgb', nome: 'Colori sdoppiati', info: 'rosso e blu si separano', durata: 0.5, gruppo: 'rapidi', motore: 'rgb' },
  { id: 'negativo', nome: 'Negativo', info: 'un lampo in negativo', durata: 0.3, gruppo: 'rapidi', motore: 'negativo' },
  { id: 'strobo', nome: 'Stroboscopio', info: 'luci da discoteca', durata: 1, gruppo: 'rapidi', motore: 'strobo' },
  { id: 'pixel', nome: 'Pixel', info: 'da quadrettoni a nitido', durata: 0.8, gruppo: 'rapidi', motore: 'pixel' },
  { id: 'fuoco', nome: 'Messa a fuoco', info: 'da sfocato a nitido', durata: 1, gruppo: 'rapidi', motore: 'sfocaEntra' },
  { id: 'sfoca', nome: 'Sfoca', info: 'da nitido a sfocato', durata: 1, gruppo: 'rapidi', motore: 'sfocaEsce' },
  { id: 'dalNero', nome: 'Dal nero', info: 'l\'immagine esce dal nero', durata: 1, gruppo: 'lunghi', motore: 'dalColore', colore: '#000000' },
  { id: 'alNero', nome: 'Al nero', info: 'l\'immagine va nel nero', durata: 1, gruppo: 'lunghi', motore: 'alColore', colore: '#000000' },
  { id: 'dalBianco', nome: 'Dal bianco', info: 'si apre da una luce bianca', durata: 1, gruppo: 'lunghi', motore: 'dalColore', colore: '#ffffff' },
  { id: 'alBianco', nome: 'Al bianco', info: 'si chiude in una luce bianca', durata: 1, gruppo: 'lunghi', motore: 'alColore', colore: '#ffffff' },
  { id: 'zoomLento', nome: 'Zoom lento', info: 'si avvicina piano piano', durata: 5, gruppo: 'lunghi', motore: 'zoomLento' },
  { id: 'camera', nome: 'Camera a mano', info: 'ondeggia come a spalla', durata: 5, gruppo: 'lunghi', motore: 'camera' },
  { id: 'battito', nome: 'Battito', info: 'zoom a tempo di musica (120 bpm)', durata: 4, gruppo: 'lunghi', motore: 'battito' },
  { id: 'luce', nome: 'Luce calda', info: 'una lama di luce da pellicola', durata: 1.5, gruppo: 'lunghi', motore: 'luce' },
  { id: 'bande', nome: 'Bande cinema', info: 'le bande nere del 2,39:1', durata: 5, gruppo: 'lunghi', motore: 'bande' },
  { id: 'bn', nome: 'Bianco e nero', info: 'toglie il colore per un pezzo', durata: 3, gruppo: 'lunghi', motore: 'bn' },
  { id: 'tornaColore', nome: 'Torna il colore', info: 'dal bianco e nero al colore', durata: 2, gruppo: 'lunghi', motore: 'tornaColore' },
  { id: 'vhs', nome: 'Disturbo VHS', info: 'il nastro che si rovina', durata: 1, gruppo: 'lunghi', motore: 'vhs' },
];

export const effettoTempo = (id: string) => EFFETTI_TEMPO.find((e) => e.id === id);

/** il suono che ogni effetto si porta dietro (quelli lunghi e silenziosi non ne hanno) */
const SUONO_EFFETTO: Record<string, string> = {
  flash: 'zap', lampoNero: 'colpo', scossa: 'impatto', zoomColpo: 'colpo', glitch: 'glitch', rgb: 'zap', negativo: 'colpo',
  pixel: 'glitch', fuoco: 'riverso', sfoca: 'discesa', dalBianco: 'riverso', alBianco: 'riser', battito: 'battito', vhs: 'nastro',
};

/** le durate proposte nel contenitore (0 = quella giusta per ogni effetto) */
export const DURATE = [0, 0.5, 1, 2, 5, 10];

// ——— le transizioni a blocchetto ———

/** 'mix', 'dip', 'wipe:119', 'dve:301' → la transizione (la durata la dà il blocco) */
export function transizioneDa(id: string, len = 25): Transition {
  const [tipo, pat] = id.split(':');
  const p = Number(pat) || 1;
  if (tipo === 'mix' || tipo === 'dip') return newTransition(tipo, len);
  const t = newTransition(tipoDi(p), len, p);
  if (t.type === 'wipe') { t.soft = 0.03; t.border = 0.012; } else t.soft = 0;
  return t;
}
export const idTransizione = (t: Transition) => (t.type === 'mix' || t.type === 'dip' ? t.type : `${t.type}:${t.pattern}`);

/** il suono di partenza di un blocco (acceso, se c'è: si spegne con un clic sull'altoparlante) */
export const suonoDi = (tipo: 'effetto' | 'transizione', id: string) => (tipo === 'effetto' ? SUONO_EFFETTO[id] : suonoTransizione(id));

export function nuovoBlocco(tipo: 'effetto' | 'transizione', id: string): BloccoFx {
  const suono = suonoDi(tipo, id);
  const s = suono ? { suono, audio: true } : {};
  if (tipo === 'effetto') return { tipo, id, forza: 1, colore: effettoTempo(id)?.colore ?? '#ffffff', ...s };
  return { tipo, id, forza: 1, colore: '#000000', tr: transizioneDa(id), ...s };
}

/** cambia modello o effetto a un blocco: il suono segue, se era quello di partenza (o non c'era) */
export function cambiaModello(b: BloccoFx, id: string): BloccoFx {
  const vecchio = suonoDi(b.tipo, b.id), nuovo = suonoDi(b.tipo, id);
  const n: BloccoFx = { ...b, id };
  if (b.tipo === 'transizione') n.tr = { ...transizioneDa(id), reverse: b.tr?.reverse ?? false };
  else n.colore = effettoTempo(id)?.colore ?? b.colore;
  if (!b.suono || b.suono === vecchio) { n.suono = nuovo; n.audio = nuovo ? b.audio ?? true : b.audio; }
  return n;
}

export const nomeBlocco = (b: BloccoFx) => (b.tipo === 'effetto' ? effettoTempo(b.id)?.nome ?? 'Effetto' : b.tr ? nomeModello(b.tr.type, b.tr.pattern) : 'Transizione');

/** durata di partenza in fotogrammi (dur = secondi scelti nel contenitore, 0 = quella dell'effetto) */
export function durataBlocco(p: Project, tipo: 'effetto' | 'transizione', id: string, dur = 0): number {
  const s = dur || (tipo === 'effetto' ? effettoTempo(id)?.durata ?? 1 : id === 'dve:401' || id === 'dve:411' ? 1.2 : 1);
  return Math.max(2, Math.round(s * fps(p.rate)));
}

// ——— i tagli sotto i blocchi ———

const VISIBILI = new Set(['media', 'color', 'bars', 'countdown', 'title']);

export interface Taglio { f: number; track: string; a: Clip | null; b: Clip | null }

export const centro = (c: Clip) => c.start + c.len / 2;

/** i bordi delle clip video (tagli fra due clip, o inizi e fine liberi) fra a e b */
export function tagliFra(p: Project, a: number, b: number, track?: string): Taglio[] {
  const out: Taglio[] = [];
  for (const t of p.tracks) {
    if (t.kind !== 'video' || (track && t.id !== track)) continue;
    const cs = p.clips.filter((c) => c.track === t.id && VISIBILI.has(c.kind));
    const visti = new Set<number>();
    for (const c of cs) {
      for (const f of [c.start, end(c)]) {
        if (f < a || f > b || visti.has(f)) continue;
        visti.add(f);
        out.push({ f, track: t.id, a: cs.find((x) => end(x) === f) ?? null, b: cs.find((x) => x.start === f) ?? null });
      }
    }
  }
  return out;
}

/**
 * Il taglio più vicino a f (entro maxDist fotogrammi): prima i tagli veri fra due clip, poi i bordi liberi.
 * Serve a posare le transizioni (e i lampi) proprio sul taglio.
 */
export function taglioVicino(p: Project, f: number, maxDist: number, track?: string): Taglio | null {
  let best: Taglio | null = null, bd = Infinity;
  for (const t of tagliFra(p, f - maxDist, f + maxDist, track)) {
    // a parità, la traccia più in basso (il girato, non il titolo che ci sta sopra)
    const d = Math.abs(t.f - f) + (t.a && t.b ? 0 : maxDist * 0.35) - p.tracks.findIndex((x) => x.id === t.track) * 0.001;
    if (d < bd) { bd = d; best = t; }
  }
  return best;
}

export interface TransizioneAttiva {
  blocco: Clip;
  tr: Transition;
  track: string;
  /** dove succede davvero (il blocco, stretto alle clip se sono più corte) */
  s: number;
  e: number;
  cut: number;
  a: Clip | null;
  b: Clip | null;
}

/** Il taglio su cui lavora un blocco transizione: quello della sua traccia più vicino al suo centro, preferendo
 *  i tagli veri (fra due clip). Una transizione, un taglio. */
export function taglioDelBlocco(p: Project, bl: Clip): Taglio | null {
  const m = centro(bl);
  let best: Taglio | null = null, bd = Infinity;
  for (const tg of tagliFra(p, bl.start, end(bl), bl.track)) {
    const d = Math.abs(tg.f - m) + (tg.a && tg.b ? 0 : bl.len * 0.3);
    if (d < bd) { bd = d; best = tg; }
  }
  return best;
}

/** i blocchetti FX di una traccia video accesa (quelle spente non fanno niente) */
function blocchiAccesi(p: Project, tipo: 'effetto' | 'transizione', track?: string): Clip[] {
  const accese = new Set(p.tracks.filter((t) => t.kind === 'video' && !t.mute && (!track || t.id === track)).map((t) => t.id));
  return p.clips.filter((c) => c.kind === 'fx' && c.fxb?.tipo === tipo && accese.has(c.track));
}

/** le transizioni dei blocchi, ognuna col suo taglio */
export function transizioniAttive(p: Project): TransizioneAttiva[] {
  const out: TransizioneAttiva[] = [];
  for (const bl of blocchiAccesi(p, 'transizione')) {
    if (!bl.fxb?.tr) continue;
    const tg = taglioDelBlocco(p, bl);
    if (!tg) continue;
    // se le clip sono più corte del blocco, la transizione si stringe dentro di loro
    const s = Math.max(bl.start, tg.a ? tg.a.start : bl.start), e = Math.min(end(bl), tg.b ? end(tg.b) : end(bl));
    if (e - s < 1) continue;
    out.push({ blocco: bl, tr: { ...bl.fxb.tr, len: e - s }, track: tg.track, s, e, cut: tg.f, a: tg.a, b: tg.b });
  }
  return out;
}

/** il blocco transizione ha un taglio sotto? (senza, è spento: si disegna tratteggiato) */
export const haTaglio = (p: Project, bl: Clip) => tagliFra(p, bl.start, end(bl), bl.track).length > 0;

/** il punto forte del blocco (0..1): sul taglio che ci sta sotto, se c'è; altrimenti proprio all'inizio */
export function piccoDi(p: Project, bl: Clip): number {
  const m = centro(bl);
  let best: number | null = null;
  for (const t of tagliFra(p, bl.start, end(bl), bl.track)) if (best === null || Math.abs(t.f - m) < Math.abs(best - m)) best = t.f;
  return best === null ? 0.06 : Math.max(0, Math.min(1, (best - bl.start) / Math.max(1, bl.len)));
}

/** dove cade il colpo del suono di un blocco (fotogrammi): sul taglio, sul lampo, o alla fine per chi sale */
export function piccoSuono(p: Project, bl: Clip): number {
  const b = bl.fxb!;
  if (b.tipo === 'transizione') { const tg = taglioDelBlocco(p, bl); return tg ? tg.f : centro(bl); }
  const m = effettoTempo(b.id)?.motore;
  if (m === 'alColore' || m === 'sfocaEsce') return end(bl);
  if (m === 'dalColore' || m === 'sfocaEntra' || m === 'pixel') return bl.start;
  return bl.start + piccoDi(p, bl) * bl.len;
}

// ——— il calcolo di ogni fotogramma ———

const dolce = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
const hash = (x: number) => { const s = Math.sin(x * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function hex(c: string): V3 {
  const m = c.replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map((x) => x + x).join('') : m.slice(0, 6), 16) || 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
/** sale e scende ai bordi del blocco (per gli effetti lunghi: entrano ed escono morbidi) */
const bordi = (x: number, k = 6) => Math.min(1, x * k, (1 - x) * k);

function applica(st: StatoFx, p: Project, bl: Clip, f: number) {
  const b = bl.fxb!;
  const e = effettoTempo(b.id);
  if (!e) return;
  const r = fps(p.rate);
  const x = Math.max(0, Math.min(1, (f - bl.start + 0.5) / Math.max(1, bl.len)));
  const k = Math.max(0, Math.min(1.5, b.forza));
  const t = f / r, tl = (f - bl.start) / r;
  const col = hex(b.colore || e.colore || '#ffffff');
  switch (e.motore) {
    case 'flash': {
      const pk = piccoDi(p, bl);
      const env = x < pk ? dolce(x / Math.max(1e-3, pk)) : Math.pow(Math.max(0, 1 - (x - pk) / Math.max(1e-3, 1 - pk)), 1.7);
      const v = k * env;
      if (v > st.flash) { st.flash = Math.min(1, v); st.flashCol = col; }
      break;
    }
    case 'strobo': {
      const v = k * 0.92 * ((Math.floor(f) % 4) < 2 ? 1 : 0) * bordi(x, 10);
      if (v > st.flash) { st.flash = v; st.flashCol = col; }
      break;
    }
    case 'scossa': {
      const a = k * 0.035 * Math.pow(1 - x, 1.4);
      st.dx += a * (Math.sin(t * 71) + 0.6 * Math.sin(t * 43 + 1.3)) / 1.6;
      st.dy += a * (Math.sin(t * 59 + 2.1) + 0.6 * Math.sin(t * 37)) / 1.6;
      st.rot += a * 0.6 * Math.sin(t * 53);
      st.zoom *= 1 + a * 2.4;
      break;
    }
    case 'camera': {
      const a = k * 0.012 * bordi(x);
      st.dx += a * (Math.sin(t * 1.7) + 0.5 * Math.sin(t * 3.1 + 1));
      st.dy += a * (Math.sin(t * 1.3 + 2) + 0.5 * Math.sin(t * 2.7));
      st.rot += a * 0.7 * Math.sin(t * 1.1);
      st.zoom *= 1 + a * 3.2;
      break;
    }
    case 'zoomColpo': {
      const pk = piccoDi(p, bl) < 0.1 ? 0 : piccoDi(p, bl);
      const y = x - pk;
      const env = y < 0 ? dolce(1 + y / Math.max(0.05, pk)) * 0.4 : y < 0.12 ? dolce(y / 0.12) : 1 - dolce((y - 0.12) / Math.max(0.05, 1 - pk - 0.12));
      st.zoom *= 1 + k * 0.2 * Math.max(0, env);
      break;
    }
    case 'battito': {
      const ph = (tl % 0.5) / 0.5;
      st.zoom *= 1 + k * 0.07 * Math.pow(1 - ph, 4) * bordi(x, 12);
      break;
    }
    case 'zoomLento': st.zoom *= 1 + k * 0.25 * dolce(x); break;
    case 'glitch': {
      const v = k * (hash(Math.floor(f) * 0.37 + bl.start) > 0.35 ? 1 : 0.25) * bordi(x, 8);
      if (v > st.glitch) { st.glitch = v; st.seme = Math.floor(f); }
      break;
    }
    case 'rgb': st.rgb = Math.max(st.rgb, k * Math.sin(Math.PI * x)); break;
    case 'negativo': st.invert = Math.max(st.invert, k * (x < 0.35 ? 1 : 1 - dolce((x - 0.35) / 0.65))); break;
    case 'pixel': st.pixel = Math.max(st.pixel, k * (1 - dolce(x))); break;
    case 'sfocaEntra': st.blur = Math.max(st.blur, k * (1 - dolce(x))); break;
    case 'sfocaEsce': st.blur = Math.max(st.blur, k * dolce(x)); break;
    case 'dalColore': { const v = k * (1 - dolce(x)); if (v > st.fade) { st.fade = Math.min(1, v); st.fadeCol = col; } break; }
    case 'alColore': { const v = k * dolce(x); if (v > st.fade) { st.fade = Math.min(1, v); st.fadeCol = col; } break; }
    case 'luce': if (k * Math.sin(Math.PI * x) > st.luce) { st.luce = k * Math.sin(Math.PI * x); st.lucePh = x; } break;
    case 'bande': st.bande = Math.max(st.bande, k * Math.min(dolce(x * 5), dolce((1 - x) * 5))); break;
    case 'bn': st.desat = Math.max(st.desat, Math.min(1, k) * bordi(x, 8)); break;
    case 'tornaColore': st.desat = Math.max(st.desat, Math.min(1, k) * (1 - dolce(x))); break;
    case 'vhs': st.vhs = Math.max(st.vhs, k * Math.sin(Math.PI * x)); break;
  }
}

/** gli effetti a tempo della traccia accesi al fotogramma f (null = nessuno: il compositore salta il passaggio).
 *  Valgono per la traccia e per tutto quello che sta sotto (come un livello di regolazione). */
export function statoEffetti(p: Project, f: number, track?: string): StatoFx | null {
  let st: StatoFx | null = null;
  for (const c of blocchiAccesi(p, 'effetto', track)) {
    if (f < c.start || f >= end(c)) continue;
    st ??= neutro();
    applica(st, p, c, f);
  }
  return st;
}

// ——— posare i blocchi ———

/** i blocchi attaccati a una clip (così la seguono quando si sposta e se ne vanno con lei): sulla sua traccia, le
 *  transizioni col taglio all'inizio della clip (o alla fine, se dopo non c'è niente), gli effetti col centro dentro */
export function blocchiDi(p: Project, c: Clip): Clip[] {
  if (c.kind === 'fx') return [];
  return p.clips.filter((b) => {
    if (b.kind !== 'fx' || b.track !== c.track) return false;
    if (b.fxb?.tipo === 'transizione') {
      const tg = taglioDelBlocco(p, b);
      if (tg) return (tg.b ?? tg.a)?.id === c.id;
    }
    return centro(b) >= c.start && centro(b) < end(c);
  });
}

/** la transizione che lavora già su quel taglio (una sola per taglio) */
export function transizioneSul(p: Project, tg: Taglio): Clip | undefined {
  return p.clips.find((c) => c.kind === 'fx' && c.fxb?.tipo === 'transizione' && c.track === tg.track && c.start <= tg.f && end(c) >= tg.f
    && taglioDelBlocco(p, c)?.f === tg.f);
}

/** nuova durata: le transizioni restano centrate, gli effetti partono dallo stesso punto (o finiscono lì, se
 *  stavano attaccati alla fine della clip) */
export function durataDelBlocco(p: Project, c: Clip, len: number) {
  len = Math.max(2, Math.round(len));
  if (c.fxb?.tipo === 'transizione') c.start = Math.max(0, Math.round(c.start + c.len / 2 - len / 2));
  else {
    const sotto = p.clips.find((x) => x.track === c.track && VISIBILI.has(x.kind) && end(x) === end(c));
    if (sotto && c.start > sotto.start) c.start = Math.max(sotto.start, end(c) - len);
  }
  c.len = len;
}

/** mette un blocco sulla traccia video (da start per len fotogrammi); ritorna la clip nuova. Non copre niente:
 *  i blocchi stanno sopra le clip */
export function posaBlocco(p: Project, b: BloccoFx, start: number, len: number, track?: string | null): Clip {
  start = Math.max(0, Math.round(start));
  len = Math.max(2, Math.round(len));
  const t = track && p.tracks.some((x) => x.id === track && x.kind === 'video') ? track : tracciaPerBlocco(p, start + len / 2);
  const c = newClip('fx', t, start, len, { name: nomeBlocco(b), fxb: structuredClone(b) });
  p.clips.push(c);
  return c;
}

/** la traccia video giusta per un blocco al fotogramma f: la più in alto con una clip lì, se no la più in basso */
export function tracciaPerBlocco(p: Project, f: number, soloTagli = false): string {
  const video = p.tracks.filter((t) => t.kind === 'video');
  for (const t of video) {
    if (t.lock) continue;
    if (soloTagli ? tagliFra(p, f - 1, f + 1, t.id).length : p.clips.some((c) => c.track === t.id && VISIBILI.has(c.kind) && c.start <= f && end(c) > f)) return t.id;
  }
  return (video.filter((t) => !t.lock).pop() ?? video[video.length - 1]).id;
}

export type Dove = 'taglio' | 'inizio' | 'fine' | 'libero';

export interface Posto { start: number; taglio: Taglio | null; dove: Dove }

/**
 * Dove va un blocco lungo len lasciato al fotogramma f sulla traccia: si sistema da solo sul bordo più vicino.
 *  · fra due clip: le transizioni si centrano sul taglio; gli effetti anche, se li lasci proprio lì, altrimenti
 *    finiscono sul taglio (fine della clip a sinistra) o partono dal taglio (inizio di quella a destra);
 *  · sull'inizio o sulla fine libera di una clip: il blocco sta dentro la clip, attaccato al bordo;
 *  · lontano dai bordi: parte da f (le transizioni ci si centrano).
 */
export function postoBlocco(p: Project, tipo: 'effetto' | 'transizione', f: number, len: number, soglia: number, track: string, stretto = false): Posto {
  // lasciato col mouse si attacca a un bordo anche un po' lontano; messo al cursore (stretto) solo se ci sta sopra
  const raggio = stretto ? soglia : tipo === 'transizione' ? Math.max(soglia, len) : Math.max(soglia, len * 0.75);
  let best: Posto | null = null, bd = Infinity;
  const prova = (start: number, taglio: Taglio, dove: Dove, d: number) => { if (d < bd) { bd = d; best = { start: Math.max(0, Math.round(start)), taglio, dove }; } };
  for (const tg of tagliFra(p, f - raggio, f + raggio, track)) {
    const d = Math.abs(tg.f - f);
    if (tg.a && tg.b) {
      if (tipo === 'transizione' || d <= Math.max(soglia * 0.6, len * 0.3)) prova(tg.f - len / 2, tg, 'taglio', d);
      else if (f < tg.f) prova(tg.f - len, tg, 'fine', d);
      else prova(tg.f, tg, 'inizio', d);
    } else if (tg.b) {
      // l'inizio libero: vale se si è sopra la clip (o appena prima)
      if (f >= tg.f - soglia) prova(tg.f, tg, 'inizio', d + (tipo === 'transizione' ? len * 0.2 : 0));
    } else if (tg.a && f <= tg.f + soglia) prova(tg.f - len, tg, 'fine', d + (tipo === 'transizione' ? len * 0.2 : 0));
  }
  if (best) return best;
  return { start: Math.max(0, Math.round(tipo === 'transizione' ? f - len / 2 : f)), taglio: null, dove: 'libero' };
}

/** il vecchio "taglio sotto il blocco" della corsia FX a parte: guardava tutte le tracce, preferendo la più bassa */
function taglioVecchio(p: Project, bl: Clip): Taglio | null {
  const m = centro(bl);
  const video = p.tracks.filter((t) => t.kind === 'video');
  let best: Taglio | null = null, bd = Infinity;
  for (const tg of tagliFra(p, bl.start, end(bl))) {
    const dalBasso = video.length - 1 - video.findIndex((t) => t.id === tg.track);
    const d = Math.abs(tg.f - m) + (tg.a && tg.b ? 0 : bl.len * 0.3) + dalBasso * 0.01;
    if (d < bd) { bd = d; best = tg; }
  }
  return best;
}

/**
 * I progetti di prima: i blocchi della corsia FX a parte scendono sulle tracce video (le transizioni sulla traccia
 * del loro taglio, gli effetti sulla traccia più in alto che hanno sotto, così valgono ancora per tutto) e la
 * corsia sparisce; le transizioni attaccate alle clip video diventano blocchetti.
 */
export function migraBlocchi(p: Project) {
  const video = p.tracks.filter((t) => t.kind === 'video');
  const fx = new Set(p.tracks.filter((t) => t.kind === 'fx').map((t) => t.id));
  if (fx.size && video.length) {
    for (const c of p.clips) {
      if (!fx.has(c.track)) continue;
      if (c.kind !== 'fx' || !c.fxb) { c.track = ''; continue; }
      if (c.fxb.tipo === 'transizione') c.track = taglioVecchio(p, c)?.track ?? tracciaPerBlocco(p, centro(c));
      else {
        const sopra = video.find((t) => p.clips.some((x) => x.track === t.id && VISIBILI.has(x.kind) && x.start < end(c) && end(x) > c.start));
        c.track = (sopra ?? video[video.length - 1]).id;
      }
      // il suono (dalla 1.0.5): i blocchi vecchi restano muti, ma col loro suono pronto da accendere
      if (c.fxb.suono === undefined) { c.fxb.suono = suonoDi(c.fxb.tipo, c.fxb.id); c.fxb.audio = false; }
    }
    p.clips = p.clips.filter((c) => c.track !== '');
    p.tracks = p.tracks.filter((t) => t.kind !== 'fx');
  }
  const vids = new Set(p.tracks.filter((t) => t.kind === 'video').map((t) => t.id));
  for (const c of p.clips.slice()) {
    if (!vids.has(c.track) || c.kind === 'fx') continue;
    if (c.trIn) {
      const tr = c.trIn;
      posaBlocco(p, { tipo: 'transizione', id: idTransizione(tr), forza: 1, colore: tr.color, tr: { ...tr } }, c.start, tr.len, c.track);
      c.trIn = undefined;
    }
    if (c.trOut) {
      const tr = c.trOut;
      posaBlocco(p, { tipo: 'transizione', id: idTransizione(tr), forza: 1, colore: tr.color, tr: { ...tr } }, end(c) - tr.len, tr.len, c.track);
      c.trOut = undefined;
    }
  }
}
