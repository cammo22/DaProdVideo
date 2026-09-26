// I suoni dentro gli FX: ogni blocchetto (effetto o transizione) può portarsi dietro un suono — un whoosh sul cubo,
// un colpo sul lampo, un glitch sul glitch. Si accende e si spegne con un clic sull'altoparlante del blocco.
// Qui c'è solo il catalogo (nomi, durate, dove sta il "colpo"): i suoni si fanno al volo in src/media/suoni.ts,
// niente file da scaricare e niente diritti da pagare.

export interface Suono {
  id: string;
  nome: string;
  /** secondi */
  durata: number;
  /** dove sta il colpo, in secondi dall'inizio: si mette sul punto forte del blocco (il taglio, il lampo) */
  picco: number;
}

export const SUONI: Suono[] = [
  { id: 'whoosh', nome: 'Whoosh', durata: 0.9, picco: 0.45 },
  { id: 'swish', nome: 'Swish rapido', durata: 0.45, picco: 0.2 },
  { id: 'impatto', nome: 'Impatto (boom)', durata: 1.5, picco: 0.01 },
  { id: 'colpo', nome: 'Colpo secco', durata: 0.5, picco: 0.01 },
  { id: 'zap', nome: 'Zap di luce', durata: 0.7, picco: 0.02 },
  { id: 'glitch', nome: 'Glitch', durata: 0.7, picco: 0.03 },
  { id: 'scatto', nome: 'Scatto della macchina foto', durata: 0.35, picco: 0.01 },
  { id: 'riser', nome: 'Salita (riser)', durata: 2.5, picco: 2.45 },
  { id: 'discesa', nome: 'Discesa', durata: 2, picco: 0.02 },
  { id: 'nastro', nome: 'Nastro che si ferma', durata: 1, picco: 0 },
  { id: 'battito', nome: 'Battito', durata: 0.9, picco: 0.02 },
  { id: 'campanella', nome: 'Campanella', durata: 1.8, picco: 0.01 },
  { id: 'riverso', nome: 'Piatto al contrario', durata: 1.6, picco: 1.55 },
];

export const suono = (id: string | undefined) => (id ? SUONI.find((s) => s.id === id) : undefined);

/** il suono che va bene con una transizione ('mix', 'dip', 'wipe:1', 'dve:301') */
export function suonoTransizione(id: string): string | undefined {
  if (id === 'mix' || id === 'dip') return undefined;
  if (id.startsWith('wipe')) return 'swish';
  if (id === 'dve:351') return 'zap';
  if (id === 'dve:371') return 'glitch';
  if (id === 'dve:361') return 'riverso';
  if (id === 'dve:451' || id === 'dve:491') return 'zap';
  if (id === 'dve:471' || id === 'dve:521') return 'discesa';
  if (id === 'dve:481') return 'swish';
  return 'whoosh';
}
