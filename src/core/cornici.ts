// Le cornici pronte di una clip: la bolla della webcam in un angolo e lo stile presentazione (lo schermo
// registrato un po' più piccolo, con gli angoli tondi e l'ombra, sopra uno sfondo sfumato). Sono solo
// numeri del Transform (src/core/tipi.ts): il compositore li disegna uguali nel monitor e nell'export.
import type { Clip, MediaItem, Project, Transform } from './tipi';
import { TF0 } from './progetto';

export type Angolo = 'bd' | 'bs' | 'ad' | 'as';
export const ANGOLI: [Angolo, string][] = [['bd', '↘'], ['bs', '↙'], ['ad', '↗'], ['as', '↖']];

/** quanto è grande la sorgente adattata al quadro (come fa il compositore) */
function adattata(p: Project, m: Pick<MediaItem, 'width' | 'height' | 'rotation'> | undefined): [number, number] {
  if (!m?.width || !m.height) return [p.w, p.h];
  const w = m.rotation % 180 ? m.height : m.width, h = m.rotation % 180 ? m.width : m.height;
  const k = Math.min(p.w / w, p.h / h);
  return [w * k, h * k];
}

/**
 * La bolla: ritaglio quadrato al centro, tutto tondo, con l'ombra, in un angolo. `grande` è il diametro
 * in parti dell'altezza del quadro; `tonda` false = un riquadro con gli angoli appena tondi.
 */
export function bolla(p: Project, m: Pick<MediaItem, 'width' | 'height' | 'rotation'> | undefined, angolo: Angolo = 'bd', grande = 0.3, tonda = true): Transform {
  const [dw, dh] = adattata(p, m);
  const tf: Transform = { ...TF0, ombra: 0.8 };
  let lato: number;
  if (tonda) {
    // quadrato al centro: si taglia il lato lungo
    const cx = dw > dh ? (1 - dh / dw) / 2 : 0, cy = dh > dw ? (1 - dw / dh) / 2 : 0;
    tf.cropL = tf.cropR = cx;
    tf.cropT = tf.cropB = cy;
    lato = Math.min(dw, dh);
    tf.angoli = 1;
  } else {
    lato = dh;
    tf.angoli = 0.12;
  }
  const d = grande * p.h;
  tf.scale = d / lato;
  const vw = (tonda ? d : dw * tf.scale), vh = d;
  const margine = p.h * 0.045;
  const destra = angolo === 'bd' || angolo === 'ad', basso = angolo === 'bd' || angolo === 'bs';
  tf.x = (destra ? 1 : -1) * (p.w / 2 - margine - vw / 2);
  tf.y = (basso ? 1 : -1) * (p.h / 2 - margine - vh / 2);
  return tf;
}

/** lo stile presentazione: lo schermo un po' più piccolo, angoli tondi, ombra (lo sfondo è una clip sotto) */
export const presentazione = (): Transform => ({ ...TF0, scale: 0.86, angoli: 0.06, ombra: 0.9 });

/** gli sfondi dello stile presentazione: due colori che sfumano */
export const SFONDI: { id: string; nome: string; a: string; b: string }[] = [
  { id: 'notte', nome: 'Notte', a: '#2e4478', b: '#0e1120' },
  { id: 'tramonto', nome: 'Tramonto', a: '#ff9a5a', b: '#7a2a8c' },
  { id: 'mare', nome: 'Mare', a: '#35d0c6', b: '#1b4f9c' },
  { id: 'prato', nome: 'Prato', a: '#b6e36a', b: '#1f7a5a' },
  { id: 'carta', nome: 'Carta', a: '#f4efe6', b: '#cfc6b5' },
  { id: 'daprod', nome: 'DaProd', a: '#ffcf3a', b: '#e0532b' },
];

/** i movimenti pronti: partono dalla posizione che la clip ha adesso (che diventa l'arrivo, o la partenza) */
export const MOVIMENTI: { id: string; nome: string }[] = [
  { id: 'fermo', nome: 'Fermo' },
  { id: 'daSinistra', nome: 'Entra da sinistra' },
  { id: 'daDestra', nome: 'Entra da destra' },
  { id: 'dalBasso', nome: 'Sale dal basso' },
  { id: 'dallAlto', nome: 'Scende dall\'alto' },
  { id: 'avvicina', nome: 'Si avvicina' },
  { id: 'allontana', nome: 'Si allontana' },
  { id: 'scivola', nome: 'Scivola (Ken Burns)' },
  { id: 'gira', nome: 'Gira e arriva' },
];

export function movimentoPronto(p: Project, c: Clip, id: string) {
  const base = structuredClone(c.tfFine && id !== 'fermo' ? c.tfFine : c.tf);
  const con = (d: Partial<Transform>): Transform => ({ ...base, ...d });
  switch (id) {
    case 'fermo': delete c.tfFine; return;
    case 'daSinistra': c.tf = con({ x: base.x - p.w }); c.tfFine = base; break;
    case 'daDestra': c.tf = con({ x: base.x + p.w }); c.tfFine = base; break;
    case 'dalBasso': c.tf = con({ y: base.y + p.h }); c.tfFine = base; break;
    case 'dallAlto': c.tf = con({ y: base.y - p.h }); c.tfFine = base; break;
    case 'avvicina': c.tf = base; c.tfFine = con({ scale: base.scale * 1.25 }); break;
    case 'allontana': c.tf = con({ scale: base.scale * 1.25 }); c.tfFine = base; break;
    case 'scivola': c.tf = con({ scale: base.scale * 1.12, x: base.x - p.w * 0.05 }); c.tfFine = con({ scale: base.scale * 1.12, x: base.x + p.w * 0.05 }); break;
    case 'gira': c.tf = con({ scale: base.scale * 0.2, rot: base.rot - 180 }); c.tfFine = base; break;
  }
}
