// Più timeline nello stesso progetto (le "sequenze"): una per la versione lunga, una per il trailer, una per il
// verticale dei social… I media del contenitore sono di tutte; ogni timeline ha le sue tracce, clip, marcatori,
// attacco/stacco e sottotitoli. Quella aperta vive nei campi del progetto (così monitor, export, EDL e tutto il resto
// lavorano come sempre), le altre aspettano in p.sequenze. Si passa dall'una all'altra con le schede sopra la timeline.
import type { Project, Sequenza } from './tipi';
import { newTrack, uid } from './progetto';

/** le timeline del progetto (un progetto vecchio ne ha una sola, "Montaggio 1") */
export function sequenzeDi(p: Project): Sequenza[] {
  if (!p.sequenze?.length) return [{ id: p.seqAttiva ?? 'seq1', nome: 'Montaggio 1' }];
  return p.sequenze;
}

export const attivaDi = (p: Project) => p.seqAttiva ?? sequenzeDi(p)[0].id;

/** prepara l'elenco (serve la prima volta che si apre una seconda timeline) */
function prepara(p: Project) {
  if (!p.sequenze?.length) { p.sequenze = [{ id: 'seq1', nome: 'Montaggio 1' }]; p.seqAttiva = 'seq1'; }
  p.seqAttiva ??= p.sequenze[0].id;
}

/** mette via la timeline aperta nella sua scheda */
function metteVia(p: Project) {
  const s = p.sequenze!.find((x) => x.id === p.seqAttiva)!;
  s.tracks = p.tracks; s.clips = p.clips; s.markers = p.markers; s.inF = p.inF; s.outF = p.outF; s.sottotitoli = p.sottotitoli;
}

/** apre la timeline id (quella di prima resta com'era nella sua scheda) */
export function passaA(p: Project, id: string): boolean {
  prepara(p);
  if (id === p.seqAttiva) return false;
  const s = p.sequenze!.find((x) => x.id === id);
  if (!s) return false;
  metteVia(p);
  p.tracks = s.tracks ?? [newTrack('video', 'V2'), newTrack('video', 'V1'), newTrack('audio', 'A1'), newTrack('audio', 'A2')];
  p.clips = s.clips ?? []; p.markers = s.markers ?? []; p.inF = s.inF ?? null; p.outF = s.outF ?? null; p.sottotitoli = s.sottotitoli;
  // nella scheda aperta i dati non servono: stanno nel progetto
  delete s.tracks; delete s.clips; delete s.markers; delete s.inF; delete s.outF; delete s.sottotitoli;
  p.seqAttiva = id;
  return true;
}

/** una timeline nuova (vuota, o copia di quella aperta) e la apre */
export function nuovaSequenza(p: Project, copia = false, nome?: string): string {
  prepara(p);
  const n = p.sequenze!.length + 1;
  const orig = p.sequenze!.find((x) => x.id === p.seqAttiva);
  const s: Sequenza = { id: uid('q'), nome: nome ?? (copia ? `${orig?.nome ?? 'Montaggio'} (copia)` : `Montaggio ${n}`) };
  if (copia) {
    s.tracks = structuredClone(p.tracks); s.clips = structuredClone(p.clips); s.markers = structuredClone(p.markers);
    s.inF = p.inF; s.outF = p.outF; s.sottotitoli = structuredClone(p.sottotitoli);
  }
  p.sequenze!.push(s);
  passaA(p, s.id);
  return s.id;
}

export function rinominaSequenza(p: Project, id: string, nome: string) {
  prepara(p);
  const s = p.sequenze!.find((x) => x.id === id);
  if (s) s.nome = nome.slice(0, 40);
}

/** toglie una timeline (mai l'ultima); se è quella aperta, si apre la vicina */
export function eliminaSequenza(p: Project, id: string): boolean {
  prepara(p);
  const lista = p.sequenze!;
  if (lista.length < 2) return false;
  const i = lista.findIndex((x) => x.id === id);
  if (i < 0) return false;
  if (id === p.seqAttiva) passaA(p, lista[i === 0 ? 1 : i - 1].id);
  p.sequenze = lista.filter((x) => x.id !== id);
  return true;
}
