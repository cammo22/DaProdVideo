// Seguire un oggetto: una ripresa ha i suoi punti tracciati (dove stava l'oggetto in ogni istante, src/media/traccia.ts
// li trova) e altre clip, o il centro di un effetto, possono seguirlo. Qui c'è solo il conto: da un istante della
// sorgente al punto sul quadro del progetto, con la stessa geometria del compositore (adattamento, zoom, rotazione).
import type { Clip, Project, Traccia } from './tipi';
import { mediaOf, srcTimeAt, tfAl } from './progetto';

/** dove sta l'oggetto nell'immagine della sorgente (frazioni 0..1 dall'angolo in alto a sinistra) a quell'istante */
export function puntoAl(tr: Traccia, t: number): { x: number; y: number } | null {
  const pt = tr.punti;
  if (!pt.length) return null;
  if (t <= pt[0].t) return { x: pt[0].x, y: pt[0].y };
  const u = pt[pt.length - 1];
  if (t >= u.t) return { x: u.x, y: u.y };
  let a = 0, b = pt.length - 1;
  while (b - a > 1) { const m = (a + b) >> 1; if (pt[m].t <= t) a = m; else b = m; }
  const k = (t - pt[a].t) / Math.max(1e-9, pt[b].t - pt[a].t);
  return { x: pt[a].x + (pt[b].x - pt[a].x) * k, y: pt[a].y + (pt[b].y - pt[a].y) * k };
}

/** quanto è grande, sul quadro, la sorgente adattata (come fa il compositore) */
export function adattata(p: Project, c: Clip): { dw: number; dh: number } | null {
  const m = mediaOf(p, c);
  if (!m?.width || !m.height) return null;
  const w = m.rotation % 180 ? m.height : m.width, h = m.rotation % 180 ? m.width : m.height;
  const k = Math.min(p.w / w, p.h / h);
  return { dw: w * k, dh: h * k };
}

/** spostamento dal centro del quadro, in pixel del progetto, di un punto (u, v) dell'immagine della clip al fotogramma f
 *  (senza lo spostamento che la clip prende seguendo un altro oggetto) */
export function sulQuadro(p: Project, c: Clip, u: number, v: number, f: number): [number, number] | null {
  const a = adattata(p, c);
  if (!a) return null;
  const tf = tfAl(c, f - c.start);
  const lx = (u - 0.5) * a.dw * tf.scale * (tf.sx ?? 1), ly = (v - 0.5) * a.dh * tf.scale;
  const r = (tf.rot * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r);
  return [tf.x + co * lx - si * ly, tf.y + si * lx + co * ly];
}

/** dove sta l'oggetto seguito sul quadro al fotogramma f, come spostamento dal centro (pixel del progetto) */
export function oggettoSulQuadro(p: Project, sorg: Clip, f: number): [number, number] | null {
  if (!sorg.traccia) return null;
  const q = puntoAl(sorg.traccia, srcTimeAt(p, sorg, Math.max(sorg.start, Math.min(sorg.start + sorg.len - 1, f))));
  return q ? sulQuadro(p, sorg, q.x, q.y, f) : null;
}

/** lo spostamento in più (pixel del progetto) di una clip che segue un oggetto e/o si tiene ferma sul suo */
export function spostaTraccia(p: Project, c: Clip, f: number): { dx: number; dy: number } {
  let dx = 0, dy = 0;
  if (c.segue) {
    const sorg = p.clips.find((x) => x.id === c.segue);
    const o = sorg && oggettoSulQuadro(p, sorg, f);
    if (o) { dx += o[0]; dy += o[1]; }
  }
  if (c.stabilizza && c.traccia && c.traccia.punti.length) {
    // la ripresa si sposta al contrario di quanto si muove l'oggetto: nel punto segnato all'inizio resta sempre lo stesso
    const a = adattata(p, c);
    const q = puntoAl(c.traccia, srcTimeAt(p, c, Math.max(c.start, Math.min(c.start + c.len - 1, f))));
    const q0 = puntoAl(c.traccia, c.traccia.da);
    if (a && q && q0) {
      const tf = tfAl(c, f - c.start);
      const lx = (q.x - q0.x) * a.dw * tf.scale * (tf.sx ?? 1), ly = (q.y - q0.y) * a.dh * tf.scale;
      const r = (tf.rot * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r);
      dx -= co * lx - si * ly;
      dy -= si * lx + co * ly;
    }
  }
  return { dx, dy };
}

/** quali clip si possono seguire: le riprese video che hanno dei punti tracciati */
export const tracciate = (p: Project) => p.clips.filter((c) => c.kind === 'media' && !!c.traccia && c.traccia.punti.length > 1);

/** mette in ordine i punti (per tempo) e leviga il tremolio del seguito con una media mobile corta */
export function levigaPunti(pt: Traccia['punti']): Traccia['punti'] {
  const o = pt.slice().sort((a, b) => a.t - b.t);
  return o.map((q, i) => {
    const a = o[Math.max(0, i - 1)], b = o[Math.min(o.length - 1, i + 1)];
    return { t: q.t, x: (a.x + 2 * q.x + b.x) / 4, y: (a.y + 2 * q.y + b.y) / 4 };
  });
}

/** il contrario di sulQuadro: da un punto del quadro (pixel del progetto, dall'angolo in alto a sinistra) al punto
 *  dell'immagine della clip (frazioni 0..1); null se la clip non ha un'immagine */
export function immagineDa(p: Project, c: Clip, f: number, X: number, Y: number): { x: number; y: number } | null {
  const a = adattata(p, c);
  if (!a) return null;
  const tf = tfAl(c, f - c.start);
  const seg = spostaTraccia(p, c, f);
  const dx = X - (p.w / 2 + tf.x + seg.dx), dy = Y - (p.h / 2 + tf.y + seg.dy);
  const r = (tf.rot * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r);
  const lx = co * dx + si * dy, ly = -si * dx + co * dy;
  return { x: lx / Math.max(1e-6, a.dw * tf.scale * (tf.sx ?? 1)) + 0.5, y: ly / Math.max(1e-6, a.dh * tf.scale) + 0.5 };
}
