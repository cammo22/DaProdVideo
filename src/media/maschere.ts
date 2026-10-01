// Le maschere dello sfondo tolto con l'AI: per ogni ripresa tanti fotogrammi in bianco e nero (bianco = soggetto),
// uno ogni tot decimi di secondo. Stanno in memoria, a nome della "firma" dei parametri (così una clip tagliata in due
// o copiata usa le stesse), e finiscono anche in una cache sul computer (IndexedDB) per non rifarle ogni volta che
// si riapre il progetto. Il compositore chiede la maschera di un istante e ne riceve due (prima e dopo) da mescolare.
import type { Project } from '../core/tipi';
import { campioneAl } from '../core/sfondo';

export interface Maschere {
  firma: string;
  w: number;
  h: number;
  /** il primo istante (secondi della sorgente), la distanza fra due maschere, quante sono */
  t0: number;
  dt: number;
  n: number;
  hz: number;
  /** una maschera (w×h byte, 255 = soggetto) per campione */
  dati: Uint8Array[];
}

const mappa = new Map<string, Maschere>();
const cambiato = () => { if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent('dpv:maschere')); };

export const maschereDi = (firma?: string) => (firma ? mappa.get(firma) : undefined);

export function impostaMaschere(m: Maschere, salva = true) {
  mappa.set(m.firma, m);
  if (salva) void salvaCache(m);
  cambiato();
}

export function togliMaschere(firma: string) {
  if (mappa.delete(firma)) cambiato();
}

/** due maschere fra cui cade l'istante t (secondi della sorgente) e quanto verso la seconda */
export function maschereAl(firma: string | undefined, t: number): { a: Uint8Array; b: Uint8Array; k: number; i: number; w: number; h: number; m: Maschere } | null {
  const m = maschereDi(firma);
  if (!m || !m.n) return null;
  const c = campioneAl(t, m.t0, m.dt, m.n);
  return { a: m.dati[c.i], b: m.dati[c.j], k: c.k, i: c.i, w: m.w, h: m.h, m };
}

/** butta le maschere che nessuna clip usa più (i progetti con tante timeline: si guardano tutte) */
export function potaMaschere(p: Project, tieni: string[] = []) {
  const uso = new Set<string>(tieni);
  const clips = [...p.clips, ...(p.sequenze ?? []).flatMap((s) => s.clips ?? [])];
  for (const c of clips) if (c.ritaglio?.firma) uso.add(c.ritaglio.firma);
  for (const k of [...mappa.keys()]) if (!uso.has(k)) mappa.delete(k);
}

// ——— la cache sul computer ———
const DB = 'dpv-maschere', ARCHIVIO = 'm', MAX_VOCI = 8;

function apriDb(): Promise<IDBDatabase | null> {
  return new Promise((ok) => {
    try {
      if (typeof indexedDB === 'undefined') { ok(null); return; }
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => { r.result.createObjectStore(ARCHIVIO, { keyPath: 'firma' }); };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => ok(null);
    } catch { ok(null); }
  });
}

const attesa = <T>(r: IDBRequest<T>) => new Promise<T | null>((ok) => { r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); });

interface Voce { firma: string; w: number; h: number; t0: number; dt: number; n: number; hz: number; buf: ArrayBuffer; quando: number }

export async function salvaCache(m: Maschere) {
  const db = await apriDb();
  if (!db) return;
  try {
    const tutto = new Uint8Array(m.w * m.h * m.n);
    m.dati.forEach((d, i) => tutto.set(d, i * m.w * m.h));
    const tx = db.transaction(ARCHIVIO, 'readwrite');
    const st = tx.objectStore(ARCHIVIO);
    st.put({ firma: m.firma, w: m.w, h: m.h, t0: m.t0, dt: m.dt, n: m.n, hz: m.hz, buf: tutto.buffer, quando: Date.now() } satisfies Voce);
    // le più vecchie fuori: ne restano poche
    const tutte = (await attesa(st.getAll())) as Voce[] | null;
    if (tutte && tutte.length > MAX_VOCI) {
      tutte.sort((a, b) => a.quando - b.quando);
      for (const v of tutte.slice(0, tutte.length - MAX_VOCI)) st.delete(v.firma);
    }
    await new Promise<void>((ok) => { tx.oncomplete = () => ok(); tx.onerror = () => ok(); tx.onabort = () => ok(); });
  } catch { /* la cache è un di più */ } finally { db.close(); }
}

export async function leggiCache(firma: string): Promise<Maschere | null> {
  const db = await apriDb();
  if (!db) return null;
  try {
    const v = (await attesa(db.transaction(ARCHIVIO, 'readonly').objectStore(ARCHIVIO).get(firma))) as Voce | null;
    if (!v) return null;
    const per = v.w * v.h, tutto = new Uint8Array(v.buf);
    if (tutto.length !== per * v.n) return null;
    return { firma: v.firma, w: v.w, h: v.h, t0: v.t0, dt: v.dt, n: v.n, hz: v.hz, dati: Array.from({ length: v.n }, (_, i) => tutto.slice(i * per, (i + 1) * per)) };
  } catch { return null; } finally { db.close(); }
}

export async function svuotaCache() {
  const db = await apriDb();
  if (!db) return;
  try { db.transaction(ARCHIVIO, 'readwrite').objectStore(ARCHIVIO).clear(); } catch { /* niente */ } finally { db.close(); }
}

/** a progetto aperto: per ogni clip col ritaglio senza maschere in memoria, si prova a rileggerle dalla cache */
export async function ripristinaMaschere(p: Project) {
  const clips = [...p.clips, ...(p.sequenze ?? []).flatMap((s) => s.clips ?? [])];
  const firme = new Set<string>();
  for (const c of clips) if (c.ritaglio?.firma && !mappa.has(c.ritaglio.firma)) firme.add(c.ritaglio.firma);
  for (const f of firme) {
    const m = await leggiCache(f);
    if (m && !mappa.has(f)) impostaMaschere(m, false);
  }
}
