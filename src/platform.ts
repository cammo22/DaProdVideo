// Dove stiamo girando: app Tauri (Windows, Mac, Android) o browser (GitHub Pages, versione prova).
// Nell'app i file si leggono e si scrivono dal lato Rust (percorsi veri, progetti che si riaprono da soli);
// nel browser si usa quello che il browser offre.

export const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
export const isAndroid = /Android/i.test(navigator.userAgent);
export const isMac = /Mac OS X|Macintosh/.test(navigator.userAgent) && !isAndroid;
export const isTouch = matchMedia('(pointer: coarse)').matches;
export const edizione = isTauri ? (isAndroid ? 'Android' : isMac ? 'Mac' : 'Desktop') : 'Prova web';

type Invoke = <T>(cmd: string, args?: Record<string, unknown> | Uint8Array, opts?: { headers?: Record<string, string> }) => Promise<T>;
let _invoke: Invoke | null = null;

export async function invoke<T>(cmd: string, args?: Record<string, unknown> | Uint8Array, opts?: { headers?: Record<string, string> }): Promise<T> {
  if (!_invoke) {
    const core = await import('@tauri-apps/api/core');
    _invoke = core.invoke as Invoke;
  }
  return _invoke<T>(cmd, args as any, opts as any);
}

export interface FileScelto { name: string; path?: string; file?: File }

const ESTENSIONI = ['mp4', 'm4v', 'mov', 'mkv', 'webm', 'mts', 'm2ts', 'ts', 'mpg', 'mp3', 'wav', 'm4a', 'aac', 'ogg', 'oga', 'opus', 'flac', 'ac3', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif'];

/**
 * Il dialogo "apri" di Tauri. Su Android i filtri vanno per tipo MIME (le estensioni come .mts non le
 * conosce) e chiudere il selettore senza scegliere dà un errore: qui diventa semplicemente "niente".
 */
export async function dialogoApri(o: { multiple: boolean; title: string; estensioni: string[]; mime: string[] }): Promise<string[]> {
  const { open } = await import('@tauri-apps/plugin-dialog');
  try {
    const filters = isAndroid
      ? (o.mime.length ? [{ name: o.title, extensions: o.mime }] : [])
      : [{ name: o.title, extensions: o.estensioni }, { name: 'Tutti i file', extensions: ['*'] }];
    const r = await open({ multiple: o.multiple, title: o.title, filters });
    if (!r) return [];
    return Array.isArray(r) ? r : [r];
  } catch {
    return [];
  }
}

/** il dialogo "salva" di Tauri (su Android: crea il documento dove sceglie l'utente) */
export async function dialogoSalva(nome: string, estensione: string, mime: string): Promise<string | null> {
  const { save } = await import('@tauri-apps/plugin-dialog');
  try {
    const filters = isAndroid ? [{ name: estensione.toUpperCase(), extensions: [mime] }] : [{ name: estensione.toUpperCase(), extensions: [estensione] }];
    return (await save({ title: 'Salva', defaultPath: nome, filters })) ?? null;
  } catch {
    return null;
  }
}

/** sceglie i file da importare: nell'app con il dialogo di sistema (percorsi), nel browser con <input type=file> */
export async function scegliMedia(): Promise<FileScelto[]> {
  if (isTauri) {
    const list = await dialogoApri({ multiple: true, title: 'Importa nel contenitore', estensioni: ESTENSIONI, mime: ['video/*', 'audio/*', 'image/*'] });
    return list.map((p) => ({ name: nomeDaPercorso(p), path: p }));
  }
  return scegliFileBrowser('video/*,audio/*,image/*,.mts,.m2ts,.mkv,.mov,.ac3,.flac', true).then((fs) => fs.map((f) => ({ name: f.name, file: f })));
}

/** il nome del file da un percorso o da un indirizzo content:// di Android ("video:1234" → "video 1234") */
export function nomeDaPercorso(p: string): string {
  let pulito = p;
  try { pulito = decodeURIComponent(p); } catch { /* resta com'è */ }
  pulito = pulito.replace(/\?.*$/, '');
  const ultimo = pulito.split(/[\\/]/).pop() || p;
  return ultimo.replace(/^(\w+):(?!\\)/, '$1 ');
}

export function scegliFileBrowser(accept: string, multiple: boolean): Promise<File[]> {
  return new Promise((res) => {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = accept;
    i.multiple = multiple;
    i.style.display = 'none';
    document.body.appendChild(i);
    i.addEventListener('change', () => { res([...(i.files ?? [])]); i.remove(); });
    i.addEventListener('cancel', () => { res([]); i.remove(); });
    i.click();
  });
}

/** apertura di un file di progetto .dpv: ritorna testo e (nell'app) percorso */
export async function apriProgetto(): Promise<{ text: string; path?: string; name: string } | null> {
  if (isTauri) {
    const [p] = await dialogoApri({ multiple: false, title: 'Progetto DaProd Video', estensioni: ['dpv', 'json'], mime: [] });
    if (!p) return null;
    const text = await invoke<string>('progetto_leggi', { path: p });
    return { text, path: p, name: nomeDaPercorso(p) };
  }
  const [f] = await scegliFileBrowser('.dpv,.json,application/json', false);
  if (!f) return null;
  return { text: await f.text(), name: f.name };
}

/** salva un file di testo (progetto, EDL): nell'app sul disco, nel browser come scaricamento */
export async function salvaTesto(nome: string, testo: string, estensione: string, percorso?: string): Promise<string | null> {
  if (isTauri) {
    let p = percorso;
    if (!p) p = (await dialogoSalva(nome, estensione, 'text/plain')) ?? undefined;
    if (!p) return null;
    await invoke('progetto_scrivi', { path: p, text: testo });
    return p;
  }
  scarica(new Blob([testo], { type: 'text/plain' }), nome);
  return nome;
}

export function scarica(blob: Blob, nome: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 60_000);
}

/** apre un link esterno (nell'app nel browser di sistema) */
export async function apriLink(url: string) {
  if (isTauri) {
    await invoke('apri_link', { url }).catch(() => window.open(url, '_blank'));
  } else window.open(url, '_blank', 'noopener');
}

/** schermo intero: nell'app la finestra vera, nel browser la pagina */
export async function schermoIntero() {
  if (isTauri && !isAndroid) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const w = getCurrentWindow();
    await w.setFullscreen(!(await w.isFullscreen())).catch(() => {});
    return;
  }
  if (document.fullscreenElement) await document.exitFullscreen();
  else await document.documentElement.requestFullscreen().catch(() => {});
}
