// "Attacca all'oggetto" (1.4.0): dopo il tracking, un clic mette sopra la ripresa qualcosa che segue l'oggetto.
//  · i disegni (cerchio, freccia, etichetta, mirino, emoji, riquadro) e le scritte: una clip su una traccia sopra, con
//    c.segue = la ripresa tracciata (il centro del quadro va sull'oggetto, tf è lo scarto);
//  · gli effetti col centro (censura, faretto, lente, raggi, zoom): un blocchetto FX sulla traccia della ripresa, con
//    fxb.segue = la ripresa (il centro dell'effetto va sull'oggetto).
// Tutto dura quanto la ripresa, si sposta e si cambia come ogni clip.
import { store } from '../core/store';
import type { Clip, Project } from '../core/tipi';
import { clipById, end, newClip, TITLE0 } from '../core/progetto';
import { nuovaAnim, animazione } from '../core/animazioni';
import { nuovoBlocco, posaBlocco } from '../core/blocchi';
import * as M from '../core/montaggio';

export interface Attacco {
  id: string;
  nome: string;
  icona: string;
  info: string;
  /** anim = un'animazione del catalogo · fx = un effetto a tempo col centro · testo = un titolo */
  tipo: 'anim' | 'fx' | 'testo';
  /** l'animazione o l'effetto */
  quale: string;
  /** la forza dell'effetto (per censura e faretto = la grandezza del cerchio) */
  forza?: number;
  /** spostamento rispetto all'oggetto, in frazioni del quadro (y in basso) */
  dy?: number;
}

export const ATTACCHI: Attacco[] = [
  { id: 'testo', nome: 'Scritta', icona: '💬', info: 'una scritta sopra l\'oggetto che lo segue', tipo: 'testo', quale: '', dy: -0.16 },
  { id: 'cerchio', nome: 'Cerchio', icona: '⭕', info: 'un cerchio che si disegna attorno e pulsa', tipo: 'anim', quale: 'ob-cerchio' },
  { id: 'freccia', nome: 'Freccia', icona: '➡️', info: 'una freccia che indica l\'oggetto, col testo', tipo: 'anim', quale: 'ob-freccia' },
  { id: 'etichetta', nome: 'Etichetta', icona: '🏷', info: 'un punto, una linea e il nome', tipo: 'anim', quale: 'ob-etichetta' },
  { id: 'mirino', nome: 'Mirino', icona: '🎯', info: 'quattro angoli che agganciano l\'oggetto', tipo: 'anim', quale: 'ob-aggancio' },
  { id: 'emoji', nome: 'Emoji', icona: '😂', info: 'un\'emoji grande che rimbalza', tipo: 'anim', quale: 'ob-emoji', dy: -0.12 },
  { id: 'riquadro', nome: 'Riquadro', icona: '🔲', info: 'un riquadro con l\'etichetta', tipo: 'anim', quale: 'ob-riquadro' },
  { id: 'censuraPixel', nome: 'Censura a quadretti', icona: '🟫', info: 'nasconde una faccia o una targa coi quadrettoni', tipo: 'fx', quale: 'censuraPixel', forza: 0.45 },
  { id: 'censuraSfoca', nome: 'Censura sfocata', icona: '🌫', info: 'nasconde con una macchia sfocata', tipo: 'fx', quale: 'censuraSfoca', forza: 0.45 },
  { id: 'faretto', nome: 'Faretto', icona: '🔦', info: 'tutto buio tranne l\'oggetto', tipo: 'fx', quale: 'faretto', forza: 0.35 },
  { id: 'lente', nome: 'Lente', icona: '🔍', info: 'l\'oggetto si gonfia come sotto una lente', tipo: 'fx', quale: 'bolla', forza: 0.8 },
  { id: 'zoom', nome: 'Zoom sull\'oggetto', icona: '🎥', info: 'la camera si avvicina all\'oggetto piano piano', tipo: 'fx', quale: 'zoomLento', forza: 1 },
  { id: 'raggi', nome: 'Raggi di luce', icona: '✨', info: 'raggi di luce che escono dall\'oggetto', tipo: 'fx', quale: 'raggi', forza: 0.8 },
];

/** la traccia video libera sopra la ripresa (o una nuova in cima) */
function tracciaSopra(pp: Project, sorg: Clip, a: number, b: number): string {
  const video = pp.tracks.filter((t) => t.kind === 'video');
  const i = video.findIndex((t) => t.id === sorg.track);
  // le tracce video stanno dall'alto in basso: "sopra" = indice più piccolo
  const sopra = i > 0 ? video[i - 1].id : null;
  const tid = M.tracciaLibera(pp, 'video', sopra ?? sorg.track, a, b, undefined, new Set([sorg.track]));
  return tid;
}

/** attacca una cosa all'oggetto tracciato sulla clip sorgId; ritorna l'id della clip (o del blocco) nuovo */
export function attacca(sorgId: string, a: Attacco): string | null {
  const s0 = clipById(store.doc, sorgId);
  if (!s0?.traccia) return null;
  const ids = store.edit('Attacca: ' + a.nome, (pp) => {
    const s = clipById(pp, sorgId)!;
    const f0 = s.start, len = s.len;
    if (a.tipo === 'fx') {
      const b = nuovoBlocco('effetto', a.quale);
      b.forza = a.forza ?? 1;
      b.pos = [0.5, 0.5 + (a.dy ?? 0)];
      b.segue = sorgId;
      const c = posaBlocco(pp, b, f0, len, s.track);
      return [c.id];
    }
    const tid = tracciaSopra(pp, s, f0, end(s));
    let c: Clip;
    if (a.tipo === 'anim') {
      c = newClip('title', tid, f0, len, { name: (animazione(a.quale)?.nome ?? a.nome) + ' · ' + s.name, gen: { anim: nuovaAnim(a.quale) } });
    } else {
      c = newClip('title', tid, f0, len, { name: 'Scritta · ' + s.name, gen: { title: { ...TITLE0, text: 'Scrivi qui', size: 64, box: true, boxColor: '#000000aa', shadow: true } } });
    }
    c.segue = sorgId;
    c.tf.y = Math.round((a.dy ?? 0) * pp.h);
    pp.clips.push(c);
    return [c.id];
  });
  if (ids?.length) store.select(ids);
  return ids?.[0] ?? null;
}

/** le cose già attaccate a una ripresa (clip che la seguono e blocchi FX col centro su di lei) */
export function attaccatiA(p: Project, sorgId: string): Clip[] {
  return p.clips.filter((c) => c.segue === sorgId || c.fxb?.segue === sorgId);
}
