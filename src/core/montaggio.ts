// Le operazioni di montaggio. Lavorano direttamente sul progetto (lo Store ne fa la copia per l'annulla).
// I nomi sono quelli della centralina: taglia, elimina, elimina e chiudi, solleva (lift), estrai (extract),
// inserisci, sovrascrivi, trim, roll, slip.
import type { Clip, Key, Project, Transition } from './tipi';
import { clipsOn, end, handles, keyValue, mediaOf, newClip, srcTimeAt, trackOf, uid, isVideoClip } from './progetto';
import { f2s } from './timecode';

export type EditMode = 'insert' | 'overwrite';

/** divide una linea elastica al fotogramma locale cut */
function splitKeys(keys: Key[], cut: number, base: number): [Key[], Key[]] {
  if (!keys.length) return [[], []];
  const v = keyValue(keys, cut, base);
  const left = keys.filter((k) => k.f < cut).concat({ f: cut, v });
  const right = [{ f: 0, v }].concat(keys.filter((k) => k.f > cut).map((k) => ({ f: k.f - cut, v: k.v })));
  return [left, right];
}

/** taglia una clip al fotogramma f: ritorna il pezzo di destra (nuovo) o null */
export function splitClip(p: Project, c: Clip, f: number, newLink?: string): Clip | null {
  if (f <= c.start || f >= end(c)) return null;
  const lf = f - c.start;
  const right: Clip = structuredClone(c);
  right.id = uid('c');
  right.start = f;
  right.len = end(c) - f;
  right.srcIn = srcTimeAt(p, c, f);
  right.trIn = undefined;
  right.fadeIn = 0;
  right.link = newLink ?? c.link;
  [c.opKeys, right.opKeys] = splitKeys(c.opKeys, lf, c.opacity);
  [c.gainKeys, right.gainKeys] = splitKeys(c.gainKeys, lf, c.gain);
  c.len = lf;
  c.fadeOut = 0;
  if (c.trIn && c.trIn.len > c.len) c.trIn.len = c.len;
  p.clips.push(right);
  return right;
}

/** tutte le clip legate (stesso link) più quelle di partenza */
export function withLinked(p: Project, ids: Iterable<string>): Set<string> {
  const out = new Set<string>(ids);
  const links = new Set<string>();
  for (const id of out) {
    const c = p.clips.find((x) => x.id === id);
    if (c?.link) links.add(c.link);
  }
  if (links.size) for (const c of p.clips) if (c.link && links.has(c.link)) out.add(c.id);
  return out;
}

const unlocked = (p: Project, c: Clip) => !trackOf(p, c.track).lock;

/**
 * Tasto 1: taglia sotto il cursore. Se ci sono clip selezionate sotto il cursore taglia quelle (e le legate),
 * altrimenti tutte le clip attraversate dal cursore sulle tracce non bloccate.
 * Ritorna gli id dei pezzi di destra.
 */
export function splitAt(p: Project, f: number, selected: Set<string>): string[] {
  let targets = p.clips.filter((c) => c.start < f && end(c) > f && unlocked(p, c));
  const sel = targets.filter((c) => selected.has(c.id));
  if (sel.length) {
    const ids = withLinked(p, sel.map((c) => c.id));
    targets = targets.filter((c) => ids.has(c.id));
  }
  const linkMap = new Map<string, string>();
  const out: string[] = [];
  for (const c of targets) {
    let nl: string | undefined;
    if (c.link) {
      if (!linkMap.has(c.link)) linkMap.set(c.link, uid('l'));
      nl = linkMap.get(c.link);
    }
    const r = splitClip(p, c, f, nl);
    if (r) out.push(r.id);
  }
  return out;
}

/** toglie dal progetto le clip; con ripple chiude i buchi sulle stesse tracce */
export function deleteClips(p: Project, ids: Set<string>, ripple: boolean) {
  const removed = p.clips.filter((c) => ids.has(c.id) && unlocked(p, c));
  if (!removed.length) return 0;
  const gone = new Set(removed.map((c) => c.id));
  p.clips = p.clips.filter((c) => !gone.has(c.id));
  if (ripple) {
    const byTrack = new Map<string, [number, number][]>();
    for (const c of removed) {
      if (!byTrack.has(c.track)) byTrack.set(c.track, []);
      byTrack.get(c.track)!.push([c.start, end(c)]);
    }
    for (const [tid, iv] of byTrack) {
      const merged = mergeIntervals(iv);
      for (const c of p.clips) {
        if (c.track !== tid) continue;
        let shift = 0;
        for (const [a, b] of merged) {
          if (b <= c.start) shift += b - a;
        }
        // tiene conto anche dei buchi già vuoti fra gli intervalli? no: si chiude solo lo spazio delle clip tolte
        c.start -= shift;
      }
    }
  }
  return removed.length;
}

function mergeIntervals(iv: [number, number][]): [number, number][] {
  const s = iv.slice().sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const x of s) {
    const last = out[out.length - 1];
    if (last && x[0] <= last[1]) last[1] = Math.max(last[1], x[1]);
    else out.push([x[0], x[1]]);
  }
  return out;
}

/** svuota l'intervallo [a,b) di una traccia tagliando le clip ai bordi (sovrascrittura) */
export function clearRange(p: Project, trackId: string, a: number, b: number, except?: Set<string>) {
  if (b <= a) return;
  const on = p.clips.filter((c) => c.track === trackId && !(except?.has(c.id)) && c.start < b && end(c) > a);
  for (const c of on) {
    if (c.start < a) splitClip(p, c, a, c.link);
  }
  const on2 = p.clips.filter((c) => c.track === trackId && !(except?.has(c.id)) && c.start < b && end(c) > b);
  for (const c of on2) splitClip(p, c, b, c.link);
  p.clips = p.clips.filter((c) => !(c.track === trackId && !(except?.has(c.id)) && c.start >= a && end(c) <= b));
}

/** apre uno spazio di len fotogrammi al fotogramma f sulle tracce indicate (inserimento) */
export function insertSpace(p: Project, f: number, len: number, trackIds: Set<string>, except?: Set<string>) {
  for (const c of p.clips.slice()) {
    if (!trackIds.has(c.track) || except?.has(c.id)) continue;
    if (c.start < f && end(c) > f) splitClip(p, c, f, c.link);
  }
  for (const c of p.clips) {
    if (!trackIds.has(c.track) || except?.has(c.id)) continue;
    if (c.start >= f) c.start += len;
  }
}

/** Solleva (lift): toglie [a,b) dalle tracce lasciando il buco */
export function lift(p: Project, a: number, b: number) {
  for (const t of p.tracks) if (!t.lock) clearRange(p, t.id, a, b);
}

/** Estrai (extract): toglie [a,b) da tutte le tracce e chiude il buco, tutto resta a sincrono */
export function extract(p: Project, a: number, b: number) {
  lift(p, a, b);
  for (const c of p.clips) if (!trackOf(p, c.track).lock && c.start >= b) c.start -= b - a;
}

/**
 * Sposta le clip (già comprese le legate) di df fotogrammi e, per quelle del tipo trascinato, di dt tracce.
 * Sovrascrivi: le clip sotto vengono tagliate. Inserisci: le clip dopo il punto d'arrivo scorrono avanti.
 */
export function moveClips(p: Project, ids: Set<string>, df: number, dt: number, dragKind: 'video' | 'audio', mode: EditMode) {
  const moving = p.clips.filter((c) => ids.has(c.id) && unlocked(p, c));
  if (!moving.length) return;
  const minStart = Math.min(...moving.map((c) => c.start));
  if (minStart + df < 0) df = -minStart;
  const kinds = { video: p.tracks.filter((t) => t.kind === 'video'), audio: p.tracks.filter((t) => t.kind === 'audio') };
  // tracce di destinazione: le video in alto hanno indice basso, quindi dt>0 = verso il basso
  if (dt !== 0) {
    const list = kinds[dragKind];
    const idx = moving.filter((c) => trackOf(p, c.track).kind === dragKind).map((c) => list.findIndex((t) => t.id === c.track));
    const lo = Math.min(...idx), hi = Math.max(...idx);
    if (lo + dt < 0) dt = -lo;
    if (hi + dt > list.length - 1) dt = list.length - 1 - hi;
  }
  for (const c of moving) {
    c.start += df;
    const t = trackOf(p, c.track);
    if (dt && t.kind === dragKind) {
      const list = kinds[dragKind];
      const nt = list[list.findIndex((x) => x.id === c.track) + dt];
      if (nt && !nt.lock) c.track = nt.id;
    }
  }
  const moved = new Set(moving.map((c) => c.id));
  if (mode === 'overwrite') {
    for (const c of moving) clearRange(p, c.track, c.start, end(c), moved);
  } else {
    const a = Math.min(...moving.map((c) => c.start));
    const b = Math.max(...moving.map((c) => end(c)));
    insertSpace(p, a, b - a, new Set(moving.map((c) => c.track)), moved);
  }
  fixTransitions(p);
}

export interface TrimOpts { ripple: boolean; linked: boolean }

/** limiti di un trim: quanto si può muovere il bordo prima di finire le maniglie o urtare le vicine */
function trimLimits(p: Project, c: Clip, edge: 'in' | 'out', ripple: boolean): [number, number] {
  const h = handles(p, c);
  const neigh = clipsOn(p, c.track);
  if (edge === 'in') {
    const prev = neigh.filter((x) => end(x) <= c.start && x.id !== c.id).pop();
    const minD = ripple ? -h.head : Math.max(-h.head, (prev ? end(prev) : 0) - c.start);
    return [minD, c.len - 1];
  }
  const next = neigh.find((x) => x.start >= end(c) && x.id !== c.id);
  const maxD = ripple ? h.tail : Math.min(h.tail, (next ? next.start : Infinity) - end(c));
  return [1 - c.len, maxD];
}

/** trim di un bordo: ritorna lo spostamento davvero applicato */
export function trimClip(p: Project, id: string, edge: 'in' | 'out', d: number, o: TrimOpts): number {
  const c = p.clips.find((x) => x.id === id);
  if (!c || !unlocked(p, c)) return 0;
  const group = o.linked && c.link
    ? p.clips.filter((x) => x.link === c.link && (edge === 'in' ? x.start === c.start : end(x) === end(c)) && unlocked(p, x))
    : [c];
  let lo = -Infinity, hi = Infinity;
  for (const g of group) {
    const [a, b] = trimLimits(p, g, edge, o.ripple);
    lo = Math.max(lo, a);
    hi = Math.min(hi, b);
  }
  d = Math.max(lo, Math.min(hi, d));
  if (!d) return 0;
  for (const g of group) {
    const oldEnd = end(g);
    if (edge === 'in') {
      g.srcIn = Math.max(0, g.srcIn + f2s(d, p.rate) * g.speed);
      g.len -= d;
      if (!o.ripple) g.start += d;
      g.opKeys = g.opKeys.map((k) => ({ f: k.f - d, v: k.v }));
      g.gainKeys = g.gainKeys.map((k) => ({ f: k.f - d, v: k.v }));
      if (o.ripple) for (const x of p.clips) if (x.track === g.track && x.id !== g.id && x.start >= oldEnd && !group.includes(x)) x.start -= d;
    } else {
      g.len += d;
      if (o.ripple) for (const x of p.clips) if (x.track === g.track && x.id !== g.id && x.start >= oldEnd && !group.includes(x)) x.start += d;
    }
    if (g.trIn && g.trIn.len > g.len) g.trIn.len = g.len;
    g.fadeIn = Math.min(g.fadeIn, g.len);
    g.fadeOut = Math.min(g.fadeOut, g.len);
  }
  fixTransitions(p);
  return d;
}

/** roll: sposta il punto di taglio fra due clip vicine senza cambiare la durata totale */
export function rollEdit(p: Project, leftId: string, rightId: string, d: number): number {
  const L = p.clips.find((c) => c.id === leftId), R = p.clips.find((c) => c.id === rightId);
  if (!L || !R || end(L) !== R.start) return 0;
  const hl = handles(p, L), hr = handles(p, R);
  d = Math.max(-(L.len - 1), -hr.head, Math.min(R.len - 1, hl.tail, d));
  if (!d) return 0;
  L.len += d;
  R.start += d;
  R.len -= d;
  R.srcIn = Math.max(0, R.srcIn + f2s(d, p.rate) * R.speed);
  R.opKeys = R.opKeys.map((k) => ({ f: k.f - d, v: k.v }));
  R.gainKeys = R.gainKeys.map((k) => ({ f: k.f - d, v: k.v }));
  return d;
}

/** slip: cambia la parte di sorgente mostrata senza muovere la clip */
export function slipClip(p: Project, ids: Set<string>, d: number) {
  for (const c of p.clips) {
    if (!ids.has(c.id) || !c.media) continue;
    const h = handles(p, c);
    const dd = Math.max(-h.head, Math.min(h.tail, d));
    c.srcIn = Math.max(mediaOf(p, c)?.t0 ?? 0, c.srcIn + f2s(dd, p.rate) * c.speed);
  }
}

/** separa (o riunisce) video e audio */
export function toggleLink(p: Project, ids: Set<string>): 'separati' | 'uniti' {
  const cs = p.clips.filter((c) => ids.has(c.id));
  if (cs.some((c) => c.link)) {
    const links = new Set(cs.map((c) => c.link).filter(Boolean));
    for (const c of p.clips) if (c.link && links.has(c.link)) c.link = undefined;
    return 'separati';
  }
  const l = uid('l');
  for (const c of cs) c.link = l;
  return 'uniti';
}

/** clip immediatamente prima (attaccata) sulla stessa traccia */
export function prevAdjacent(p: Project, c: Clip): Clip | undefined {
  return p.clips.find((x) => x.track === c.track && x.id !== c.id && end(x) === c.start);
}

/** tiene le transizioni dentro la durata delle clip */
export function fixTransitions(p: Project) {
  for (const c of p.clips) {
    if (c.trIn) c.trIn.len = Math.max(1, Math.min(c.trIn.len, c.len));
  }
}

/** mette una transizione in testa alla clip (e alla sua audio legata come dissolvenza incrociata) */
export function setTransition(p: Project, ids: Set<string>, tr: Transition | null) {
  for (const c of p.clips) {
    if (!ids.has(c.id)) continue;
    if (!tr) { c.trIn = undefined; continue; }
    const t = structuredClone(tr);
    if (!isVideoClip(c)) { t.type = 'mix'; }
    t.len = Math.max(1, Math.min(t.len, c.len));
    c.trIn = t;
  }
}

export interface SourceRange { mediaId: string; srcIn: number; srcOut: number }
export interface Targets { video: string | null; audio: string[] }

/**
 * Montaggio a tre punti dal Player alla timeline (i tasti [ e ] di EDIUS, l'EDIT della centralina).
 * recIn obbligatorio; se c'è recOut la durata viene da lì, altrimenti dalla sorgente.
 */
export function placeSource(p: Project, src: SourceRange, recIn: number, recOut: number | null, tg: Targets, mode: EditMode): string[] {
  const m = p.media.find((x) => x.id === src.mediaId);
  if (!m) return [];
  const r = p.rate.num / p.rate.den;
  let len = Math.max(1, Math.round((src.srcOut - src.srcIn) * r));
  if (recOut !== null && recOut > recIn) len = recOut - recIn;
  if (m.type === 'image' && recOut === null) len = Math.max(1, Math.round((src.srcOut - src.srcIn) * r));
  const tv = m.hasVideo && tg.video ? tg.video : null;
  const ta = m.hasAudio ? tg.audio.slice(0, m.channels > 2 ? 2 : 1) : [];
  if (!tv && !ta.length) return [];
  const involved = new Set<string>([...(tv ? [tv] : []), ...ta]);
  if (mode === 'insert') {
    const all = new Set(p.tracks.filter((t) => !t.lock).map((t) => t.id));
    insertSpace(p, recIn, len, all);
  } else {
    for (const t of involved) clearRange(p, t, recIn, recIn + len);
  }
  const link = tv && ta.length ? uid('l') : undefined;
  const out: string[] = [];
  const base = { media: m.id, name: m.name, srcIn: src.srcIn, link };
  if (tv) {
    const c = newClip('media', tv, recIn, len, base);
    p.clips.push(c);
    out.push(c.id);
  }
  for (const t of ta) {
    const c = newClip('media', t, recIn, len, base);
    p.clips.push(c);
    out.push(c.id);
  }
  return out;
}

/** punti a cui agganciarsi (snap): inizi e fini delle clip, cursore, marcatori, attacco/stacco */
export function snapPoints(p: Project, exclude: Set<string>, extra: number[]): number[] {
  const s = new Set<number>(extra);
  s.add(0);
  for (const c of p.clips) {
    if (exclude.has(c.id)) continue;
    s.add(c.start);
    s.add(end(c));
  }
  for (const m of p.markers) s.add(m.f);
  if (p.inF !== null) s.add(p.inF);
  if (p.outF !== null) s.add(p.outF);
  return [...s].sort((a, b) => a - b);
}

/** punti di montaggio (per saltare con su/giù, A/S, PagSu/PagGiù) */
export function editPoints(p: Project): number[] {
  const s = new Set<number>([0]);
  for (const c of p.clips) {
    if (trackOf(p, c.track).mute && trackOf(p, c.track).kind === 'audio') continue;
    s.add(c.start);
    s.add(end(c));
  }
  return [...s].sort((a, b) => a - b);
}

/** la clip video più in alto sotto il cursore (per "match frame" e per il tasto 2 senza selezione) */
export function topClipAt(p: Project, f: number, kind: 'video' | 'audio' | 'any' = 'any'): Clip | undefined {
  for (const t of p.tracks) {
    if (kind !== 'any' && t.kind !== kind) continue;
    if (t.lock) continue;
    const c = p.clips.find((x) => x.track === t.id && x.start <= f && end(x) > f);
    if (c) return c;
  }
  return undefined;
}

export function mediaDurationFrames(p: Project, mediaId: string): number {
  const m = p.media.find((x) => x.id === mediaId);
  if (!m) return 0;
  return Math.round(m.duration * p.rate.num / p.rate.den);
}

export { mediaOf };
