// La corsia FX: i blocchetti sottili in cima alla timeline. Due famiglie, stesso modo di lavorare
// (li trascini, li allunghi, li metti in fila):
//  · EFFETTI a tempo: lampo, scossa, zoom, glitch… valgono per tutto quello che sta sotto, per la durata del blocco;
//  · TRANSIZIONI: il blocco sta sopra un taglio e passa da una clip all'altra; lungo = lenta, corto = veloce.
// Qui c'è il catalogo, il calcolo di ogni fotogramma (lo stesso per il monitor e per l'export) e le regole per
// posarli: sul taglio vicino, su una corsia libera, mai sopra un altro blocco.
import type { BloccoFx, Clip, Project, Transition } from './tipi';
import { end, newClip, newTrack, nextTrackName, newTransition } from './progetto';
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

export function nuovoBlocco(tipo: 'effetto' | 'transizione', id: string): BloccoFx {
  if (tipo === 'effetto') return { tipo, id, forza: 1, colore: effettoTempo(id)?.colore ?? '#ffffff' };
  return { tipo, id, forza: 1, colore: '#000000', tr: transizioneDa(id) };
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
    const d = Math.abs(t.f - f) + (t.a && t.b ? 0 : maxDist * 0.35) + p.tracks.findIndex((x) => x.id === t.track) * 0.001;
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

/**
 * Il taglio su cui lavora un blocco transizione: quello più vicino al centro del blocco, preferendo i tagli veri
 * (fra due clip) e la traccia più in basso (il girato, non il titolo sopra). Una transizione, un taglio.
 */
export function taglioDelBlocco(p: Project, bl: Clip): Taglio | null {
  const m = (bl.start + end(bl)) / 2;
  const video = p.tracks.filter((t) => t.kind === 'video');
  let best: Taglio | null = null, bd = Infinity;
  for (const tg of tagliFra(p, bl.start, end(bl))) {
    const dalBasso = video.length - 1 - video.findIndex((t) => t.id === tg.track);
    const d = Math.abs(tg.f - m) + (tg.a && tg.b ? 0 : bl.len * 0.3) + dalBasso * 0.01;
    if (d < bd) { bd = d; best = tg; }
  }
  return best;
}

/** le transizioni dei blocchi, ognuna col suo taglio */
export function transizioniAttive(p: Project): TransizioneAttiva[] {
  const out: TransizioneAttiva[] = [];
  for (const t of p.tracks) {
    if (t.kind !== 'fx' || t.mute) continue;
    for (const bl of p.clips) {
      if (bl.track !== t.id || bl.kind !== 'fx' || bl.fxb?.tipo !== 'transizione' || !bl.fxb.tr) continue;
      const tg = taglioDelBlocco(p, bl);
      if (!tg) continue;
      // se le clip sono più corte del blocco, la transizione si stringe dentro di loro
      const s = Math.max(bl.start, tg.a ? tg.a.start : bl.start), e = Math.min(end(bl), tg.b ? end(tg.b) : end(bl));
      if (e - s < 1) continue;
      out.push({ blocco: bl, tr: { ...bl.fxb.tr, len: e - s }, track: tg.track, s, e, cut: tg.f, a: tg.a, b: tg.b });
    }
  }
  return out;
}

/** il blocco transizione ha un taglio sotto? (senza, è spento: si disegna tratteggiato) */
export const haTaglio = (p: Project, bl: Clip) => tagliFra(p, bl.start, end(bl)).length > 0;

/** il punto forte del blocco (0..1): sul taglio che ci sta sotto, se c'è; altrimenti proprio all'inizio */
export function piccoDi(p: Project, bl: Clip): number {
  const m = (bl.start + end(bl)) / 2;
  let best: number | null = null;
  for (const t of tagliFra(p, bl.start, end(bl))) if (best === null || Math.abs(t.f - m) < Math.abs(best - m)) best = t.f;
  return best === null ? 0.06 : Math.max(0, Math.min(1, (best - bl.start) / Math.max(1, bl.len)));
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

/** gli effetti a tempo accesi al fotogramma f (null = nessuno: il compositore salta il passaggio) */
export function statoEffetti(p: Project, f: number): StatoFx | null {
  let st: StatoFx | null = null;
  for (const t of p.tracks) {
    if (t.kind !== 'fx' || t.mute) continue;
    for (const c of p.clips) {
      if (c.track !== t.id || c.kind !== 'fx' || c.fxb?.tipo !== 'effetto' || f < c.start || f >= end(c)) continue;
      st ??= neutro();
      applica(st, p, c, f);
    }
  }
  return st;
}

// ——— posare i blocchi ———

/** la corsia FX libera fra a e b (la preferita, poi le altre; se sono tutte piene se ne apre una sopra) */
export function corsiaLibera(p: Project, preferita: string | null, a: number, b: number, except?: Set<string>): string {
  const list = p.tracks.filter((t) => t.kind === 'fx' && !t.lock);
  const libera = (id: string) => !p.clips.some((c) => c.track === id && !except?.has(c.id) && c.start < b && end(c) > a);
  const pref = list.find((t) => t.id === preferita);
  if (pref && libera(pref.id)) return pref.id;
  // dal basso (la più vicina alle clip) verso l'alto
  const t = [...list].reverse().find((x) => libera(x.id));
  if (t) return t.id;
  const nt = newTrack('fx', nextTrackName(p, 'fx'));
  p.tracks.unshift(nt);
  return nt.id;
}

/** se il blocco ora tocca un vicino sulla stessa corsia, passa a una corsia libera (niente si copre mai) */
export function sistemaCorsia(p: Project, c: Clip) {
  if (p.clips.some((z) => z.id !== c.id && z.track === c.track && z.start < end(c) && end(z) > c.start)) c.track = corsiaLibera(p, c.track, c.start, end(c), new Set([c.id]));
}

/** nuova durata: le transizioni restano centrate sul loro taglio, gli effetti partono dallo stesso punto */
export function durataDelBlocco(p: Project, c: Clip, len: number) {
  len = Math.max(2, Math.round(len));
  if (c.fxb?.tipo === 'transizione') c.start = Math.max(0, Math.round(c.start + c.len / 2 - len / 2));
  c.len = len;
  sistemaCorsia(p, c);
}

/** mette un blocco nella corsia FX (da start per len fotogrammi); ritorna la clip nuova */
export function posaBlocco(p: Project, b: BloccoFx, start: number, len: number, preferita: string | null = null): Clip {
  start = Math.max(0, Math.round(start));
  len = Math.max(2, Math.round(len));
  const track = corsiaLibera(p, preferita, start, start + len);
  const c = newClip('fx', track, start, len, { name: nomeBlocco(b), fxb: structuredClone(b) });
  p.clips.push(c);
  return c;
}

/**
 * Dove va un blocco lasciato al fotogramma f. Vicino a un taglio: le transizioni (e i lampi) si centrano proprio lì;
 * su un bordo libero (l'inizio o la fine di una clip senza niente attaccato) il blocco sta dentro la clip, così
 * entra o esce su quello che c'è sotto. Lontano dai tagli: parte da f.
 */
export function inizioBlocco(p: Project, tipo: 'effetto' | 'transizione', f: number, len: number, soglia: number): { start: number; taglio: Taglio | null } {
  const tg = taglioVicino(p, f, tipo === 'transizione' ? Math.max(soglia, len) : soglia);
  if (tg) {
    const start = tg.a && tg.b ? tg.f - len / 2 : tg.b ? tg.f : tg.f - len;
    return { start: Math.max(0, Math.round(start)), taglio: tg };
  }
  return { start: Math.max(0, Math.round(tipo === 'transizione' ? f - len / 2 : f)), taglio: null };
}

/** i progetti di prima: la corsia FX in cima, e le transizioni delle clip video diventano blocchetti */
export function migraBlocchi(p: Project) {
  if (!p.tracks.some((t) => t.kind === 'fx')) p.tracks.unshift(newTrack('fx', 'FX'));
  const video = new Set(p.tracks.filter((t) => t.kind === 'video').map((t) => t.id));
  for (const c of p.clips.slice()) {
    if (!video.has(c.track)) continue;
    if (c.trIn) {
      const tr = c.trIn;
      const b: BloccoFx = { tipo: 'transizione', id: idTransizione(tr), forza: 1, colore: tr.color, tr: { ...tr } };
      posaBlocco(p, b, c.start, tr.len);
      c.trIn = undefined;
    }
    if (c.trOut) {
      const tr = c.trOut;
      const b: BloccoFx = { tipo: 'transizione', id: idTransizione(tr), forza: 1, colore: tr.color, tr: { ...tr } };
      posaBlocco(p, b, end(c) - tr.len, tr.len);
      c.trOut = undefined;
    }
  }
}
