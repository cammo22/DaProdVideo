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

/** sceglie i file da importare: nell'app con il dialogo di sistema (percorsi), nel browser con <input type=file> */
export async function scegliMedia(): Promise<FileScelto[]> {
  if (isTauri) {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const r = await open({ multiple: true, title: 'Importa nel contenitore', filters: [{ name: 'Media', extensions: ESTENSIONI }, { name: 'Tutti i file', extensions: ['*'] }] });
    if (!r) return [];
    const list = Array.isArray(r) ? r : [r];
    return list.map((p) => ({ name: nomeDaPercorso(p), path: p }));
  }
  return scegliFileBrowser('video/*,audio/*,image/*,.mts,.m2ts,.mkv,.mov,.ac3,.flac', true).then((fs) => fs.map((f) => ({ name: f.name, file: f })));
}

/** il nome del file da un percorso o da un indirizzo content:// di Android */
export function nomeDaPercorso(p: string): string {
  const pulito = decodeURIComponent(p).replace(/\?.*$/, '');
  return pulito.split(/[\\/:]/).pop() || p;
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
    const { open } = await import('@tauri-apps/plugin-dialog');
    const p = await open({ multiple: false, title: 'Apri progetto', filters: [{ name: 'Progetto DaProd Video', extensions: ['dpv', 'json'] }] });
    if (!p || Array.isArray(p)) return null;
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
    if (!p) {
      const { save } = await import('@tauri-apps/plugin-dialog');
      p = (await save({ title: 'Salva', defaultPath: nome, filters: [{ name: estensione.toUpperCase(), extensions: [estensione] }] })) ?? undefined;
    }
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
