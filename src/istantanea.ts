// L'istantanea: fotografa il fotogramma sotto il cursore e lo mette nel contenitore come immagine.
// Dal Recorder si fotografa il montaggio intero (titoli, trasparenze, effetti compresi), dal Player la sorgente.
// L'immagine si trascina nella timeline e si allunga quanto si vuole; con Shift+P entra da sola al cursore
// come fermo immagine.
import { VideoSampleSink } from 'mediabunny';
import { store } from './core/store';
import { motore } from './motore';
import { fotogrammaPng } from './export/esporta';
import { importaFile } from './progetti';
import { mediaRT } from './media/libreria';
import { pianoVideo } from './render/piano';
import { frameToTc, fps, s2f } from './core/timecode';
import { bersagli } from './azioni';
import * as M from './core/montaggio';
import { invoke, isTauri } from './platform';
import { avviso } from './ui/dom';

/** il fotogramma di una sorgente al tempo t, a piena risoluzione, già girato per il verso giusto */
async function fotogrammaSorgente(mediaId: string, t: number): Promise<Blob | null> {
  const r = mediaRT(mediaId);
  if (!r?.v || !r.vDecodable) return null;
  const s = await new VideoSampleSink(r.v).getSample(t);
  if (!s) return null;
  try {
    const w = s.rotation % 180 ? s.displayHeight : s.displayWidth;
    const h = s.rotation % 180 ? s.displayWidth : s.displayHeight;
    const tela = new OffscreenCanvas(w, h);
    const ctx = tela.getContext('2d')!;
    s.drawWithFit(ctx, { fit: 'contain' });
    return await tela.convertToBlob({ type: 'image/png' });
  } finally {
    s.close();
  }
}

/** lampo bianco sul monitor, come il flash di una macchina fotografica */
function lampo(quale: 'player' | 'recorder') {
  const el = document.querySelector(`.monitor.${quale} .schermo`);
  if (!el) return;
  el.classList.remove('lampo');
  void (el as HTMLElement).offsetWidth;
  el.classList.add('lampo');
}

/** scrive l'immagine nella cartella dell'app (solo Tauri): ritorna il percorso da ricordare nel progetto */
async function salvaSulDisco(nome: string, blob: Blob): Promise<string | undefined> {
  if (!isTauri) return undefined;
  try {
    const path = await invoke<string>('istantanea_percorso', { name: nome });
    const id = await invoke<number>('export_apri', { path });
    await invoke('export_scrivi', new Uint8Array(await blob.arrayBuffer()), { headers: { 'x-id': String(id), 'x-pos': '0' } });
    await invoke('export_chiudi', { id });
    return path;
  } catch {
    return undefined;
  }
}

export async function istantanea(opzioni: { fermo?: boolean } = {}) {
  const p = store.doc;
  motore.stop();
  const dalPlayer = motore.attivo === 'player' && !!motore.playerMedia && !opzioni.fermo;
  let blob: Blob | null = null;
  let nome: string;
  if (dalPlayer) {
    const m = p.media.find((x) => x.id === motore.playerMedia)!;
    if (m.type !== 'video') { avviso('Nel Player c\'è già un\'immagine (o solo audio)', 'info'); return; }
    const rate = { num: Math.round((m.fps || fps(p.rate)) * 1000), den: 1000 };
    const tc = frameToTc(s2f(motore.playerT, rate), rate).replace(/[:;]/g, '.');
    nome = `Istantanea ${m.name.replace(/\.[^.]+$/, '')} ${tc}.png`;
    lampo('player');
    blob = await fotogrammaSorgente(m.id, motore.playerT);
  } else {
    const f = Math.floor(store.head + 1e-6);
    if (!pianoVideo(p, f).length) { avviso('Sotto il cursore non c\'è immagine da fotografare', 'info'); return; }
    nome = `Istantanea ${frameToTc(f, p.rate, p.drop).replace(/[:;]/g, '.')}.png`;
    lampo('recorder');
    blob = await fotogrammaPng(p, f);
  }
  if (!blob) { avviso('Il fotogramma non si legge', 'errore'); return; }
  const file = new File([blob], nome, { type: 'image/png', lastModified: Date.now() });
  const path = await salvaSulDisco(nome, blob);
  const [item] = await importaFile([{ name: nome, file, path }], { chiediFormato: false });
  if (!item) return;
  if (!opzioni.fermo) {
    avviso('📸 Istantanea nel contenitore: trascinala nella timeline e allungala dal bordo quanto vuoi', 'ok', 3500);
    return;
  }
  // fermo immagine: due secondi dell'istantanea entrano al cursore, il resto scorre avanti
  const f = Math.round(store.head);
  const len = Math.round(fps(p.rate) * 2);
  const tg = bersagli();
  if (!tg.video) { avviso('Accendi la traccia video di destinazione (patch V) per il fermo immagine', 'info'); return; }
  const ids = store.edit('Fermo immagine', (pp) => M.placeSource(pp, { mediaId: item.id, srcIn: 0, srcOut: 2 }, f, f + len, { video: tg.video, audio: [] }, 'insert'));
  store.select(ids);
  avviso('❄ Fermo immagine: due secondi al cursore (allungalo dal bordo)', 'ok', 3000);
}
