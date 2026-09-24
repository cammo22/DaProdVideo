// Tutti i comandi dell'editor in un posto solo: li usano la tastiera, i menu, la pulsantiera e i tocchi.
// Ogni comando ha il suo tasto; la schermata "Tasti" (F1) si costruisce da qui.
import { store } from './core/store';
import { motore } from './motore';
import * as M from './core/montaggio';
import { clipById, end, isVideoClip, newClip, newTransition, newTrack, nextTrackName, projectEnd, TITLE0, trackOf, uid } from './core/progetto';
import { fps, frameToTc, s2f } from './core/timecode';
import { avviso } from './ui/dom';
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
  /** patch: se il video del Player va nella timeline, e su quali tracce (null = V1 e A1+A2) */
  patchV: true,
  targetV: null as string | null,
  targetA: null as string[] | null,
};

const r = () => fps(store.doc.rate);
const head = () => Math.round(store.head);

function selezionateOSottoCursore(): Set<string> {
  if (store.sel.size) return M.withLinked(store.doc, store.sel);
  const c = M.topClipAt(store.doc, head(), 'any');
  return c ? M.withLinked(store.doc, [c.id]) : new Set();
}

// ——— i tasti numerici: la tua centralina ———
reg({
  id: 'taglia', nome: 'Taglia al cursore', gruppo: 'Montaggio', tasti: ['1', 'C'],
  info: 'Taglia le clip selezionate sotto il cursore; senza selezione taglia tutte le tracce non bloccate.',
  fn: () => {
    const f = head();
    const n = store.edit('Taglia', (p) => M.splitAt(p, f, store.sel));
    if (n.length) avviso(`✂ Taglio a ${frameToTc(f, store.doc.rate, store.doc.drop)}`, 'tasto', 1200);
    else avviso('Nessuna clip sotto il cursore da tagliare', 'info', 1400);
  },
});
reg({
  id: 'elimina', nome: 'Elimina clip', gruppo: 'Montaggio', tasti: ['2', 'Delete', 'Backspace'],
  info: 'Toglie le clip selezionate lasciando il buco. Senza selezione toglie la clip più in alto sotto il cursore.',
  fn: () => {
    const ids = selezionateOSottoCursore();
    if (!ids.size) { avviso('Seleziona una clip (clic) e premi 2', 'info'); return; }
    const n = store.edit('Elimina', (p) => M.deleteClips(p, ids, modi.ripple));
    avviso(`🗑 ${n} clip ${modi.ripple ? 'eliminate e buco chiuso' : 'eliminate'}`, 'tasto', 1200);
  },
});
reg({
  id: 'eliminaChiudi', nome: 'Elimina e chiudi il buco', gruppo: 'Montaggio', tasti: ['3', 'Shift+Delete', 'Alt+Delete'],
  info: 'Toglie le clip e fa scorrere indietro quelle dopo (ripple delete).',
  fn: () => {
    const ids = selezionateOSottoCursore();
    if (!ids.size) { avviso('Seleziona una clip e premi 3', 'info'); return; }
    const n = store.edit('Elimina e chiudi', (p) => M.deleteClips(p, ids, true));
    avviso(`⇤ ${n} clip eliminate, buco chiuso`, 'tasto', 1200);
  },
});
reg({
  id: 'separa', nome: 'Separa / unisci audio e video', gruppo: 'Montaggio', tasti: ['4', 'Alt+Y'],
  info: 'Scollega l\'audio dal video (o ricollega le clip selezionate).',
  fn: () => {
    if (!store.sel.size) { avviso('Seleziona la clip da separare', 'info'); return; }
    const esito = store.edit('Separa audio', (p) => M.toggleLink(p, store.sel));
    avviso(esito === 'separati' ? '⛓ Audio e video separati: ora si muovono da soli' : '⛓ Clip unite', 'tasto');
  },
});
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

/** transizione: sulla clip selezionata, altrimenti sul taglio sotto/vicino al cursore */
function transizione(t: Transition) {
  const p = store.doc;
  let targets: Clip[] = p.clips.filter((c) => store.sel.has(c.id));
  if (!targets.length) {
    const f = head();
    // il taglio più vicino al cursore su ogni traccia (entro mezzo secondo)
    const win = Math.round(r() / 2);
    targets = p.clips.filter((c) => Math.abs(c.start - f) <= win && !trackOf(p, c.track).lock && M.prevAdjacent(p, c));
    if (!targets.length) { avviso('Metti il cursore su un taglio o seleziona la clip che entra', 'info'); return; }
    const linked = M.withLinked(p, targets.map((c) => c.id));
    targets = p.clips.filter((c) => linked.has(c.id) && targets.some((x) => x.start === c.start));
  }
  const ids = new Set(targets.map((c) => c.id));
  const tutte = targets.every((c) => c.trIn?.type === t.type);
  store.edit(tutte ? 'Togli transizione' : 'Transizione', (pp) => M.setTransition(pp, ids, tutte ? null : t));
  const nome = t.type === 'mix' ? 'Dissolvenza' : t.type === 'wipe' ? 'Tendina' : 'Passaggio al nero';
  avviso(tutte ? `${nome} tolta` : `${nome} · ${t.len} fotogrammi`, 'tasto', 1200);
}

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
      p.clips.push(...nuove);
      if (modi.inserisci) {
        const a = Math.min(...nuove.map((c) => c.start)), b = Math.max(...nuove.map((c) => end(c)));
        M.insertSpace(p, a, b - a, new Set(p.tracks.filter((t) => !t.lock).map((t) => t.id)), set);
      } else for (const c of nuove) M.clearRange(p, c.track, c.start, end(c), set);
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
reg({ id: 'tagloPrec', nome: 'Taglio precedente', gruppo: 'Trasporto', tasti: ['ArrowUp', 'A', 'PageUp'], fn: () => puntoMontaggio(-1) });
reg({ id: 'taglioSucc', nome: 'Taglio successivo', gruppo: 'Trasporto', tasti: ['ArrowDown', 'S', 'PageDown'], fn: () => puntoMontaggio(1) });
reg({
  id: 'inizio', nome: 'All\'inizio', gruppo: 'Trasporto', tasti: ['Home'],
  fn: () => { if (motore.attivo === 'recorder') motore.vaiA(0); else { const m = store.doc.media.find((x) => x.id === motore.playerMedia); motore.playerVaiA(m?.t0 ?? 0); } },
});
reg({
  id: 'fine', nome: 'Alla fine', gruppo: 'Trasporto', tasti: ['End'],
  fn: () => { if (motore.attivo === 'recorder') motore.vaiA(projectEnd(store.doc)); else { const m = store.doc.media.find((x) => x.id === motore.playerMedia); if (m) motore.playerVaiA(m.duration); } },
});
reg({ id: 'loop', nome: 'Riproduzione in loop (attacco-stacco)', gruppo: 'Trasporto', tasti: ['Ctrl+L'], fn: () => { motore.loop = !motore.loop; avviso(motore.loop ? '⟳ Loop acceso' : 'Loop spento', 'info', 1000); store.emit('status'); } });
reg({ id: 'monitor', nome: 'Passa tra Player e Recorder', gruppo: 'Trasporto', tasti: ['Tab'], fn: () => motore.setMonitor(motore.attivo === 'player' ? 'recorder' : 'player') });

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
  id: 'segnaClip', nome: 'Attacco e stacco sulla clip sotto il cursore', gruppo: 'Attacco e stacco', tasti: ['Q'],
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
/** le tracce che ricevono dal Player (la "patch" della centralina) */
export function bersagli(): M.Targets {
  const p = store.doc;
  const v = p.tracks.filter((t) => t.kind === 'video' && !t.lock);
  const a = p.tracks.filter((t) => t.kind === 'audio' && !t.lock);
  const tv = modi.targetV && v.some((t) => t.id === modi.targetV) ? modi.targetV : v[v.length - 1]?.id ?? null;
  const ta = modi.targetA ? modi.targetA.filter((id) => a.some((t) => t.id === id)) : a.slice(0, 2).map((t) => t.id);
  return { video: modi.patchV ? tv : null, audio: ta };
}

export function montaDalPlayer(mode: M.EditMode) {
  const p = store.doc;
  const m = p.media.find((x) => x.id === motore.playerMedia);
  if (!m) { avviso('Carica una sorgente nel Player (doppio clic nel contenitore)', 'info'); return; }
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
  if (!(m.hasVideo && tg.video) && !(m.hasAudio && tg.audio.length)) { avviso('Nessuna traccia di destinazione accesa (patch V / A1 / A2)', 'errore'); return; }
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

reg({ id: 'inserisci', nome: 'Inserisci dal Player', gruppo: 'Centralina', tasti: [',', '['], info: 'Montaggio a tre punti: la sorgente entra e sposta avanti il resto.', fn: () => montaDalPlayer('insert') });
reg({ id: 'sovrascrivi', nome: 'Sovrascrivi dal Player', gruppo: 'Centralina', tasti: ['.', ']'], info: 'Montaggio a tre punti: la sorgente copre quello che c\'è sotto.', fn: () => montaDalPlayer('overwrite') });
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
reg({ id: 'modoInserisci', nome: 'Modo inserisci / sovrascrivi', gruppo: 'Centralina', tasti: ['Insert', 'Alt+I'], fn: () => { modi.inserisci = !modi.inserisci; avviso(modi.inserisci ? 'Modo INSERISCI: le clip spostano il resto' : 'Modo SOVRASCRIVI: le clip coprono il resto', 'info'); store.emit('status'); } });
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
    avviso('Sorgente caricata nel Player allo stesso fotogramma', 'info');
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
  fn: () => { if (store.sel.size) store.edit('Sposta', (p) => M.moveClips(p, M.withLinked(p, store.sel), -1, 0, 'video', 'overwrite')); },
});
reg({
  id: 'nudgeDx', nome: 'Sposta la clip di un fotogramma a destra', gruppo: 'Centralina', tasti: ['Ctrl+ArrowRight'],
  fn: () => { if (store.sel.size) store.edit('Sposta', (p) => M.moveClips(p, M.withLinked(p, store.sel), 1, 0, 'video', 'overwrite')); },
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
  const vts = p.tracks.filter((t) => t.kind === 'video' && !t.lock);
  const ats = p.tracks.filter((t) => t.kind === 'audio' && !t.lock);
  // la prima traccia libera: il video da V1 in su, l'audio da A1 in giù
  const libera = (from: typeof vts, len: number) => {
    const ordine = from === vts ? [...from].reverse() : from;
    return ordine.find((t) => !p.clips.some((c) => c.track === t.id && c.start < f + len && end(c) > f)) ?? ordine[0];
  };
  const ids = store.edit('Generatore', (pp) => {
    const out: string[] = [];
    if (kind === 'bars') {
      const len = Math.round(rr * 10);
      const vt = trackId ?? libera(vts, len)?.id;
      const at = libera(ats, len)?.id;
      const l = uid('l');
      if (vt) { const c = newClip('bars', vt, f, len, { name: 'Barre colore SMPTE', gen: { bars: 'smpte' }, link: at ? l : undefined }); pp.clips.push(c); out.push(c.id); }
      if (at) { const c = newClip('tone', at, f, len, { name: 'Tono 1 kHz −18 dBFS', gen: { freq: 1000, level: -18 }, link: vt ? l : undefined }); pp.clips.push(c); out.push(c.id); }
    } else if (kind === 'countdown') {
      const len = Math.round(rr * 8);
      const vt = trackId ?? libera(vts, len)?.id;
      const at = libera(ats, len)?.id;
      const l = uid('l');
      if (vt) { const c = newClip('countdown', vt, f, len, { name: 'Countdown 8…2', link: at ? l : undefined }); pp.clips.push(c); out.push(c.id); }
      // il "2-pop": un fotogramma di tono quando compare il 2
      if (at) { const c = newClip('beep', at, f + len - Math.round(rr * 2), 1, { name: '2-pop', gen: { freq: 1000, level: -20 }, link: vt ? l : undefined }); pp.clips.push(c); out.push(c.id); }
    } else if (kind === 'title') {
      const len = Math.round(rr * 5);
      const vt = trackId ?? vts[0]?.id;
      if (vt) { const c = newClip('title', vt, f, len, { name: 'Titolo', gen: { title: { ...TITLE0 } } }); M.clearRange(pp, vt, f, f + len); pp.clips.push(c); out.push(c.id); }
    } else {
      const len = Math.round(rr * 5);
      const vt = trackId ?? libera(vts, len)?.id;
      if (vt) { const c = newClip('color', vt, f, len, { name: kind === 'nero' ? 'Nero' : 'Colore', gen: { color: kind === 'nero' ? '#000000' : '#1b3a8f' } }); M.clearRange(pp, vt, f, f + len); pp.clips.push(c); out.push(c.id); }
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
