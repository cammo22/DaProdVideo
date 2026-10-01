// Il motore NVIDIA (NeMo-Speech.cpp) visto dal JavaScript: un programma a parte, installato dall'app nella sua cartella
// (src-tauri/src/motori.rs), che riconosce il parlato con Nemotron 3.5 (streaming, multilingua) e fa parlare con Magpie TTS.
// Gira su scheda NVIDIA (CUDA), su Apple Silicon (Metal) e su CPU. Nel browser non c'è: lì restano Whisper e il resto.
// Tutto quello che è lento racconta come sta andando (avanza(k, testo)), così l'interfaccia può mostrare la barra col tempo.
import { invoke, isTauri } from '../platform';
import { codificaWav, leggiWav } from './wav';
import type { Pezzo } from './voce';

export interface StatoMotore {
  os: string;
  arch: string;
  cartella: string;
  installato: boolean;
  backend: string;
  consigliato: string;
  nvidia: boolean;
  /** byte dei modelli già scaricati */
  modelli: number;
}

export type Avanza = (k: number, testo: string) => void;

/** un pezzo d'audio da ascoltare: dov'è (secondi dall'inizio) e i campioni a 16 kHz mono */
export interface PezzoAudio { da: number; audio: Float32Array }

export interface Voce { id: string; testo: string }
export interface Parlato { audio: Float32Array; sr: number }

export interface MotoreNemo {
  stato(): Promise<StatoMotore | null>;
  /** scarica e installa il programma (solo la prima volta) */
  installa(avanza: Avanza, segnale?: AbortSignal): Promise<void>;
  /** scarica il modello (solo la prima volta): il riconoscimento (asr) o la voce (tts) */
  modello(quale: 'asr' | 'tts', avanza: Avanza, segnale?: AbortSignal): Promise<void>;
  /** ascolta i pezzi e ritorna le frasi coi tempi (in secondi dall'inizio di tutto) */
  trascrivi(pezzi: PezzoAudio[], o: { lingua: string }, avanza: Avanza, segnale?: AbortSignal): Promise<Pezzo[]>;
  /** fa dire i testi a una voce; ritorna l'audio di ognuno */
  sintetizza(voci: Voce[], o: { lingua: string; voce: number }, avanza: Avanza, segnale?: AbortSignal): Promise<Map<string, Parlato>>;
}

/** le voci di Magpie (le cinque "già pronte", in ordine di numero) */
export const VOCI_MAGPIE = ['John', 'Sofia', 'Aria', 'Jason', 'Leo'];

/** le lingue che il riconoscimento e la voce sanno (codice nostro → codice del motore) */
export const LINGUE_MOTORE: [string, string, string][] = [
  ['auto', 'auto', 'Riconosci da solo'],
  ['it', 'it-IT', 'Italiano'],
  ['en', 'en-US', 'Inglese'],
  ['es', 'es-ES', 'Spagnolo'],
  ['fr', 'fr-FR', 'Francese'],
  ['de', 'de-DE', 'Tedesco'],
];
/** le lingue in cui Magpie sa parlare (fra quelle che offriamo): c'è anche il cinese (mandarino), che il riconoscimento qui non offre */
export const LINGUE_VOCE = ['it', 'en', 'es', 'fr', 'de', 'zh'];
/** nome e codice del motore delle lingue della voce */
export const LINGUE_PARLATE: [string, string, string][] = [
  ['it', 'it-IT', 'Italiano'], ['en', 'en-US', 'Inglese'], ['es', 'es-ES', 'Spagnolo'], ['fr', 'fr-FR', 'Francese'], ['de', 'de-DE', 'Tedesco'], ['zh', 'zh-CN', 'Cinese'],
];
export const codiceLingua = (l: string) => LINGUE_MOTORE.find((x) => x[0] === l)?.[1] ?? LINGUE_PARLATE.find((x) => x[0] === l)?.[1] ?? (l.includes('-') ? l : 'en-US');

// ——— i sottotitoli .srt che escono dal motore ———

const TEMPO_SRT = /(\d+):(\d\d):(\d\d)[,.](\d{1,3})/;
const sec = (t: string) => { const m = TEMPO_SRT.exec(t); return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4].padEnd(3, '0') / 1000 : NaN; };

/** un file .srt in frasi con i loro tempi (secondi); `da` si somma a tutti (dove comincia il pezzo) */
export function pezziDaSrt(testo: string, da = 0): Pezzo[] {
  const out: Pezzo[] = [];
  for (const blocco of testo.replace(/\r/g, '').split(/\n{2,}/)) {
    const righe = blocco.split('\n').map((x) => x.trim()).filter(Boolean);
    const i = righe.findIndex((x) => x.includes('-->'));
    if (i < 0) continue;
    const [a, b] = righe[i].split('-->');
    const t0 = sec(a), t1 = sec(b);
    const t = righe.slice(i + 1).join(' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (Number.isFinite(t0) && t) out.push({ da: da + t0, a: Number.isFinite(t1) ? da + t1 : null, testo: t });
  }
  return out;
}

// ——— il motore vero (nell'app) ———

const ricordo = (k: string): boolean => { try { return JSON.parse(localStorage.getItem('dpv-nemo') || '{}')[k] === true; } catch { return false; } };
const segna = (k: string) => { try { const o = JSON.parse(localStorage.getItem('dpv-nemo') || '{}'); o[k] = true; localStorage.setItem('dpv-nemo', JSON.stringify(o)); } catch { /* niente */ } };
const dimentica = () => { try { localStorage.removeItem('dpv-nemo'); } catch { /* niente */ } };

const attendi = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MB = 1048576;
/** quanto pesano circa i modelli (per la barra mentre si scaricano) */
const PESO_MODELLO = { asr: 720 * MB, tts: 900 * MB };
const NOME_MODELLO = { asr: 'nemotron-3.5', tts: 'magpie' };

/** l'ultima cosa utile che il programma ha scritto, per dire perché non ce l'ha fatta */
function spiega(righe: string[]): string {
  const utili = righe.filter((r) => !/^\s*\[?(info|debug)/i.test(r));
  const l = (utili.length ? utili : righe).slice(-3).join(' · ');
  if (/curl/i.test(l) && /not found|non trovato|recognized/i.test(l)) return 'manca il programma curl nel sistema (serve per scaricare i modelli)';
  return l || 'il motore si è fermato senza dire perché';
}

async function scrivi(path: string, dati: Uint8Array) {
  const id = await invoke<number>('export_apri', { path });
  const PEZZO = 8 << 20;
  for (let pos = 0; pos < dati.length || pos === 0; pos += PEZZO) {
    await invoke('export_scrivi', dati.subarray(pos, pos + PEZZO), { headers: { 'x-id': String(id), 'x-pos': String(pos) } });
    if (dati.length === 0) break;
  }
  await invoke('export_chiudi', { id });
}

async function leggi(path: string): Promise<Uint8Array> {
  try {
    const n = await invoke<number>('media_dimensione', { path });
    const out = new Uint8Array(n);
    const PEZZO = 8 << 20;
    for (let pos = 0; pos < n; pos += PEZZO) out.set(new Uint8Array(await invoke<ArrayBuffer>('media_leggi', { path, start: pos, end: Math.min(n, pos + PEZZO) })), pos);
    return out;
  } finally {
    void invoke('media_chiudi', { path }).catch(() => {});
  }
}

interface OpzEsegui { segnale?: AbortSignal; riga?: (r: string) => void; sonda?: () => Promise<void> | void; intervallo?: number }

/** lancia il programma e aspetta che finisca, guardando ogni tanto come va (righe scritte e la sonda dei progressi) */
async function esegui(args: string[], o: OpzEsegui = {}): Promise<void> {
  const id = 'j' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await invoke('motore_lancia', { id, args });
  const ferma = () => void invoke('motore_ferma', { id }).catch(() => {});
  o.segnale?.addEventListener('abort', ferma, { once: true });
  const ultime: string[] = [];
  try {
    for (;;) {
      await attendi(o.intervallo ?? 400);
      if (o.segnale?.aborted) throw new Error('fermato');
      const s = await invoke<{ finito: boolean; codice: number; righe: string[] }>('motore_lavoro', { id });
      for (const r of s.righe) { ultime.push(r); if (ultime.length > 12) ultime.shift(); o.riga?.(r); }
      await o.sonda?.();
      if (s.finito) {
        if (o.segnale?.aborted) throw new Error('fermato');
        if (s.codice !== 0) throw new Error(spiega(ultime));
        return;
      }
    }
  } finally {
    o.segnale?.removeEventListener('abort', ferma);
    void invoke('motore_dimentica', { id }).catch(() => {});
  }
}

const mbTesto = (b: number) => (b / MB).toFixed(b > 100 * MB ? 0 : 1);
const messaggio = (e: unknown) => (typeof e === 'string' ? e : e instanceof Error ? e.message : String(e));

const motoreApp: MotoreNemo = {
  stato: () => invoke<StatoMotore>('motore_stato'),

  async installa(avanza, segnale) {
    const st = await invoke<StatoMotore>('motore_stato');
    if (st.installato) return;
    avanza(0, 'Scarico il motore NVIDIA (solo la prima volta)…');
    let finito = false;
    const misura = (async () => {
      while (!finito && !segnale?.aborted) {
        const [f, t] = await invoke<[number, number]>('motore_scarico').catch(() => [0, 0] as [number, number]);
        avanza(t ? Math.min(0.95, f / t) : 0, `Scarico il motore NVIDIA${st.consigliato === 'cuda' ? ' (per la scheda NVIDIA)' : st.consigliato === 'metal' ? ' (per il Mac)' : ' (per il processore)'}: ${mbTesto(f)}${t ? ' di ' + mbTesto(t) : ''} MB`);
        await attendi(300);
      }
    })();
    try {
      await invoke<string>('motore_installa', { backend: st.consigliato });
    } catch (e) {
      // la versione per la scheda non si installa? si riprova sul processore
      if (st.consigliato !== 'cpu' && !segnale?.aborted) {
        avanza(0, 'Riprovo con la versione per il processore…');
        await invoke<string>('motore_installa', { backend: 'cpu' }).catch((e2) => { throw new Error(messaggio(e2)); });
      } else throw new Error(messaggio(e));
    } finally {
      finito = true;
      await misura;
    }
    if (segnale?.aborted) throw new Error('fermato');
    avanza(1, 'Motore installato');
  },

  async modello(quale, avanza, segnale) {
    const st = await invoke<StatoMotore>('motore_stato');
    // già scaricato (lo ricordiamo noi, e la cartella dei modelli non è vuota)
    if (ricordo(quale) && st.modelli > 50 * MB) return;
    const nome = quale === 'asr' ? 'il modello che ascolta (Nemotron 3.5)' : 'il modello della voce (Magpie)';
    avanza(0, `Scarico ${nome}: solo la prima volta…`);
    const base = st.modelli;
    let pct = -1;
    await esegui(['pull', NOME_MODELLO[quale]], {
      segnale, intervallo: 500,
      riga: (r) => { const m = /(\d{1,3}(?:\.\d+)?)\s*%/.exec(r); if (m) pct = Math.min(99, +m[1]) / 100; },
      sonda: async () => {
        const peso = await invoke<number>('motore_peso_modelli').catch(() => base);
        const k = pct >= 0 ? pct : Math.min(0.97, Math.max(0, peso - base) / PESO_MODELLO[quale]);
        avanza(k, `Scarico ${nome}: ${mbTesto(Math.max(0, peso - base))} MB (solo la prima volta)`);
      },
    });
    segna(quale);
    avanza(1, 'Modello pronto');
  },

  async trascrivi(pezzi, o, avanza, segnale) {
    const lavoro = 'asr' + Date.now().toString(36);
    const dIn = await invoke<string>('motore_cartella_lavoro', { nome: lavoro + '-in' });
    const dOut = await invoke<string>('motore_cartella_lavoro', { nome: lavoro + '-out' });
    try {
      avanza(0, 'Preparo l\'audio per il motore…');
      const nomi: string[] = [];
      for (const [i, p] of pezzi.entries()) {
        if (segnale?.aborted) throw new Error('fermato');
        const nome = `pezzo-${String(i + 1).padStart(4, '0')}`;
        nomi.push(nome);
        await scrivi(`${dIn}/${nome}.wav`, codificaWav(p.audio, 16000));
      }
      const n = pezzi.length;
      await esegui(['transcribe', dIn, '--model', 'nemotron-3.5', '--language', codiceLingua(o.lingua), '--format', 'srt', '--output-dir', dOut, '--concurrency', '1', '--force'], {
        segnale, intervallo: 500,
        sonda: async () => {
          const f = await invoke<[string, number][]>('motore_elenca', { path: dOut }).catch(() => [] as [string, number][]);
          const fatti = f.filter(([nome]) => nome.endsWith('.srt')).length;
          avanza(Math.min(0.98, fatti / n), `Ascolto e scrivo con Nemotron: ${Math.min(fatti, n)} di ${n} pezzi`);
        },
      });
      const out: Pezzo[] = [];
      for (const [i, nome] of nomi.entries()) {
        let testo = '';
        try { testo = await invoke<string>('progetto_leggi', { path: `${dOut}/${nome}.srt` }); } catch { continue; /* un pezzo muto: niente file */ }
        out.push(...pezziDaSrt(testo, pezzi[i].da));
      }
      avanza(1, 'Fatto');
      return out;
    } finally {
      void invoke('motore_pulisci', { path: dIn }).catch(() => {});
      void invoke('motore_pulisci', { path: dOut }).catch(() => {});
    }
  },

  async sintetizza(voci, o, avanza, segnale) {
    const lavoro = 'tts' + Date.now().toString(36);
    const dir = await invoke<string>('motore_cartella_lavoro', { nome: lavoro });
    const out = new Map<string, Parlato>();
    try {
      for (const [i, v] of voci.entries()) {
        if (segnale?.aborted) throw new Error('fermato');
        avanza(i / voci.length, `Faccio parlare la voce: frase ${i + 1} di ${voci.length}`);
        const t = `${dir}/t${i}.txt`, w = `${dir}/t${i}.wav`;
        await scrivi(t, new TextEncoder().encode(v.testo));
        await esegui(['synthesize', '-i', t, '-o', w, '--language', codiceLingua(o.lingua), '--speaker', String(o.voce), '--format', 'wav', '--force'], { segnale, intervallo: 250 });
        const { audio, sr } = leggiWav(await leggi(w));
        out.set(v.id, { audio, sr });
      }
      avanza(1, 'Fatto');
      return out;
    } finally {
      void invoke('motore_pulisci', { path: dir }).catch(() => {});
    }
  },
};

let motore: MotoreNemo | null = null;
/** per le prove: un motore finto (null = torna a quello vero) */
export const impostaMotoreNemo = (m: MotoreNemo | null) => { motore = m; };
/** il motore, se c'è (nell'app, o quello finto delle prove); nel browser null */
export const motoreNemo = (): MotoreNemo | null => motore ?? (isTauri ? motoreApp : null);

/** toglie il motore e i modelli dal computer */
export async function disinstallaMotore(conModelli: boolean) {
  await invoke('motore_disinstalla', { conModelli });
  dimentica();
}

/** prepara quello che serve (motore e modelli) mostrando come va: k da 0 a 1 su tutto il lavoro di preparazione */
export async function assicuraMotore(m: MotoreNemo, quali: ('asr' | 'tts')[], avanza: Avanza, segnale?: AbortSignal) {
  const st = await m.stato();
  const passi = (st && !st.installato ? 1 : 0) + quali.length;
  let fatto = 0;
  const cornice = (x: Avanza): Avanza => (k, t) => x(Math.min(1, (fatto + Math.max(0, Math.min(1, k))) / passi), t);
  if (st && !st.installato) { await m.installa(cornice(avanza), segnale); fatto++; }
  for (const q of quali) { await m.modello(q, cornice(avanza), segnale); fatto++; }
}
