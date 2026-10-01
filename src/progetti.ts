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
import { converti, esamina, normalizzaAttivo } from './media/normalizza';
import { dialogoApri, ESTENSIONI_DI, invoke, isTauri, nomeDaPercorso, salvaTesto, scegliFileBrowser, scegliMedia, type FileScelto, type TipoMedia } from './platform';
import { leggiPacchetto, pianoPacchetto, scriviPacchetto, type Sorgente } from './pacchetto';
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
export async function importaFile(lista: (FileScelto & { maniglia?: Maniglia })[], opzioni: { chiediFormato?: boolean; cartella?: string } = {}): Promise<MediaItem[]> {
  if (!lista.length) return [];
  const nuovi: MediaItem[] = [];
  const errori: string[] = [];
  const barra = avvisoLungo(`Importo ${lista.length} file…`);
  let i = 0;
  for (const f of lista) {
    barra.testo(`Importo ${++i}/${lista.length}: ${f.name}`);
    // frame rate o bitrate variabili: il file si rifà a velocità costante (se no in montaggio audio e video slittano)
    let sel: FileScelto & { maniglia?: Maniglia } = f;
    if (normalizzaAttivo() && !/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name)) {
      try {
        const v = await esamina(f);
        if (v) {
          const nome = f.name;
          barra.testo(`Converto ${nome}: ${v.motivo}…`);
          const conv = await converti(f, v, (k) => barra.testo(`Converto ${nome} (${v.motivo}): ${Math.round(k * 100)}%`));
          sel = conv;
          avviso(`🔧 ${nome}: ${v.motivo} (l'originale non è stato toccato)`, 'info', 3600);
        }
      } catch { sel = f; /* se la conversione non riesce si importa il file com'è */ }
    }
    const r = await importa(sel);
    if ('errore' in r) { errori.push(`${r.nome}: ${r.errore}`); continue; }
    if (opzioni.cartella) r.item.cartella = opzioni.cartella;
    nuovi.push(r.item);
    if (f.maniglia && sel === f) void idb('maniglie', 'put', r.item.id, f.maniglia);
    // nel browser, senza "maniglia" (Firefox, Safari, file trascinati, istantanee) i file piccoli si tengono
    // dentro il browser: così il progetto li ritrova alla prossima apertura senza ricollegarli
    else if (!isTauri && sel.file && sel.file.size <= FILE_LOCALE_MAX) void idb('file', 'put', r.item.id, sel.file);
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
export async function importaDialogo(cartella?: string, tipo?: TipoMedia) {
  const w = window as unknown as { showOpenFilePicker?: (o: object) => Promise<Maniglia[]> };
  if (!isTauri && w.showOpenFilePicker) {
    try {
      // dritti nella categoria aperta: da Musica si vedono solo gli audio, da Immagini solo le immagini
      const tutti: Record<string, string[]> = { 'video/*': ESTENSIONI_DI.video.map((e) => '.' + e), 'audio/*': ESTENSIONI_DI.audio.map((e) => '.' + e), 'image/*': ESTENSIONI_DI.image.map((e) => '.' + e) };
      const accept = tipo ? { [`${tipo}/*`]: tutti[`${tipo}/*`] } : tutti;
      const descr = { video: 'Video', audio: 'Musica e audio', image: 'Immagini' };
      const hs = await w.showOpenFilePicker({ multiple: true, types: [{ description: tipo ? descr[tipo] : 'Video, audio e immagini', accept }], excludeAcceptAllOption: false });
      const lista = await Promise.all(hs.map(async (hh) => { const f = await hh.getFile(); return { name: f.name, file: f, maniglia: hh }; }));
      return importaFile(lista, { cartella });
    } catch (e) {
      if ((e as Error).name === 'AbortError') return [];
    }
  }
  return importaFile(await scegliMedia(tipo), { cartella });
}

/** file lasciati cadere sulla finestra dal sistema */
export async function importaDaDrop(dt: DataTransfer, cartella?: string) {
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
  return importaFile(lista, { cartella });
}

// ——— i progetti recenti (la pagina iniziale) ———
export interface Recente { chiave: string; nome: string; path?: string; data: number; clip: number; durata: number; formato: string; miniatura?: string }
const RECENTI_MAX = 12;

export function recenti(): Recente[] {
  try { const l = JSON.parse(localStorage.getItem('dpv-recenti') ?? '[]') as Recente[]; return Array.isArray(l) ? l : []; } catch { return []; }
}
function scriviRecenti(l: Recente[]) { try { localStorage.setItem('dpv-recenti', JSON.stringify(l.slice(0, RECENTI_MAX))); } catch { /* spazio pieno: pazienza */ } }

export function dimenticaRecente(chiave: string) {
  scriviRecenti(recenti().filter((x) => x.chiave !== chiave));
  void idb('kv', 'delete', 'rec:' + chiave).catch(() => {});
}

/** una miniatura piccola dal primo video o dalla prima immagine del montaggio */
function miniaturaDi(p: Project): string | undefined {
  try {
    const clip = p.clips.filter((c) => c.kind === 'media' && c.media).sort((a, b) => a.start - b.start).find((c) => { const rt = mediaRT(c.media!); return !!rt?.poster; });
    const src = clip ? (mediaRT(clip.media!)?.poster as (CanvasImageSource & { width: number; height: number }) | undefined) : undefined;
    if (!src || !src.width) return undefined;
    const cv = document.createElement('canvas');
    cv.width = 192; cv.height = 108;
    const x = cv.getContext('2d')!;
    x.fillStyle = '#111'; x.fillRect(0, 0, 192, 108);
    const k = Math.min(192 / src.width, 108 / src.height);
    x.drawImage(src, (192 - src.width * k) / 2, (108 - src.height * k) / 2, src.width * k, src.height * k);
    return cv.toDataURL('image/jpeg', 0.7);
  } catch { return undefined; }
}

/** ricorda un progetto salvato o aperto: in cima all'elenco. Nel browser tiene anche una copia (per riaprirlo dalla pagina iniziale). */
export function registraRecente(p: Project, path?: string, testo?: string) {
  const chiave = path ?? 'b:' + (p.name || 'montaggio');
  const r = fps0(p);
  const voce: Recente = {
    chiave, nome: p.name || 'Montaggio senza nome', path, data: Date.now(), clip: p.clips.filter((c) => c.kind !== 'fx').length,
    durata: Math.max(0, ...p.clips.map((c) => c.start + c.len)) / r, formato: `${p.w}×${p.h} · ${Math.round(r * 100) / 100} fps`, miniatura: miniaturaDi(p),
  };
  scriviRecenti([voce, ...recenti().filter((x) => x.chiave !== chiave)]);
  if (!isTauri && testo) void idb('kv', 'put', 'rec:' + chiave, testo).catch(() => {});
}
const fps0 = (p: Project) => p.rate.num / p.rate.den;

/** apre un progetto della lista: dal percorso (app) o dalla copia tenuta nel browser */
export async function apriRecente(r: Recente): Promise<boolean> {
  if (store.dirty && store.doc.clips.length && !(await conferma('Apri progetto', 'Il montaggio attuale ha modifiche non salvate. Aprire un altro progetto?', 'Apri', 'Annulla'))) return false;
  if (r.path && isTauri) {
    try { await invoke<string>('progetto_leggi', { path: r.path }); } catch { avviso('Questo progetto non c\'è più dove l\'avevi salvato', 'errore', 4000); dimenticaRecente(r.chiave); return false; }
    await apriFile({ path: r.path });
    return true;
  }
  const testo = await idb<string>('kv', 'get', 'rec:' + r.chiave);
  let p: Project | null = null;
  try { p = testo ? valida(JSON.parse(testo)) : null; } catch { p = null; }
  if (!p) { avviso('Di questo progetto non ho più la copia: aprilo dal file (Apri progetto…)', 'info', 4500); return false; }
  percorsoProgetto = null;
  await carica(p);
  avviso(`📂 ${p.name}`, 'ok');
  return true;
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
  registraRecente(store.doc, isTauri ? r : undefined, isTauri ? undefined : serializza());
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

/** Apri: un progetto leggero (.dpv) o un pacchetto con tutti i file (.daprod) */
export async function apri() {
  if (store.dirty && store.doc.clips.length && !(await conferma('Apri progetto', 'Il montaggio attuale ha modifiche. Aprire un altro progetto?', 'Apri', 'Annulla'))) return;
  if (isTauri) {
    const [path] = await dialogoApri({ multiple: false, title: 'Progetto DaProd Video', estensioni: ['daprod', 'dpv', 'json'], mime: [] });
    if (path) await apriFile({ path });
    return;
  }
  const [file] = await scegliFileBrowser('.daprod,.dpv,.json,application/json,application/zip', false);
  if (file) await apriFile({ file });
}

/** apre un progetto da un percorso (app, anche col doppio clic sul file) o da un file (browser) */
export async function apriFile(s: Sorgente) {
  const nome = s.file?.name ?? nomeDaPercorso(s.path ?? '');
  if (/\.daprod$/i.test(nome)) { await apriPacchetto(s); return; }
  let p: Project | null = null;
  try {
    const testo = s.file ? await s.file.text() : await invoke<string>('progetto_leggi', { path: s.path });
    p = valida(JSON.parse(testo));
  } catch { p = null; }
  if (!p) { avviso('Questo file non è un progetto DaProd Video', 'errore'); return; }
  percorsoProgetto = s.path ?? null;
  await carica(p);
  registraRecente(p, s.path, s.path ? undefined : JSON.stringify(p));
  avviso(`📂 ${p.name}`, 'ok');
}

/**
 * Apre un pacchetto .daprod: il progetto e i suoi file vengono da dentro lo zip, così com'è (niente da
 * scompattare). Nell'app i media si leggono dal pacchetto stesso; nel browser sono pezzi del file scelto.
 */
async function apriPacchetto(s: Sorgente) {
  const barra = avvisoLungo('Apro il pacchetto…');
  try {
    const { testo, voci } = await leggiPacchetto(s);
    const p = valida(JSON.parse(testo));
    if (!p) throw new Error('dentro non c\'è un progetto DaProd Video');
    for (const m of p.media) {
      const v = m.pacchetto ? voci.get(m.pacchetto) : undefined;
      if (!v) continue;
      m.dentro = { off: v.off, len: v.len };
      if (s.path) m.path = s.path;
    }
    // Salva (Ctrl+S) non riscrive il pacchetto: chiede dove mettere il progetto leggero, che punta dentro il pacchetto
    percorsoProgetto = null;
    for (const m of store.doc.media) { chiudiMedia(m.id); dimenticaMedia(m.id); }
    motore.caricaPlayer(null);
    store.load(p);
    let mancano = 0;
    let i = 0;
    for (const m of p.media) {
      barra.testo(`Apro il pacchetto: ${++i}/${p.media.length} ${m.name}`);
      if (!m.dentro) { mancano++; continue; }
      if (s.path) { const r = await apriMedia(m, { path: s.path }); if (r.stato !== 'ok') mancano++; continue; }
      const file = new File([s.file!.slice(m.dentro.off, m.dentro.off + m.dentro.len)], m.name, { lastModified: m.lastModified || Date.now() });
      const r = await apriMedia(m, { file });
      if (r.stato !== 'ok') { mancano++; continue; }
      // nel browser i file piccoli si tengono (come quando si importano): alla prossima apertura ci sono ancora
      if (file.size <= FILE_LOCALE_MAX) void idb('file', 'put', m.id, file);
    }
    store.dirty = false;
    store.emit('doc');
    motore.ridisegna();
    avviso(`📦 ${p.name}: aperto dal pacchetto${mancano ? ` (${mancano} file mancano)` : ', con tutti i suoi file'}`, mancano ? 'info' : 'ok', 3500);
  } catch (e) {
    avviso('Il pacchetto non si apre: ' + (e instanceof Error ? e.message : String(e)), 'errore', 5000);
  } finally {
    barra.chiudi();
  }
}

/** il pacchetto .daprod: il progetto e tutti i suoi file in un file solo (zip), da riaprire identico altrove */
export async function salvaPacchetto() {
  const p = store.doc;
  const d = dialogo('Salva il pacchetto .daprod');
  const solo = h('input', { type: 'checkbox' }) as HTMLInputElement;
  const peso = h('b', null, '…');
  const quanti = h('span', null, '');
  const mancano = h('p', { class: 'nota' });
  const misura = async () => {
    const pi = await pianoPacchetto(solo.checked);
    peso.textContent = mb(pi.byte);
    quanti.textContent = `${pi.voci.length} file`;
    mancano.textContent = pi.mancano.length ? `⚠ ${pi.mancano.length} file non collegati restano fuori: ${pi.mancano.map((m) => m.name).slice(0, 4).join(', ')}${pi.mancano.length > 4 ? '…' : ''}` : '';
    return pi;
  };
  solo.addEventListener('change', () => void misura());
  d.corpo.append(
    h('p', null, 'Il progetto e tutti i suoi file (video, musiche, immagini) in un file solo. Portalo su un altro computer e aprilo con DaProd Video: ritrovi il montaggio identico. È uno zip: i file dentro restano uguali (niente perdita di qualità) e si aprono direttamente da lì.'),
    h('p', null, quanti, ' · ', peso),
    h('label', { class: 'riga-spunta' }, solo, ' Solo i file usati nel montaggio (il contenitore si alleggerisce)'),
    mancano);
  void misura();
  const via = h('button', { class: 'btn', on: { click: () => d.chiudi() } }, 'Annulla');
  const vai = h('button', { class: 'btn primario', on: {
    click: async () => {
      const pi = await misura();
      d.chiudi();
      const nomeFile = (p.name || 'montaggio').replace(/[\\/:*?"<>|]/g, '_') + '.daprod';
      let stop = false;
      const barra = avvisoLungo('Preparo il pacchetto…', () => { stop = true; });
      try {
        const r = await scriviPacchetto(nomeFile, pi, solo.checked, (f, t, cosa) => barra.testo(`📦 ${Math.floor((f / Math.max(1, t)) * 100)}% · ${cosa}`), () => stop);
        if (r) avviso(`📦 Pacchetto salvato: ${nomeDaPercorso(r)} (${mb(pi.byte)})`, 'ok', 4000);
      } catch (e) {
        avviso(stop ? 'Pacchetto annullato' : 'Il pacchetto non si salva: ' + (e instanceof Error ? e.message : String(e)), stop ? 'info' : 'errore', 5000);
      } finally {
        barra.chiudi();
      }
    },
  } }, '📦 Salva il pacchetto');
  d.piede.append(via, vai);
}

const mb = (b: number) => (b >= 1 << 30 ? (b / (1 << 30)).toFixed(2).replace('.', ',') + ' GB' : Math.max(0.1, b / (1 << 20)).toFixed(1).replace('.', ',') + ' MB');

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

/** barra d'avanzamento in basso per le operazioni lunghe (con annulla, se serve) */
export function avvisoLungo(t: string, annulla?: () => void) {
  const el = h('div', { class: 'avviso-lungo' }, h('span', { class: 'led acceso lampeggia' }), h('span', { class: 'testo' }, t),
    annulla ? h('button', { class: 'btn piccolo', on: { click: annulla } }, 'Annulla') : null);
  document.body.appendChild(el);
  return {
    testo: (x: string) => { el.querySelector('.testo')!.textContent = x; },
    chiudi: () => el.remove(),
  };
}

export { s2f };
