// Progetti: nuovo, apri, salva, autosalvataggio, importazione dei file e ricollegamento dei media.
// Nell'app (Tauri) i media si ritrovano dal percorso; nel browser dalle "maniglie" dei file che Chrome
// permette di ricordare (basta un clic per ridare il permesso).
import { store } from './core/store';
import type { MediaItem, Project } from './core/tipi';
import { FORMATI } from './core/tipi';
import { ALTEZZA, MASTER0, newProject } from './core/progetto';
import { migraBlocchi } from './core/blocchi';
import { apri as apriMedia, chiudi as chiudiMedia, importa, mediaRT } from './media/libreria';
import { dimenticaMedia } from './media/fotogrammi';
import { apriProgetto, invoke, isTauri, nomeDaPercorso, salvaTesto, scegliMedia, type FileScelto } from './platform';
import { avviso, conferma, dialogo, h } from './ui/dom';
import { motore } from './motore';
import { s2f } from './core/timecode';

export let percorsoProgetto: string | null = null;

/** fino a quanto un file si tiene dentro il browser (IndexedDB) quando non c'è altro modo di ritrovarlo */
const FILE_LOCALE_MAX = 300 * 1024 * 1024;

// ——— IndexedDB (solo browser): autosalvataggio e maniglie dei file ———
function db(): Promise<IDBDatabase> {
  return new Promise((ok, ko) => {
    const r = indexedDB.open('daprod-video', 2);
    r.onupgradeneeded = () => {
      for (const n of ['kv', 'maniglie', 'file']) if (!r.result.objectStoreNames.contains(n)) r.result.createObjectStore(n);
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
}
async function idb<T>(store: 'kv' | 'maniglie' | 'file', op: 'get' | 'put' | 'delete', key: string, val?: unknown): Promise<T | undefined> {
  try {
    const d = await db();
    return await new Promise((ok, ko) => {
      const tx = d.transaction(store, op === 'get' ? 'readonly' : 'readwrite');
      const s = tx.objectStore(store);
      const r = op === 'get' ? s.get(key) : op === 'put' ? s.put(val, key) : s.delete(key);
      r.onsuccess = () => ok(r.result as T);
      r.onerror = () => ko(r.error);
    });
  } catch { return undefined; }
}

type Maniglia = FileSystemFileHandle & { queryPermission?: (o: object) => Promise<string>; requestPermission?: (o: object) => Promise<string> };

// ——— importazione ———
export async function importaFile(lista: (FileScelto & { maniglia?: Maniglia })[], opzioni: { chiediFormato?: boolean } = {}): Promise<MediaItem[]> {
  if (!lista.length) return [];
  const nuovi: MediaItem[] = [];
  const errori: string[] = [];
  const barra = avvisoLungo(`Importo ${lista.length} file…`);
  let i = 0;
  for (const f of lista) {
    barra.testo(`Importo ${++i}/${lista.length}: ${f.name}`);
    const r = await importa(f);
    if ('errore' in r) { errori.push(`${r.nome}: ${r.errore}`); continue; }
    nuovi.push(r.item);
    if (f.maniglia) void idb('maniglie', 'put', r.item.id, f.maniglia);
    // nel browser, senza "maniglia" (Firefox, Safari, file trascinati, istantanee) i file piccoli si tengono
    // dentro il browser: così il progetto li ritrova alla prossima apertura senza ricollegarli
    else if (!isTauri && f.file && f.file.size <= FILE_LOCALE_MAX) void idb('file', 'put', r.item.id, f.file);
  }
  barra.chiudi();
  if (nuovi.length) {
    store.edit(`Importa ${nuovi.length} file`, (p) => { p.media.push(...nuovi); });
    // il primo video decide il formato del progetto se il montaggio è ancora vuoto
    const primo = nuovi.find((m) => m.type === 'video' && m.width);
    if (primo && opzioni.chiediFormato !== false && !store.doc.clips.length && store.doc.media.length === nuovi.length) void propostaFormato(primo);
    avviso(`${nuovi.length} file nel contenitore`, 'ok');
    if (!motore.playerMedia) motore.caricaPlayer(nuovi[0].id);
  }
  if (errori.length) {
    const d = dialogo('Alcuni file non si aprono');
    d.corpo.append(h('p', null, 'Questi file non sono stati importati:'), h('ul', { class: 'lista-errori' }, errori.map((e) => h('li', null, e))),
      h('p', { class: 'nota' }, 'Formati che vanno: MP4, MOV, MKV, WebM, MTS/M2TS (AVCHD), MP3, WAV, AAC, FLAC, OGG, immagini. I codec dipendono dal sistema: H.264, H.265/HEVC (se il sistema lo decodifica), VP8/VP9, AV1, ProRes no.'));
    d.piede.append(h('button', { class: 'btn primario', on: { click: d.chiudi } }, 'OK'));
  }
  return nuovi;
}

async function propostaFormato(m: MediaItem) {
  const p = store.doc;
  const w = m.rotation % 180 ? m.height : m.width, hh = m.rotation % 180 ? m.width : m.height;
  const rr = Math.round(m.fps * 100) / 100;
  const rate = Math.abs(rr - 29.97) < 0.02 ? { num: 30000, den: 1001 } : Math.abs(rr - 59.94) < 0.02 ? { num: 60000, den: 1001 } : Math.abs(rr - 23.976) < 0.02 ? { num: 24000, den: 1001 } : { num: Math.round(rr) || 25, den: 1 };
  if (w === p.w && hh === p.h && rate.num / rate.den === p.rate.num / p.rate.den) return;
  const ok = await conferma('Formato del progetto', `Il primo video è ${w}×${hh} a ${rr} fps. Imposto il progetto uguale?`, 'Sì, uguale al video', 'Tengo ' + p.w + '×' + p.h);
  if (!ok) return;
  store.edit('Formato dal video', (pp) => { pp.w = w; pp.h = hh; pp.rate = rate; pp.drop = rate.den === 1001 && Math.round(rate.num / rate.den) === 30; });
}

/** il pulsante "Importa": finestra di sistema (app) o del browser */
export async function importaDialogo() {
  const w = window as unknown as { showOpenFilePicker?: (o: object) => Promise<Maniglia[]> };
  if (!isTauri && w.showOpenFilePicker) {
    try {
      const hs = await w.showOpenFilePicker({ multiple: true, types: [{ description: 'Video, audio e immagini', accept: { 'video/*': ['.mp4', '.mov', '.m4v', '.mkv', '.webm', '.mts', '.m2ts', '.ts'], 'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.opus', '.flac', '.ac3'], 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif'] } }], excludeAcceptAllOption: false });
      const lista = await Promise.all(hs.map(async (hh) => { const f = await hh.getFile(); return { name: f.name, file: f, maniglia: hh }; }));
      return importaFile(lista);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return [];
    }
  }
  return importaFile(await scegliMedia());
}

/** file lasciati cadere sulla finestra dal sistema */
export async function importaDaDrop(dt: DataTransfer) {
  const lista: (FileScelto & { maniglia?: Maniglia })[] = [];
  const items = [...dt.items].filter((i) => i.kind === 'file');
  for (const it of items) {
    const f = it.getAsFile();
    if (!f) continue;
    let maniglia: Maniglia | undefined;
    const g = (it as unknown as { getAsFileSystemHandle?: () => Promise<Maniglia | null> }).getAsFileSystemHandle;
    if (g) { try { maniglia = (await g.call(it)) ?? undefined; } catch { /* niente */ } }
    lista.push({ name: f.name, file: f, maniglia });
  }
  return importaFile(lista);
}

// ——— salvataggio ———
function serializza(): string {
  const p = store.doc;
  p.saved = Date.now();
  return JSON.stringify(p);
}

export async function salva(come = false) {
  const p = store.doc;
  const nome = (p.name || 'montaggio').replace(/[\\/:*?"<>|]/g, '_') + '.dpv';
  const r = await salvaTesto(nome, serializza(), 'dpv', come ? undefined : percorsoProgetto ?? undefined);
  if (!r) return;
  if (isTauri) percorsoProgetto = r;
  store.dirty = false;
  avviso(`💾 Salvato: ${nomeDaPercorso(r)}`, 'ok');
  store.emit('status');
}

export async function autosalva() {
  if (!store.dirty && store.doc.saved) return;
  const testo = serializza();
  try {
    if (isTauri) await invoke('autosalva', { text: testo });
    else await idb('kv', 'put', 'autosalvataggio', testo);
  } catch { /* spazio pieno o permessi: si riprova al prossimo giro */ }
}

function valida(o: unknown): Project | null {
  const p = o as Project;
  if (!p || p.format !== 'daprod-video' || !Array.isArray(p.tracks) || !Array.isArray(p.clips)) return null;
  for (const m of p.media) { m.t0 ??= 0; m.markIn ??= null; m.markOut ??= null; }
  for (const c of p.clips) { c.opKeys ??= []; c.gainKeys ??= []; c.speed ??= 1; }
  // le versioni di prima: tracce audio basse e niente ritocchi finali
  for (const t of p.tracks) {
    if (t.kind === 'audio' && t.height === 46) t.height = ALTEZZA.audio;
    if (t.kind === 'video' && t.height === 58) t.height = ALTEZZA.video;
  }
  p.master = { ...MASTER0, ...(p.master ?? {}) };
  // dalla 1.0.5: gli FX stanno sulle tracce video (la corsia a parte della 1.0.4 sparisce), e le transizioni delle
  // clip video diventano blocchetti
  migraBlocchi(p);
  return p;
}

export async function apri() {
  if (store.dirty && store.doc.clips.length && !(await conferma('Apri progetto', 'Il montaggio attuale ha modifiche. Aprire un altro progetto?', 'Apri', 'Annulla'))) return;
  const f = await apriProgetto();
  if (!f) return;
  let p: Project | null = null;
  try { p = valida(JSON.parse(f.text)); } catch { p = null; }
  if (!p) { avviso('Questo file non è un progetto DaProd Video', 'errore'); return; }
  percorsoProgetto = f.path ?? null;
  await carica(p);
  avviso(`📂 ${p.name}`, 'ok');
}

export async function nuovo(fmt: { w: number; h: number; rate: { num: number; den: number }; drop: boolean } = FORMATI[0]) {
  if (store.dirty && store.doc.clips.length && !(await conferma('Nuovo progetto', 'Il montaggio attuale ha modifiche non salvate. Ricominciare?', 'Nuovo', 'Annulla'))) return;
  // i file tenuti nel browser per il montaggio vecchio non servono più: si libera lo spazio
  for (const m of store.doc.media) { chiudiMedia(m.id); dimenticaMedia(m.id); void idb('file', 'delete', m.id); }
  percorsoProgetto = null;
  motore.caricaPlayer(null);
  store.load(newProject(fmt));
  store.doc.saved = 0;
}

/** carica un progetto e riapre i suoi media */
export async function carica(p: Project) {
  for (const m of store.doc.media) { chiudiMedia(m.id); dimenticaMedia(m.id); }
  motore.caricaPlayer(null);
  store.load(p);
  await riapriMedia(false);
}

/** riapre i media del progetto: dai percorsi (app) o dalle maniglie ricordate (browser) */
export async function riapriMedia(conGesto: boolean): Promise<number> {
  const p = store.doc;
  let mancano = 0;
  for (const m of p.media) {
    if (mediaRT(m.id)?.stato === 'ok') continue;
    if (isTauri && m.path) {
      const r = await apriMedia(m, { path: m.path });
      if (r.stato !== 'ok') mancano++;
      continue;
    }
    const hh = await idb<Maniglia>('maniglie', 'get', m.id);
    if (hh) {
      try {
        let perm = (await hh.queryPermission?.({ mode: 'read' })) ?? 'granted';
        if (perm !== 'granted' && conGesto) perm = (await hh.requestPermission?.({ mode: 'read' })) ?? 'denied';
        if (perm === 'granted') {
          const file = await hh.getFile();
          const r = await apriMedia(m, { file });
          if (r.stato === 'ok') continue;
        }
      } catch { /* file spostato */ }
    }
    const tenuto = await idb<Blob>('file', 'get', m.id);
    if (tenuto) {
      const file = tenuto instanceof File ? tenuto : new File([tenuto], m.name, { type: tenuto.type });
      const r = await apriMedia(m, { file });
      if (r.stato === 'ok') continue;
    }
    mancano++;
  }
  store.emit('doc');
  motore.ridisegna();
  return mancano;
}

/** ricollega a mano i file mancanti: si scelgono i file, si abbinano per nome (e dimensione) */
export async function ricollega() {
  const mancanti = store.doc.media.filter((m) => mediaRT(m.id)?.stato !== 'ok');
  if (!mancanti.length) { avviso('Tutti i file sono collegati', 'ok'); return; }
  const n0 = await riapriMedia(true);
  if (!n0) { avviso('File ricollegati', 'ok'); return; }
  const scelti = await scegliMedia();
  let ok = 0;
  for (const m of store.doc.media) {
    if (mediaRT(m.id)?.stato === 'ok') continue;
    const f = scelti.find((s) => s.name === m.name && (!s.file || !m.size || s.file.size === m.size)) ?? scelti.find((s) => s.name === m.name);
    if (!f) continue;
    const r = await apriMedia(m, { file: f.file, path: f.path });
    if (r.stato === 'ok') { ok++; if (f.path) m.path = f.path; }
  }
  store.emit('doc');
  motore.ridisegna();
  avviso(`${ok} file ricollegati${store.doc.media.some((m) => mediaRT(m.id)?.stato !== 'ok') ? ', altri ancora mancanti' : ''}`, ok ? 'ok' : 'info');
}

/** all'avvio: riprende l'ultimo montaggio dall'autosalvataggio */
export async function riprendi(): Promise<boolean> {
  let testo: string | undefined;
  try {
    testo = isTauri ? await invoke<string>('autosalvataggio_leggi') : await idb<string>('kv', 'get', 'autosalvataggio');
  } catch { testo = undefined; }
  if (!testo) return false;
  let p: Project | null = null;
  try { p = valida(JSON.parse(testo)); } catch { p = null; }
  if (!p || (!p.clips.length && !p.media.length)) return false;
  store.load(p);
  store.dirty = false;
  const mancano = await riapriMedia(false);
  if (mancano) {
    avviso(`Montaggio ripreso. ${mancano} file da ricollegare: File → Ricollega media`, 'info', 6000);
    document.dispatchEvent(new CustomEvent('dpv:mancano', { detail: mancano }));
  } else avviso('Montaggio ripreso da dove eri rimasto', 'ok', 2500);
  return true;
}

/** togli un media dal contenitore (e le sue clip, se si conferma) */
export async function togliMedia(id: string) {
  const usi = store.doc.clips.filter((c) => c.media === id).length;
  if (usi && !(await conferma('Togli dal contenitore', `Il file è usato da ${usi} clip nella timeline. Togliere anche quelle?`, 'Togli tutto', 'Annulla'))) return;
  store.edit('Togli media', (p) => { p.media = p.media.filter((m) => m.id !== id); p.clips = p.clips.filter((c) => c.media !== id); });
  if (motore.playerMedia === id) motore.caricaPlayer(null);
  void idb('maniglie', 'delete', id);
  void idb('file', 'delete', id);
}

/** barra d'avanzamento in basso per le operazioni lunghe */
export function avvisoLungo(t: string) {
  const el = h('div', { class: 'avviso-lungo' }, h('span', { class: 'led acceso lampeggia' }), h('span', { class: 'testo' }, t));
  document.body.appendChild(el);
  return {
    testo: (x: string) => { el.querySelector('.testo')!.textContent = x; },
    chiudi: () => el.remove(),
  };
}

export { s2f };
