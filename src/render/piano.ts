// Il "piano" di un fotogramma: quali clip si vedono, in che ordine, con che trasparenza e con quale
// transizione. Lo usano sia i monitor sia l'export, così quello che vedi è quello che esce.
import type { Clip, Project, Transition } from '../core/tipi';
import { clipOpacity, end, mediaOf, srcTimeAt } from '../core/progetto';
import { prevAdjacent } from '../core/montaggio';
import { f2s } from '../core/timecode';

export interface Sorgente {
  clip: Clip;
  /** tempo nella sorgente (secondi) */
  t: number;
  /** tempo locale dall'inizio della clip (secondi): per titoli e countdown */
  local: number;
  /** fotogramma locale */
  lf: number;
}

export interface Strato {
  trackId: string;
  a: Sorgente | null;
  b: Sorgente;
  tr: Transition | null;
  /** avanzamento della transizione 0..1 */
  prog: number;
  opacity: number;
}

const VISIBILI = new Set(['media', 'color', 'bars', 'countdown', 'title']);

function sorgente(p: Project, c: Clip, f: number): Sorgente {
  let t = srcTimeAt(p, c, f);
  const m = mediaOf(p, c);
  if (m && m.duration > 0) t = Math.max(m.t0 || 0, Math.min(t, m.duration - 1e-3));
  return { clip: c, t, local: f2s(f - c.start, p.rate), lf: f - c.start };
}

/** strati video al fotogramma f, dal basso (V1) verso l'alto */
export function pianoVideo(p: Project, f: number): Strato[] {
  const out: Strato[] = [];
  const vt = p.tracks.filter((t) => t.kind === 'video');
  for (let i = vt.length - 1; i >= 0; i--) {
    const t = vt[i];
    if (t.mute || t.opacity <= 0) continue;
    const c = p.clips.find((x) => x.track === t.id && x.start <= f && end(x) > f && VISIBILI.has(x.kind));
    if (!c) continue;
    const opacity = clipOpacity(c, f) * t.opacity;
    let a: Sorgente | null = null, tr: Transition | null = null, prog = 1;
    if (c.trIn && f < c.start + c.trIn.len) {
      tr = c.trIn;
      prog = (f - c.start + 0.5) / c.trIn.len;
      const prev = prevAdjacent(p, c);
      if (prev && VISIBILI.has(prev.kind)) a = sorgente(p, prev, f);
    }
    if (opacity <= 0 && !tr) continue;
    out.push({ trackId: t.id, a, b: sorgente(p, c, f), tr, prog, opacity });
  }
  return out;
}

/** clip video che partono entro "anticipo" fotogrammi (per scaldare i decoder prima del taglio) */
export function inArrivo(p: Project, f: number, anticipo: number): Sorgente[] {
  const out: Sorgente[] = [];
  for (const c of p.clips) {
    if (c.kind !== 'media' || !c.media) continue;
    if (c.start > f && c.start <= f + anticipo) out.push(sorgente(p, c, c.start));
  }
  return out;
}
