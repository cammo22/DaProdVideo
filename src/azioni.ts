// Tutti i comandi dell'editor in un posto solo: li usano la tastiera, i menu, la pulsantiera e i tocchi.
// Ogni comando ha il suo tasto; la schermata "Tasti" (F1) si costruisce da qui.
import { store } from './core/store';
import { motore } from './motore';
import * as M from './core/montaggio';
import { clipById, end, isVideoClip, newClip, newTransition, newTrack, nextTrackName, projectEnd, TITLE0, trackOf, uid } from './core/progetto';
import { fps, frameToTc, s2f } from './core/timecode';
import { avviso } from './ui/dom';
import { nomeModello } from './render/transizioni';
import type { Clip, Transition } from './core/tipi';

export interface Azione {
  id: string;
  nome: string;
  gruppo: string;
  tasti?: string[];
  fn: () => void;
  /** descrizione più lunga per l'aiuto */
  info?: string;
}

export const azioni = new Map<string, Azione>();
const reg = (a: Azione) => azioni.set(a.id, a);
export const esegui = (id: string) => azioni.get(id)?.fn();

/** stato dei modi della centralina */
export const modi = {
  inserisci: false, // false = sovrascrivi (default EDIUS), true = inserisci
  ripple: false,
  snap: true,
  elastico: false,
  zoneSicure: false,
  /** tracce accese (clic sul nome nella timeline): il taglio tocca solo queste e il montaggio va qui */
  attive: new Set<string>(),
};

/** le tracce accese che esistono ancora (null = nessuna accesa: vale tutto) */
export function tracceAttive(): Set<string> | null {
  const ids = new Set(store.doc.tracks.filter((t) => modi.attive.has(t.id)).map((t) => t.id));
  return ids.size ? ids : null;
}

/**
 * La clip sotto il cursore sulle tracce accese (o su tutte): prima la ripresa video più in alto, poi titoli e
 * generatori, poi l'audio. Così 2, Q e W lavorano sul girato e non sul titolo che ci sta sopra.
 */
function sottoCursore(f: number, kind: 'video' | 'audio' | 'any' = 'any'): Clip | undefined {
  const tr = tracceAttive();
  const p = store.doc;
  const sotto = p.clips.filter((x) => {
    const t = trackOf(p, x.track);
    return x.start <= f && end(x) > f && !t.lock && (!tr || tr.has(t.id)) && (kind === 'any' || t.kind === kind);
  });
  const peso = (c: Clip) => (isVideoClip(c) ? (c.kind === 'media' ? 0 : 1000) : 2000) + p.tracks.findIndex((t) => t.id === c.track);
  return sotto.sort((a, b) => peso(a) - peso(b))[0];
}

const r = () => fps(store.doc.rate);
const head = () => Math.round(store.head);

function selezionateOSottoCursore(): Set<string> {
  if (store.sel.size) return M.withLinked(store.doc, store.sel);
  const c = sottoCursore(head());
  return c ? M.withLinked(store.doc, [c.id]) : new Set();
}

/** dopo un'eliminazione si seleziona la clip che viene dopo (così 2, 2, 2 pulisce di seguito) */
function eliminaESeleziona(label: string, ids: Set<string>, ripple: boolean): number {
  const p0 = store.doc;
  const tolte = p0.clips.filter((c) => ids.has(c.id));
  const ordine = (c: Clip) => p0.tracks.findIndex((t) => t.id === c.track);
  const rif = tolte.slice().sort((a, b) => ordine(a) - ordine(b) || a.start - b.start)[0];
  const n = store.edit(label, (p) => M.deleteClips(p, ids, ripple));
  const dopo = rif ? M.clipDopo(store.doc, rif.track, rif.start) : undefined;
  store.select(dopo ? M.withLinked(store.doc, [dopo.id]) : []);
  return n;
}

// ——— i tasti numerici: la tua centralina ———
reg({
  id: 'taglia', nome: 'Taglia al cursore', gruppo: 'Montaggio', tasti: ['1', 'C'],
  info: 'Taglia sotto il cursore le tracce accese (tutte, se non ne hai accesa nessuna). Poi seleziona il pezzo più corto: premi 2 e sparisce.',
  fn: () => {
    const f = head();
    const tracce = tracceAttive();
    const destre = store.edit('Taglia', (p) => M.splitAt(p, f, tracce));
    if (!destre.length) { avviso(tracce ? 'Sulle tracce accese non c\'è niente sotto il cursore' : 'Nessuna clip sotto il cursore da tagliare', 'info', 1400); return; }
    // il pezzo più corto della ripresa più in alto (prima le riprese video, poi titoli e generatori, poi l'audio):
    // è quasi sempre lo scarto
    const p = store.doc;
    const peso = (c: Clip) => (isVideoClip(c) ? (c.kind === 'media' ? 0 : 1000) : 2000) + p.tracks.findIndex((t) => t.id === c.track);
    const dx = destre.map((id) => clipById(p, id)!).filter(Boolean).sort((a, b) => peso(a) - peso(b))[0];
    const sx = p.clips.find((c) => c.track === dx.track && end(c) === f && c.id !== dx.id);
    const corto = sx && f - sx.start < dx.len ? sx : dx;
    store.select(M.withLinked(p, [corto.id]));
    avviso(`✂ Taglio a ${frameToTc(f, p.rate, p.drop)} · selezionato il pezzo ${corto === dx ? 'di destra' : 'di sinistra'} (più corto): 2 per toglierlo`, 'tasto', 1800);
  },
});
reg({
  id: 'elimina', nome: 'Elimina clip', gruppo: 'Montaggio', tasti: ['2', 'Delete', 'Backspace'],
  info: 'Toglie le clip selezionate lasciando il buco, poi seleziona quella dopo. Senza selezione toglie la clip più in alto sotto il cursore.',
  fn: () => {
    const ids = selezionateOSottoCursore();
    if (!ids.size) { avviso('Seleziona una clip (clic) e premi 2', 'info'); return; }
    const n = eliminaESeleziona('Elimina', ids, modi.ripple);
    avviso(`🗑 ${n} clip ${modi.ripple ? 'eliminate e buco chiuso' : 'eliminate'}`, 'tasto', 1200);
  },
});
reg({
  id: 'eliminaChiudi', nome: 'Elimina e chiudi il buco', gruppo: 'Montaggio', tasti: ['3', 'Shift+Delete', 'Alt+Delete'],
  info: 'Toglie le clip e fa scorrere indietro quelle dopo (ripple delete), poi seleziona quella dopo.',
  fn: () => {
    const ids = selezionateOSottoCursore();
    if (!ids.size) { avviso('Seleziona una clip e premi 3', 'info'); return; }
    const n = eliminaESeleziona('Elimina e chiudi', ids, true);
    avviso(`⇤ ${n} clip eliminate, buco chiuso`, 'tasto', 1200);
  },
});
reg({
  id: 'separa', nome: 'Separa / unisci (gruppi di clip)', gruppo: 'Montaggio', tasti: ['S', '4', 'Alt+Y'],
  info: 'Un gruppo selezionato si separa (audio e video vanno ognuno per conto suo). Più clip o più gruppi selezionati diventano un gruppo solo che si muove insieme.',
  fn: () => {
    if (!store.sel.size) { avviso('Seleziona le clip: una per separarla, più d\'una (Shift+clic o riquadro) per unirle', 'info', 2600); return; }
    const n = store.sel.size;
    const cs = store.doc.clips.filter((c) => store.sel.has(c.id));
    const unGruppo = new Set(cs.map((c) => c.link ?? '∅' + c.id)).size === 1 && !!cs[0]?.link;
    if (!unGruppo && cs.length < 2) { avviso('Per unire seleziona almeno due clip (Shift+clic o riquadro)', 'info', 2200); return; }
    const esito = store.edit('Separa / unisci', (p) => M.toggleLink(p, store.sel));
    avviso(esito === 'separati' ? '⛓ Separate: ora ogni clip si muove da sola' : `⛓ Unite: ${n} clip si muovono insieme`, 'tasto');
  },
});
/** Q e W: via lo scarto da un lato del cursore (le clip selezionate, o quella sotto il cursore con la sua legata) */
export function eliminaLato(lato: 'sinistra' | 'destra', f = head(), clip?: Clip) {
  const p = store.doc;
  let ids: Set<string>;
  if (clip) ids = M.withLinked(p, [clip.id]);
  else if ([...store.sel].some((id) => { const c = clipById(p, id); return c && c.start < f && end(c) > f; })) ids = M.withLinked(p, store.sel);
  else { const c = sottoCursore(f); ids = c ? M.withLinked(p, [c.id]) : new Set(); }
  if (!ids.size) { avviso('Metti il cursore dentro una clip', 'info'); return; }
  const n = store.edit(lato === 'sinistra' ? 'Elimina a sinistra' : 'Elimina a destra', (pp) => M.eliminaLato(pp, ids, f, lato, modi.ripple));
  if (!n) { avviso('Il cursore deve stare dentro la clip', 'info'); return; }
  store.select([...ids].filter((id) => clipById(store.doc, id)));
  if (lato === 'sinistra' && modi.ripple) {
    const c = clipById(store.doc, [...ids][0]);
    if (c) store.setHead(c.start);
  }
  avviso(lato === 'sinistra' ? '⇤ Tolto lo scarto a sinistra' : '⇥ Tolto lo scarto a destra', 'tasto', 1200);
}
reg({ id: 'eliminaSinistra', nome: 'Elimina lo scarto a sinistra del cursore', gruppo: 'Montaggio', tasti: ['Q'], info: 'La clip sotto il cursore (o quella selezionata) perde la parte prima del cursore. Col ripple il buco si chiude.', fn: () => eliminaLato('sinistra') });
reg({ id: 'eliminaDestra', nome: 'Elimina lo scarto a destra del cursore', gruppo: 'Montaggio', tasti: ['W'], info: 'La clip sotto il cursore (o quella selezionata) perde la parte dopo il cursore.', fn: () => eliminaLato('destra') });
reg({
  id: 'dissolvenza', nome: 'Dissolvenza sul taglio', gruppo: 'Montaggio', tasti: ['5', 'Ctrl+P'],
  info: 'Mette una dissolvenza incrociata in testa alla clip selezionata (o sul taglio più vicino al cursore).',
  fn: () => transizione(newTransition('mix', Math.round(r()))),
});
reg({
  id: 'tendina', nome: 'Tendina sul taglio', gruppo: 'Montaggio', tasti: ['6'],
  fn: () => transizione(newTransition('wipe', Math.round(r()), 1)),
});
reg({
  id: 'passaggioNero', nome: 'Passaggio al nero sul taglio', gruppo: 'Montaggio', tasti: ['7'],
  fn: () => transizione(newTransition('dip', Math.round(r()))),
});
reg({
  id: 'dissolviInOut', nome: 'Dissolvenza in apertura e chiusura', gruppo: 'Montaggio', tasti: ['8'],
  info: 'Entra dal nero e esce nel nero (video) o dal silenzio (audio), un secondo per parte.',
  fn: () => {
    const ids = selezionateOSottoCursore();
    if (!ids.size) return;
    const n = Math.round(r());
    store.edit('Dissolvenza in/out', (p) => { for (const c of p.clips) if (ids.has(c.id)) { const on = c.fadeIn > 0 || c.fadeOut > 0; c.fadeIn = on ? 0 : Math.min(n, Math.floor(c.len / 2)); c.fadeOut = on ? 0 : Math.min(n, Math.floor(c.len / 2)); } });
  },
});

/** dove va una transizione: la clip che la porta e il lato (testa = 'in', coda = 'out') */
export interface Dove { clipId: string; lato: 'in' | 'out' }

/**
 * Il posto giusto per una transizione vicino al fotogramma f: il taglio o il bordo di clip più vicino.
 * Un taglio fra due clip attaccate vale come testa della clip dopo; un bordo libero come ingresso o uscita.
 */
export function doveTransizione(p: import('./core/tipi').Project, f: number, candidate: Clip[]): Dove | null {
  let best: (Dove & { d: number; peso: number }) | null = null;
  const ordine = (c: Clip) => p.tracks.findIndex((t) => t.id === c.track);
  for (const c of candidate) {
    if (trackOf(p, c.track).lock) continue;
    const prev = M.prevAdjacent(p, c);
    const next = p.clips.find((x) => x.track === c.track && x.id !== c.id && x.start === end(c));
    const bordi: [number, Dove, number][] = [[c.start, { clipId: c.id, lato: 'in' }, prev ? 0 : 1]];
    if (!next) bordi.push([end(c), { clipId: c.id, lato: 'out' }, 1]);
    else bordi.push([end(c), { clipId: next.id, lato: 'in' }, 0]);
    // il cursore dentro una transizione già messa: si cambia quella
    if (c.trIn && f >= c.start && f < c.start + c.trIn.len) bordi.push([f, { clipId: c.id, lato: 'in' }, -1]);
    if (c.trOut && f >= end(c) - c.trOut.len && f < end(c)) bordi.push([f, { clipId: c.id, lato: 'out' }, -1]);
    for (const [x, dove, peso] of bordi) {
      // a parità di distanza vince la ripresa video (non il titolo sopra, non l'audio sotto)
      const d = Math.abs(x - f) + peso * 0.5 + ordine(c) * 0.01 + (c.kind === 'media' ? 0 : 0.3) + (isVideoClip(c) ? 0 : 1000);
      if (!best || d < best.d) best = { ...dove, d, peso };
    }
  }
  return best ? { clipId: best.clipId, lato: best.lato } : null;
}

/** transizione: dove dice chi chiama, sennò sulla clip selezionata, sennò sul taglio più vicino al cursore */
function transizione(t: Transition, dove?: Dove) {
  const p = store.doc;
  const f = head();
  if (!dove) {
    const sel = p.clips.filter((c) => store.sel.has(c.id));
    const tr = tracceAttive();
    const candidate = sel.length ? sel : p.clips.filter((c) => !tr || tr.has(c.track));
    dove = doveTransizione(p, f, candidate) ?? undefined;
  }
  if (!dove) { avviso('Nella timeline non c\'è ancora una clip per la transizione', 'info'); return; }
  const c0 = clipById(p, dove.clipId);
  if (!c0) return;
  // la clip e le sue legate che hanno lo stesso bordo (il video e il suo audio)
  const lato = dove.lato;
  const bordo = lato === 'in' ? c0.start : end(c0);
  const gruppo = [...M.withLinked(p, [c0.id])].map((id) => clipById(p, id)!).filter((c) => (lato === 'in' ? c.start : end(c)) === bordo);
  const ids = new Set(gruppo.map((c) => c.id));
  // stessa transizione già messa (stesso tipo e modello) = la si toglie; altrimenti si mette o si cambia
  const di = (c: Clip) => (lato === 'in' ? c.trIn : c.trOut);
  const uguale = (c: Clip) => di(c)?.type === t.type && (t.type === 'mix' || t.type === 'dip' || di(c)?.pattern === t.pattern);
  const video = gruppo.filter((c) => isVideoClip(c));
  const tutte = (video.length ? video : gruppo).every(uguale);
  store.edit(tutte ? 'Togli transizione' : 'Transizione', (pp) => M.setTransition(pp, ids, tutte ? null : t, lato));
  const nome = nomeModello(t.type, t.pattern);
  const dov = lato === 'out' ? 'in uscita' : M.prevAdjacent(p, c0) ? 'sul taglio' : 'in entrata';
  avviso(tutte ? `${nome} tolta` : `${nome} ${dov} · ${(t.len / r()).toFixed(1).replace('.', ',')} s`, 'tasto', 1400);
}

/** mette la transizione scelta nel contenitore (tipo e modello): dove dici tu, o sul taglio più vicino */
export function applicaTransizione(tipo: Transition['type'], pattern = 1, dove?: Dove) {
  const t = newTransition(tipo, Math.round(r()), pattern);
  if (tipo === 'dve' && (pattern === 401 || pattern === 411)) t.len = Math.round(r() * 1.2);
  transizione(t, dove);
}

// ——— istantanea: il fotogramma diventa un'immagine del contenitore ———
reg({
  id: 'istantanea', nome: 'Istantanea del fotogramma (nel contenitore)', gruppo: 'Montaggio', tasti: ['P'],
  info: 'Fotografa il fotogramma sotto il cursore (Recorder) o della sorgente (Player): finisce nel contenitore come immagine da allungare.',
  fn: () => { void import('./istantanea').then((m) => m.istantanea()); },
});
reg({
  id: 'fermoImmagine', nome: 'Fermo immagine al cursore', gruppo: 'Montaggio', tasti: ['Shift+P'],
  info: 'Istantanea del Recorder inserita al cursore per due secondi: il resto scorre avanti.',
  fn: () => { void import('./istantanea').then((m) => m.istantanea({ fermo: true })); },
});

// ——— annulla e appunti ———
reg({ id: 'annulla', nome: 'Annulla', gruppo: 'Modifica', tasti: ['Ctrl+Z'], fn: () => { const l = store.doUndo(); avviso(l ? `↶ Annullato: ${l}` : 'Niente da annullare', 'info', 1200); } });
reg({ id: 'ripeti', nome: 'Ripeti', gruppo: 'Modifica', tasti: ['Ctrl+Y', 'Ctrl+Shift+Z'], fn: () => { const l = store.doRedo(); avviso(l ? `↷ Ripetuto: ${l}` : 'Niente da ripetere', 'info', 1200); } });

let appunti: Clip[] = [];
reg({
  id: 'copia', nome: 'Copia clip', gruppo: 'Modifica', tasti: ['Ctrl+C'],
  fn: () => { const ids = M.withLinked(store.doc, store.sel); appunti = structuredClone(store.doc.clips.filter((c) => ids.has(c.id))); if (appunti.length) avviso(`${appunti.length} clip copiate`, 'info', 1000); },
});
reg({
  id: 'tagliaAppunti', nome: 'Taglia clip negli appunti', gruppo: 'Modifica', tasti: ['Ctrl+X'],
  fn: () => { esegui('copia'); if (appunti.length) store.edit('Taglia negli appunti', (p) => M.deleteClips(p, new Set(appunti.map((c) => c.id)), modi.ripple)); },
});
reg({
  id: 'incolla', nome: 'Incolla al cursore', gruppo: 'Modifica', tasti: ['Ctrl+V'],
  fn: () => {
    if (!appunti.length) return;
    const f = head();
    const min = Math.min(...appunti.map((c) => c.start));
    const ids = store.edit('Incolla', (p) => {
      const links = new Map<string, string>();
      const nuove = appunti.map((c) => {
        const n = structuredClone(c);
        n.id = uid('c');
        n.start = c.start - min + f;
        if (c.link) { if (!links.has(c.link)) links.set(c.link, uid('l')); n.link = links.get(c.link); }
        if (!p.tracks.some((t) => t.id === n.track)) n.track = p.tracks.find((t) => t.kind === (isVideoClip(c) ? 'video' : 'audio'))!.id;
        return n;
      });
      const set = new Set(nuove.map((c) => c.id));
      if (modi.inserisci) {
        p.clips.push(...nuove);
        const a = Math.min(...nuove.map((c) => c.start)), b = Math.max(...nuove.map((c) => end(c)));
        M.insertSpace(p, a, b - a, new Set(p.tracks.filter((t) => !t.lock).map((t) => t.id)), set);
      } else {
        // niente viene coperto: se la traccia è occupata la clip va su una libera
        for (const c of nuove) {
          c.track = M.tracciaLibera(p, trackOf(p, c.track).kind, c.track, c.start, end(c));
          p.clips.push(c);
        }
      }
      return [...set];
    });
    store.select(ids);
    store.setHead(f + Math.max(...appunti.map((c) => end(c))) - min);
  },
});
reg({ id: 'tutto', nome: 'Seleziona tutto', gruppo: 'Modifica', tasti: ['Ctrl+A'], fn: () => store.select(store.doc.clips.map((c) => c.id)) });
reg({ id: 'deseleziona', nome: 'Deseleziona', gruppo: 'Modifica', tasti: ['Escape'], fn: () => store.select([]) });
reg({
  id: 'selezionaDopo', nome: 'Seleziona tutto dopo il cursore', gruppo: 'Modifica', tasti: ['Ctrl+Shift+A'],
  fn: () => store.select(store.doc.clips.filter((c) => c.start >= head()).map((c) => c.id)),
});

// ——— trasporto ———
reg({ id: 'play', nome: 'Play / Stop', gruppo: 'Trasporto', tasti: ['Space'], fn: () => motore.toggle() });
reg({ id: 'shuttleAvanti', nome: 'Shuttle avanti (ripeti per accelerare)', gruppo: 'Trasporto', tasti: ['L'], fn: () => motore.shuttle(1) });
reg({ id: 'shuttleIndietro', nome: 'Shuttle indietro (ripeti per accelerare)', gruppo: 'Trasporto', tasti: ['J'], fn: () => motore.shuttle(-1) });
reg({ id: 'fermo', nome: 'Fermo', gruppo: 'Trasporto', tasti: ['K'], fn: () => motore.stop() });
reg({ id: 'fotoPrec', nome: 'Fotogramma precedente', gruppo: 'Trasporto', tasti: ['ArrowLeft'], fn: () => motore.passo(-1) });
reg({ id: 'fotoSucc', nome: 'Fotogramma successivo', gruppo: 'Trasporto', tasti: ['ArrowRight'], fn: () => motore.passo(1) });
reg({ id: 'secPrec', nome: 'Indietro di 1 secondo', gruppo: 'Trasporto', tasti: ['Shift+ArrowLeft'], fn: () => motore.passo(-Math.round(r())) });
reg({ id: 'secSucc', nome: 'Avanti di 1 secondo', gruppo: 'Trasporto', tasti: ['Shift+ArrowRight'], fn: () => motore.passo(Math.round(r())) });
const puntoMontaggio = (dir: 1 | -1) => {
  if (motore.attivo !== 'recorder') { motore.setMonitor('recorder'); }
  const pts = M.editPoints(store.doc);
  const f = head();
  const t = dir > 0 ? pts.find((x) => x > f) : [...pts].reverse().find((x) => x < f);
  if (t !== undefined) motore.vaiA(t);
};
reg({ id: 'tagloPrec', nome: 'Taglio precedente', gruppo: 'Trasporto', tasti: ['ArrowUp', 'PageUp'], fn: () => puntoMontaggio(-1) });
reg({ id: 'taglioSucc', nome: 'Taglio successivo', gruppo: 'Trasporto', tasti: ['ArrowDown', 'PageDown'], fn: () => puntoMontaggio(1) });
reg({
  id: 'inizio', nome: 'All\'inizio', gruppo: 'Trasporto', tasti: ['Home'],
  fn: () => { if (motore.attivo === 'recorder') motore.vaiA(0); else { const m = store.doc.media.find((x) => x.id === motore.playerMedia); motore.playerVaiA(m?.t0 ?? 0); } },
});
reg({
  id: 'fine', nome: 'Alla fine', gruppo: 'Trasporto', tasti: ['End'],
  fn: () => { if (motore.attivo === 'recorder') motore.vaiA(projectEnd(store.doc)); else { const m = store.doc.media.find((x) => x.id === motore.playerMedia); if (m) motore.playerVaiA(m.duration); } },
});
reg({ id: 'loop', nome: 'Riproduzione in loop (attacco-stacco)', gruppo: 'Trasporto', tasti: ['Ctrl+L'], fn: () => { motore.loop = !motore.loop; avviso(motore.loop ? '⟳ Loop acceso' : 'Loop spento', 'info', 1000); store.emit('status'); } });
reg({
  id: 'monitor', nome: 'Monitor: sorgente ↔ montaggio', gruppo: 'Trasporto', tasti: ['Tab'],
  info: 'Il monitor mostra il montaggio; con doppio clic su un file del contenitore mostra la sorgente. Tab passa dall\'uno all\'altro.',
  fn: () => { if (motore.attivo === 'recorder' && !motore.playerMedia) { avviso('Doppio clic su un file del contenitore per vederlo nel monitor', 'info'); return; } motore.setMonitor(motore.attivo === 'player' ? 'recorder' : 'player'); },
});

// ——— attacco / stacco ———
function segna(quale: 'in' | 'out') {
  if (motore.attivo === 'player') {
    const m = store.doc.media.find((x) => x.id === motore.playerMedia);
    if (!m) return;
    store.edit(quale === 'in' ? 'Attacco sorgente' : 'Stacco sorgente', () => {
      if (quale === 'in') { m.markIn = motore.playerT; if (m.markOut != null && m.markOut <= m.markIn) m.markOut = null; }
      else { m.markOut = motore.playerT; if (m.markIn != null && m.markIn >= m.markOut) m.markIn = null; }
    });
    return;
  }
  const f = head();
  store.edit(quale === 'in' ? 'Attacco' : 'Stacco', (p) => {
    if (quale === 'in') { p.inF = f; if (p.outF !== null && p.outF <= f) p.outF = null; }
    else { p.outF = f; if (p.inF !== null && p.inF >= f) p.inF = null; }
  });
}
reg({ id: 'segnaIn', nome: 'Segna attacco (IN)', gruppo: 'Attacco e stacco', tasti: ['I'], fn: () => segna('in') });
reg({ id: 'segnaOut', nome: 'Segna stacco (OUT)', gruppo: 'Attacco e stacco', tasti: ['O'], fn: () => segna('out') });
reg({
  id: 'segnaClip', nome: 'Attacco e stacco sulla clip sotto il cursore', gruppo: 'Attacco e stacco', tasti: ['Shift+Q'],
  fn: () => { const c = M.topClipAt(store.doc, head(), 'video') ?? M.topClipAt(store.doc, head()); if (c) store.edit('Segna clip', (p) => { p.inF = c.start; p.outF = end(c); }); },
});
reg({
  id: 'togliInOut', nome: 'Togli attacco e stacco', gruppo: 'Attacco e stacco', tasti: ['Alt+X', 'Ctrl+Shift+X'],
  fn: () => {
    if (motore.attivo === 'player') { const m = store.doc.media.find((x) => x.id === motore.playerMedia); if (m) store.edit('Togli segni sorgente', () => { m.markIn = null; m.markOut = null; }); }
    else store.edit('Togli attacco e stacco', (p) => { p.inF = null; p.outF = null; });
  },
});
reg({
  id: 'vaiIn', nome: 'Vai all\'attacco', gruppo: 'Attacco e stacco', tasti: ['Shift+I'],
  fn: () => { if (motore.attivo === 'player') { const m = store.doc.media.find((x) => x.id === motore.playerMedia); if (m?.markIn != null) motore.playerVaiA(m.markIn); } else if (store.doc.inF !== null) motore.vaiA(store.doc.inF); },
});
reg({
  id: 'vaiOut', nome: 'Vai allo stacco', gruppo: 'Attacco e stacco', tasti: ['Shift+O'],
  fn: () => { if (motore.attivo === 'player') { const m = store.doc.media.find((x) => x.id === motore.playerMedia); if (m?.markOut != null) motore.playerVaiA(m.markOut); } else if (store.doc.outF !== null) motore.vaiA(store.doc.outF); },
});

// ——— montaggio a tre punti (la centralina) ———
/** le tracce che ricevono dalla sorgente: quelle accese, altrimenti V1 e A1-A2 (la "patch" della centralina) */
export function bersagli(): M.Targets {
  const p = store.doc;
  const v = p.tracks.filter((t) => t.kind === 'video' && !t.lock);
  const a = p.tracks.filter((t) => t.kind === 'audio' && !t.lock);
  const tr = tracceAttive();
  if (tr) {
    const av = v.filter((t) => tr.has(t.id)), aa = a.filter((t) => tr.has(t.id));
    return { video: av[av.length - 1]?.id ?? null, audio: aa.slice(0, 2).map((t) => t.id) };
  }
  return { video: v[v.length - 1]?.id ?? null, audio: a.slice(0, 2).map((t) => t.id) };
}

export function montaDalPlayer(mode: M.EditMode) {
  const p = store.doc;
  const m = p.media.find((x) => x.id === motore.playerMedia);
  if (!m) { avviso('Doppio clic su un file del contenitore per aprirlo nel monitor', 'info'); return; }
  const srcIn = m.markIn ?? (motore.attivo === 'player' && m.type !== 'image' ? motore.playerT : m.t0 || 0);
  let srcOut = m.markOut ?? (m.type === 'image' ? srcIn + 5 : m.duration);
  if (srcOut <= srcIn) srcOut = m.type === 'image' ? srcIn + 5 : m.duration;
  let recIn = p.inF ?? head();
  const recOut = p.inF !== null ? p.outF : null;
  // tre punti "all'indietro": solo lo stacco sulla timeline -> la clip finisce lì
  if (p.inF === null && p.outF !== null) {
    const len = s2f(srcOut - srcIn, p.rate);
    recIn = Math.max(0, p.outF - len);
  }
  const tg = bersagli();
  if (!(m.hasVideo && tg.video) && !(m.hasAudio && tg.audio.length)) { avviso('Accendi una traccia del tipo giusto (clic sul nome della traccia)', 'errore'); return; }
  // un solo passo di annulla: il montaggio e la pulizia di attacco/stacco insieme
  const ids = store.edit(mode === 'insert' ? 'Inserisci' : 'Sovrascrivi', (pp) => {
    const r = M.placeSource(pp, { mediaId: m.id, srcIn, srcOut }, recIn, recOut, tg, mode);
    if (r.length) { pp.inF = null; pp.outF = null; }
    return r;
  });
  if (!ids.length) return;
  const nuove = ids.map((id) => clipById(store.doc, id)!).filter(Boolean);
  const fine = Math.max(...nuove.map((c) => end(c)));
  store.select(ids);
  ultimoMontaggio = { a: recIn, b: fine };
  motore.setMonitor('recorder');
  store.setHead(fine);
  avviso(`${mode === 'insert' ? '⤵ Inserito' : '⬇ Sovrascritto'} ${m.name} · ${frameToTc(fine - recIn, p.rate, p.drop)}`, 'tasto');
}
let ultimoMontaggio: { a: number; b: number } | null = null;

reg({ id: 'inserisci', nome: 'Inserisci dalla sorgente', gruppo: 'Centralina', tasti: [',', '['], info: 'Montaggio a tre punti: la sorgente entra al cursore e sposta avanti il resto.', fn: () => montaDalPlayer('insert') });
reg({ id: 'sovrascrivi', nome: 'Sovrascrivi dalla sorgente', gruppo: 'Centralina', tasti: ['.', ']'], info: 'Montaggio a tre punti: la sorgente copre quello che c\'è sotto (l\'unico comando che copre).', fn: () => montaDalPlayer('overwrite') });
reg({ id: 'edit', nome: 'EDIT (nel modo attivo)', gruppo: 'Centralina', tasti: ['E', 'Enter'], fn: () => montaDalPlayer(modi.inserisci ? 'insert' : 'overwrite') });
reg({
  id: 'rivedi', nome: 'Rivedi l\'ultimo montaggio (preroll)', gruppo: 'Centralina', tasti: ['Shift+R'],
  fn: () => { if (ultimoMontaggio) motore.rivedi(ultimoMontaggio.a, ultimoMontaggio.b); else if (store.doc.inF !== null) motore.rivedi(store.doc.inF, store.doc.outF ?? store.doc.inF); },
});
reg({
  id: 'solleva', nome: 'Solleva (lift) attacco-stacco', gruppo: 'Centralina', tasti: ['Z'],
  fn: () => { const p = store.doc; if (p.inF === null || p.outF === null) { avviso('Segna attacco (I) e stacco (O) sulla timeline', 'info'); return; } store.edit('Solleva', (pp) => M.lift(pp, p.inF!, p.outF!)); avviso('⇡ Sollevato: resta il buco', 'tasto'); },
});
reg({
  id: 'estrai', nome: 'Estrai (extract) attacco-stacco', gruppo: 'Centralina', tasti: ['X'],
  fn: () => {
    const p = store.doc;
    if (p.inF === null || p.outF === null) { avviso('Segna attacco (I) e stacco (O) sulla timeline', 'info'); return; }
    const a = p.inF, b = p.outF;
    store.edit('Estrai', (pp) => { M.extract(pp, a, b); pp.outF = null; });
    store.setHead(a);
    avviso('⇤ Estratto: il buco si è chiuso su tutte le tracce', 'tasto');
  },
});
reg({ id: 'modoInserisci', nome: 'Modo libero / inserisci', gruppo: 'Centralina', tasti: ['Insert', 'Alt+I'], fn: () => { modi.inserisci = !modi.inserisci; avviso(modi.inserisci ? 'Modo INSERISCI: la clip che lasci fa spazio spostando avanti il resto' : 'Modo LIBERO: la clip che sposti o lasci non copre niente', 'info', 2200); store.emit('status'); } });
reg({ id: 'ripple', nome: 'Ripple (elimina e trim chiudono i buchi)', gruppo: 'Centralina', tasti: ['R'], fn: () => { modi.ripple = !modi.ripple; avviso(modi.ripple ? 'Ripple ACCESO' : 'Ripple spento', 'info', 1000); store.emit('status'); } });
reg({ id: 'snap', nome: 'Calamita (aggancio)', gruppo: 'Centralina', tasti: ['N'], fn: () => { modi.snap = !modi.snap; avviso(modi.snap ? 'Calamita accesa' : 'Calamita spenta', 'info', 1000); store.emit('status'); } });
reg({ id: 'elastico', nome: 'Linee elastiche (trasparenza e volume)', gruppo: 'Centralina', tasti: ['B'], fn: () => { modi.elastico = !modi.elastico; avviso(modi.elastico ? 'Linee elastiche: clic sulla linea per un punto, Alt+clic per toglierlo' : 'Linee elastiche nascoste', 'info', 2200); store.emit('status', 'view'); } });
reg({
  id: 'abbina', nome: 'Abbina fotogramma (match frame)', gruppo: 'Centralina', tasti: ['F'],
  fn: () => {
    const c = M.topClipAt(store.doc, head(), 'video') ?? M.topClipAt(store.doc, head());
    if (!c?.media) { avviso('Sotto il cursore non c\'è una sorgente', 'info'); return; }
    const t = c.srcIn + (head() - c.start) / r();
    motore.caricaPlayer(c.media, t);
    motore.setMonitor('player');
    avviso('La sorgente nel monitor allo stesso fotogramma (Tab per tornare al montaggio)', 'info');
  },
});
reg({
  id: 'marcatore', nome: 'Marcatore al cursore', gruppo: 'Centralina', tasti: ['M'],
  fn: () => {
    const f = head();
    const esiste = store.doc.markers.find((m) => m.f === f);
    store.edit(esiste ? 'Togli marcatore' : 'Marcatore', (p) => {
      if (esiste) p.markers = p.markers.filter((m) => m !== esiste);
      else p.markers.push({ id: uid('k'), f, name: 'Marcatore ' + (p.markers.length + 1), color: '#ffd54a' });
    });
  },
});
reg({
  id: 'estendi', nome: 'Estendi il taglio al cursore (extend)', gruppo: 'Centralina', tasti: ['Ctrl+E'],
  info: 'Porta il bordo più vicino della clip selezionata fino al cursore.',
  fn: () => {
    const c = store.doc.clips.find((x) => store.sel.has(x.id));
    if (!c) return;
    const f = head();
    const edge = Math.abs(f - c.start) < Math.abs(f - end(c)) ? 'in' : 'out';
    const d = edge === 'in' ? f - c.start : f - end(c);
    store.edit('Estendi', (p) => M.trimClip(p, c.id, edge, d, { ripple: modi.ripple, linked: true }));
  },
});
reg({
  id: 'slipSx', nome: 'Slip di un fotogramma indietro', gruppo: 'Centralina', tasti: ['Alt+ArrowLeft'],
  fn: () => { if (store.sel.size) store.edit('Slip', (p) => M.slipClip(p, M.withLinked(p, store.sel), -1)); },
});
reg({
  id: 'slipDx', nome: 'Slip di un fotogramma avanti', gruppo: 'Centralina', tasti: ['Alt+ArrowRight'],
  fn: () => { if (store.sel.size) store.edit('Slip', (p) => M.slipClip(p, M.withLinked(p, store.sel), 1)); },
});
reg({
  id: 'nudgeSx', nome: 'Sposta la clip di un fotogramma a sinistra', gruppo: 'Centralina', tasti: ['Ctrl+ArrowLeft'],
  fn: () => { if (store.sel.size) store.edit('Sposta', (p) => M.moveClips(p, M.withLinked(p, store.sel), -1, 0, 'video', 'libero')); },
});
reg({
  id: 'nudgeDx', nome: 'Sposta la clip di un fotogramma a destra', gruppo: 'Centralina', tasti: ['Ctrl+ArrowRight'],
  fn: () => { if (store.sel.size) store.edit('Sposta', (p) => M.moveClips(p, M.withLinked(p, store.sel), 1, 0, 'video', 'libero')); },
});

// ——— trasparenza al volo ———
function opacitaSel(delta: number) {
  const ids = [...store.sel].filter((id) => { const c = clipById(store.doc, id); return c && isVideoClip(c); });
  if (!ids.length) { avviso('Seleziona una clip video', 'info', 1000); return; }
  store.edit('Trasparenza', (p) => { for (const c of p.clips) if (ids.includes(c.id)) { c.opacity = Math.max(0, Math.min(1, Math.round((c.opacity + delta) * 20) / 20)); c.opKeys = []; } });
  const c = clipById(store.doc, ids[0])!;
  avviso(`Opacità ${Math.round(c.opacity * 100)}%`, 'tasto', 800);
}
reg({ id: 'opacitaMeno', nome: 'Trasparenza: meno opaca (−10%)', gruppo: 'Livelli', tasti: ['Alt+ArrowDown'], fn: () => opacitaSel(-0.1) });
reg({ id: 'opacitaPiu', nome: 'Trasparenza: più opaca (+10%)', gruppo: 'Livelli', tasti: ['Alt+ArrowUp'], fn: () => opacitaSel(0.1) });
reg({
  id: 'tracciaV', nome: 'Aggiungi traccia video', gruppo: 'Livelli', tasti: ['Ctrl+Alt+V'],
  fn: () => store.edit('Traccia video', (p) => { p.tracks.unshift(newTrack('video', nextTrackName(p, 'video'))); }),
});
reg({
  id: 'tracciaA', nome: 'Aggiungi traccia audio', gruppo: 'Livelli', tasti: ['Ctrl+Alt+A'],
  fn: () => store.edit('Traccia audio', (p) => { p.tracks.push(newTrack('audio', nextTrackName(p, 'audio'))); }),
});

// ——— generatori (le macchine della sala) ———
export function inserisciGeneratore(kind: 'bars' | 'color' | 'countdown' | 'title' | 'nero', f = head(), trackId?: string) {
  const p = store.doc;
  const rr = r();
  const v1 = p.tracks.filter((t) => t.kind === 'video' && !t.lock).slice(-1)[0]?.id ?? null;
  const a1 = p.tracks.find((t) => t.kind === 'audio' && !t.lock)?.id ?? null;
  // come i generatori della sala: entrano al cursore su una traccia libera, e non coprono niente
  const ids = store.edit('Generatore', (pp) => {
    const out: string[] = [];
    const tv = (len: number, pref: string | null = trackId ?? v1) => M.tracciaLibera(pp, 'video', pref, f, f + len);
    const ta = (len: number) => M.tracciaLibera(pp, 'audio', a1, f, f + len);
    if (kind === 'bars') {
      const len = Math.round(rr * 10);
      const l = uid('l');
      const c = newClip('bars', tv(len), f, len, { name: 'Barre colore SMPTE', gen: { bars: 'smpte' }, link: l }); pp.clips.push(c); out.push(c.id);
      const t = newClip('tone', ta(len), f, len, { name: 'Tono 1 kHz −18 dBFS', gen: { freq: 1000, level: -18 }, link: l }); pp.clips.push(t); out.push(t.id);
    } else if (kind === 'countdown') {
      const len = Math.round(rr * 8);
      const l = uid('l');
      const c = newClip('countdown', tv(len), f, len, { name: 'Countdown 8…2', link: l }); pp.clips.push(c); out.push(c.id);
      // il "2-pop": un fotogramma di tono quando compare il 2
      const pop = f + len - Math.round(rr * 2);
      const b = newClip('beep', M.tracciaLibera(pp, 'audio', a1, pop, pop + 1), pop, 1, { name: '2-pop', gen: { freq: 1000, level: -20 }, link: l }); pp.clips.push(b); out.push(b.id);
    } else if (kind === 'title') {
      const len = Math.round(rr * 5);
      // i titoli stanno sopra: si parte dalla traccia video più alta
      const c = newClip('title', tv(len, trackId ?? pp.tracks.find((t) => t.kind === 'video' && !t.lock)?.id ?? null), f, len, { name: 'Titolo', gen: { title: { ...TITLE0 } } }); pp.clips.push(c); out.push(c.id);
    } else {
      const len = Math.round(rr * 5);
      const c = newClip('color', tv(len), f, len, { name: kind === 'nero' ? 'Nero' : 'Colore', gen: { color: kind === 'nero' ? '#000000' : '#1b3a8f' } }); pp.clips.push(c); out.push(c.id);
    }
    return out;
  });
  store.select(ids);
  return ids;
}
reg({ id: 'genBarre', nome: 'Barre colore e tono', gruppo: 'Generatori', tasti: ['Ctrl+Alt+B'], fn: () => inserisciGeneratore('bars') });
reg({ id: 'genNero', nome: 'Nero', gruppo: 'Generatori', fn: () => inserisciGeneratore('nero') });
reg({ id: 'genColore', nome: 'Colore pieno', gruppo: 'Generatori', fn: () => inserisciGeneratore('color') });
reg({ id: 'genCountdown', nome: 'Countdown da pellicola', gruppo: 'Generatori', tasti: ['Ctrl+Alt+C'], fn: () => inserisciGeneratore('countdown') });
reg({ id: 'genTitolo', nome: 'Titolo', gruppo: 'Generatori', tasti: ['T', 'Ctrl+T'], fn: () => inserisciGeneratore('title') });

export { head as cursore };
