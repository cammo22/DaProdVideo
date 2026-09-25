// Le operazioni di montaggio. Lavorano direttamente sul progetto (lo Store ne fa la copia per l'annulla).
// I nomi sono quelli della centralina: taglia, elimina, elimina e chiudi, solleva (lift), estrai (extract),
// inserisci, sovrascrivi, trim, roll, slip.
import type { Clip, Key, Project, Transition } from './tipi';
import { clipsOn, end, handles, keyValue, mediaOf, newClip, newTrack, nextTrackName, srcTimeAt, trackOf, uid, isVideoClip } from './progetto';
import { f2s } from './timecode';

/** insert = fa spazio spostando avanti il resto · overwrite = copre (solo il montaggio a tre punti) ·
 *  libero = non tocca nessun'altra clip: si ferma contro le vicine o cerca una traccia libera */
export type EditMode = 'insert' | 'overwrite' | 'libero';

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
 * Tasto 1: taglia sotto il cursore. Taglia solo le tracce accese (se ce ne sono), altrimenti tutte quelle
 * non bloccate: le altre restano intatte. Ritorna gli id dei pezzi di destra.
 */
export function splitAt(p: Project, f: number, tracce?: Set<string> | null): string[] {
  const targets = p.clips.filter((c) => c.start < f && end(c) > f && unlocked(p, c) && (!tracce?.size || tracce.has(c.track)));
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

/** la clip che viene dopo c sulla stessa traccia (per selezionarla dopo un'eliminazione) */
export function clipDopo(p: Project, track: string, f: number, esclusi?: Set<string>): Clip | undefined {
  return p.clips.filter((c) => c.track === track && c.start >= f && !esclusi?.has(c.id)).sort((a, b) => a.start - b.start)[0];
}

/**
 * Elimina lo scarto da un lato del punto f (clic destro o Q/W): la clip resta solo dall'altra parte.
 * Con il ripple il buco si chiude sulle tracce delle clip toccate.
 */
export function eliminaLato(p: Project, ids: Set<string>, f: number, lato: 'sinistra' | 'destra', ripple: boolean): number {
  let n = 0;
  for (const c of p.clips.filter((x) => ids.has(x.id) && x.start < f && end(x) > f && unlocked(p, x))) {
    const d = lato === 'sinistra' ? f - c.start : f - end(c);
    if (trimClip(p, c.id, lato === 'sinistra' ? 'in' : 'out', d, { ripple, linked: false })) n++;
  }
  return n;
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

/** c'è già una clip (fuori da except) sulla traccia fra a e b? */
export function occupato(p: Project, trackId: string, a: number, b: number, except?: Set<string>): boolean {
  return p.clips.some((c) => c.track === trackId && !except?.has(c.id) && c.start < b && end(c) > a);
}

/**
 * Una traccia del tipo giusto libera fra a e b: prima quella preferita, poi le vicine (il video sale,
 * l'audio scende), e se sono tutte piene se ne apre una nuova. Così niente viene mai coperto.
 */
export function tracciaLibera(p: Project, kind: 'video' | 'audio', preferita: string | null, a: number, b: number, except?: Set<string>, evita?: Set<string>): string {
  const list = p.tracks.filter((t) => t.kind === kind && !t.lock);
  const i0 = Math.max(0, list.findIndex((t) => t.id === preferita));
  const ordine = kind === 'video'
    ? [...list.slice(0, i0 + 1).reverse(), ...list.slice(i0 + 1)]
    : [...list.slice(i0), ...list.slice(0, i0).reverse()];
  const t = ordine.find((x) => !evita?.has(x.id) && !occupato(p, x.id, a, b, except));
  if (t) return t.id;
  const nt = newTrack(kind, nextTrackName(p, kind));
  if (kind === 'video') p.tracks.unshift(nt); else p.tracks.push(nt);
  return nt.id;
}

/**
 * Di quanto si può spostare il gruppo senza coprire nessuna clip ferma: se dove lo vuoi c'è posto va lì,
 * altrimenti si ferma attaccato alla clip più vicina (come due mattoncini che si toccano).
 */
function spostamentoLibero(moving: { c: Clip; track: string }[], df: number, fermi: Map<string, Clip[]>): number | null {
  const valido = (d: number) => moving.every(({ c, track }) => {
    if (c.start + d < 0) return false;
    const a = c.start + d, b = end(c) + d;
    return !(fermi.get(track) ?? []).some((x) => x.start < b && end(x) > a);
  });
  if (valido(df)) return df;
  const cand = new Set<number>([-Math.min(...moving.map((m) => m.c.start))]);
  for (const { c, track } of moving) for (const x of fermi.get(track) ?? []) { cand.add(end(x) - c.start); cand.add(x.start - end(c)); }
  let best: number | null = null, bd = Infinity;
  for (const d of cand) {
    const dd = Math.abs(d - df);
    if (dd < bd && valido(d)) { bd = dd; best = d; }
  }
  return best;
}

/**
 * Sposta le clip (già comprese le legate) di df fotogrammi e, per quelle del tipo trascinato, di dt tracce.
 * Libero (normale): non si mangia niente, la clip si ferma contro le vicine. Inserisci: le clip dopo il
 * punto d'arrivo scorrono avanti. Sovrascrivi resta solo per chi lo chiede apposta.
 * Ritorna lo spostamento davvero fatto.
 */
export function moveClips(p: Project, ids: Set<string>, df: number, dt: number, dragKind: 'video' | 'audio', mode: EditMode): { df: number; dt: number } {
  const moving = p.clips.filter((c) => ids.has(c.id) && unlocked(p, c));
  if (!moving.length) return { df: 0, dt: 0 };
  const minStart = Math.min(...moving.map((c) => c.start));
  if (minStart + df < 0) df = -minStart;
  const kinds = { video: p.tracks.filter((t) => t.kind === 'video'), audio: p.tracks.filter((t) => t.kind === 'audio') };
  // tracce di destinazione: le video in alto hanno indice basso, quindi dt>0 = verso il basso
  if (dt !== 0) {
    const list = kinds[dragKind];
    const idx = moving.filter((c) => trackOf(p, c.track).kind === dragKind).map((c) => list.findIndex((t) => t.id === c.track));
    if (idx.length) {
      const lo = Math.min(...idx), hi = Math.max(...idx);
      if (lo + dt < 0) dt = -lo;
      if (hi + dt > list.length - 1) dt = list.length - 1 - hi;
    }
  }
  const destinazione = (c: Clip, d: number) => {
    const t = trackOf(p, c.track);
    if (!d || t.kind !== dragKind) return c.track;
    const list = kinds[dragKind];
    const nt = list[list.findIndex((x) => x.id === c.track) + d];
    return nt && !nt.lock ? nt.id : c.track;
  };
  const moved = new Set(moving.map((c) => c.id));
  if (mode === 'libero') {
    const fermi = new Map<string, Clip[]>();
    for (const c of p.clips) if (!moved.has(c.id)) { if (!fermi.has(c.track)) fermi.set(c.track, []); fermi.get(c.track)!.push(c); }
    const prova = (d: number) => spostamentoLibero(moving.map((c) => ({ c, track: destinazione(c, d) })), df, fermi);
    let dfOk = prova(dt);
    if (dfOk === null && dt) { dt = 0; dfOk = prova(0); }
    if (dfOk === null) return { df: 0, dt: 0 };
    df = dfOk;
  }
  for (const c of moving) {
    const nt = destinazione(c, dt);
    c.start += df;
    c.track = nt;
  }
  if (mode === 'overwrite') {
    for (const c of moving) clearRange(p, c.track, c.start, end(c), moved);
  } else if (mode === 'insert') {
    const a = Math.min(...moving.map((c) => c.start));
    const b = Math.max(...moving.map((c) => end(c)));
    insertSpace(p, a, b - a, new Set(moving.map((c) => c.track)), moved);
  }
  fixTransitions(p);
  return { df, dt };
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

/**
 * Tasto S (o 4): separa o unisce. Se le clip scelte sono un gruppo solo, il gruppo si scioglie e ognuna va
 * per conto suo; se sono più gruppi o clip sciolte, diventano un gruppo solo che si muove insieme.
 */
export function toggleLink(p: Project, ids: Set<string>): 'separati' | 'uniti' | 'niente' {
  const cs = p.clips.filter((c) => ids.has(c.id));
  if (!cs.length) return 'niente';
  const links = new Set(cs.map((c) => c.link ?? '∅' + c.id));
  if (links.size === 1 && cs[0].link) {
    const l = cs[0].link;
    for (const c of p.clips) if (c.link === l) c.link = undefined;
    return 'separati';
  }
  if (cs.length < 2) return 'niente';
  const l = uid('l');
  const vecchi = new Set(cs.map((c) => c.link).filter(Boolean));
  for (const c of p.clips) if (ids.has(c.id) || (c.link && vecchi.has(c.link))) c.link = l;
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
    if (c.trOut) c.trOut.len = Math.max(1, Math.min(c.trOut.len, c.len));
    // la transizione in coda vale solo se dopo la clip non c'è niente di attaccato
    if (c.trOut && p.clips.some((x) => x.track === c.track && x.id !== c.id && x.start === end(c))) c.trOut = undefined;
  }
}

/**
 * Mette una transizione in testa alla clip (lato 'in') o in coda ('out'), e alla sua audio legata come
 * dissolvenza. Le clip non si allungano e non si accorciano: la transizione vive dentro la loro durata.
 */
export function setTransition(p: Project, ids: Set<string>, tr: Transition | null, lato: 'in' | 'out' = 'in') {
  for (const c of p.clips) {
    if (!ids.has(c.id)) continue;
    if (!tr) { if (lato === 'in') c.trIn = undefined; else c.trOut = undefined; continue; }
    const t = structuredClone(tr);
    if (!isVideoClip(c, p)) { t.type = 'mix'; }
    t.len = Math.max(1, Math.min(t.len, c.len));
    if (lato === 'in') c.trIn = t; else c.trOut = t;
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
  let tvOk = tv, taOk = ta;
  if (mode === 'insert') {
    const all = new Set(p.tracks.filter((t) => !t.lock).map((t) => t.id));
    insertSpace(p, recIn, len, all);
  } else if (mode === 'overwrite') {
    for (const t of involved) clearRange(p, t, recIn, recIn + len);
  } else {
    // libero: se la traccia è occupata si va su una libera (o se ne apre una), niente viene coperto
    if (tv) tvOk = tracciaLibera(p, 'video', tv, recIn, recIn + len);
    taOk = [];
    // due canali sulla stessa traccia no: ognuno cerca la sua
    for (const t of ta) taOk.push(tracciaLibera(p, 'audio', t, recIn, recIn + len, undefined, new Set(taOk)));
  }
  const link = tvOk && taOk.length ? uid('l') : undefined;
  const out: string[] = [];
  const base = { media: m.id, name: m.name, srcIn: src.srcIn, link };
  if (tvOk) {
    const c = newClip('media', tvOk, recIn, len, base);
    p.clips.push(c);
    out.push(c.id);
  }
  for (const t of taOk) {
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
