// La voce AI: i sottotitoli (scritti dall'AI o da te, anche tradotti) vengono letti da una voce sintetica di NVIDIA
// (Magpie TTS, nel motore dell'app: src/media/nemo.ts). Così si cambia voce a un parlato, o lo si fa dire in un'altra
// lingua se i sottotitoli sono tradotti. Ogni frase va al suo posto: se la voce è più lunga dello spazio che ha, si
// accelera un po' (col tono giusto, src/media/stira.ts); poi l'audio intero diventa un file e va su una traccia sua.
import type { Clip, Project, Sottotitolo } from '../core/tipi';
import { end, newTrack, nextTrackName, uid } from '../core/progetto';
import { f2s, fps } from '../core/timecode';
import { sottotitoliDi } from '../core/sottotitoli';
import * as M from '../core/montaggio';
import { assicuraMotore, LINGUE_VOCE, motoreNemo, type Parlato } from './nemo';
import { stiraTutto } from './stira';
import { ricampiona } from './wav';

export interface OpzioniDoppiaggio {
  /** quale voce di Magpie (0-4) */
  voce: number;
  /** la lingua in cui si parla: it, en, es, fr, de */
  lingua: string;
  /** l'audio originale delle riprese va in silenzio */
  silenzia: boolean;
}

/** una frase da dire, coi tempi in secondi dall'inizio del montaggio */
export interface Enunciato { id: string; da: number; a: number; testo: string }

/** l'audio finale esce a 48 kHz */
export const SR_VOCE = 48000;

const FINE_FRASE = /[.!?…:;»"”)]\s*$/;

/**
 * Dalle righe dei sottotitoli alle frasi da dire. Righe attaccate (pausa sotto mezzo secondo) che non finiscono con un
 * punto si uniscono: la voce le dice di seguito e suona più naturale; una frase non supera i ~170 caratteri.
 */
export function enunciatiDaRighe(righe: Sottotitolo[], p: Project): Enunciato[] {
  const r = fps(p.rate);
  const ordinate = righe.filter((x) => x.testo.trim()).sort((a, b) => a.da - b.da);
  const out: Enunciato[] = [];
  for (const x of ordinate) {
    const da = x.da / r, a = Math.max(x.da + 1, x.a) / r;
    const testo = x.testo.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
    const u = out[out.length - 1];
    if (u && da - u.a <= 0.5 && !FINE_FRASE.test(u.testo) && u.testo.length + testo.length < 170) {
      u.testo += ' ' + testo;
      u.a = Math.max(u.a, a);
    } else out.push({ id: uid('f'), da, a, testo });
  }
  return out;
}

/** le clip audio con le voci delle riprese (la presa diretta: audio legato a un video); se non ce ne sono, tutto l'audio */
export function clipDialogo(p: Project): Clip[] {
  const video = new Set(p.tracks.filter((t) => t.kind === 'video').map((t) => t.id));
  const audio = new Set(p.tracks.filter((t) => t.kind === 'audio').map((t) => t.id));
  const tutte = p.clips.filter((c) => c.kind === 'media' && audio.has(c.track));
  const presa = tutte.filter((c) => c.link && p.clips.some((v) => v.link === c.link && video.has(v.track)));
  return presa.length ? presa : tutte;
}

/** mette le frasi al loro posto in un audio solo. Ogni frase: a livello, e accelerata se non ci sta prima della successiva. */
export function componiVoce(enunc: Enunciato[], parlati: Map<string, Parlato>, o: { velocitaMax?: number } = {}): Float32Array {
  const vMax = o.velocitaMax ?? 1.6;
  const pezzi: { at: number; audio: Float32Array }[] = [];
  let tot = 0;
  enunc.forEach((e, i) => {
    const pr = parlati.get(e.id);
    if (!pr || !pr.audio.length) return;
    let a = ricampiona(pr.audio, pr.sr, SR_VOCE);
    // a livello: il picco a −2 dB (le voci sintetiche escono un po' basse)
    let picco = 0;
    for (let k = 0; k < a.length; k++) picco = Math.max(picco, Math.abs(a[k]));
    if (picco > 1e-4) { const g = 0.8 / picco; a = a.map((x) => x * g); }
    // quanto spazio c'è: fino alla frase dopo (con un respiro), se no fino a fine frase più un po'
    const dopo = enunc[i + 1];
    const spazio = Math.max(0.4, (dopo ? dopo.da - 0.08 : e.a + 3) - e.da);
    const dur = a.length / SR_VOCE;
    if (dur > spazio) {
      const k = Math.min(vMax, dur / spazio);
      if (k > 1.02) a = stiraTutto([a], SR_VOCE, k)[0];
      const max = Math.floor(spazio * SR_VOCE);
      if (a.length > max) {
        // ancora lunga: si taglia con una dissolvenza di 40 ms
        a = a.slice(0, max);
        const f = Math.min(a.length, Math.floor(0.04 * SR_VOCE));
        for (let j = 0; j < f; j++) a[a.length - 1 - j] *= j / f;
      }
    }
    const at = Math.max(0, Math.round(e.da * SR_VOCE));
    pezzi.push({ at, audio: a });
    tot = Math.max(tot, at + a.length);
  });
  const out = new Float32Array(tot);
  for (const x of pezzi) for (let k = 0; k < x.audio.length; k++) out[x.at + k] += x.audio[k];
  return out;
}

/** la lingua della voce: quella indicata se Magpie la sa, altrimenti quella dei sottotitoli, altrimenti null */
export function linguaVoce(p: Project, scelta?: string): string | null {
  for (const l of [scelta, sottotitoliDi(p).lingua]) if (l && LINGUE_VOCE.includes(l)) return l;
  return null;
}

/**
 * Fa dire i sottotitoli a una voce. stato(testo, 0..1) racconta cosa sta facendo; il segnale ferma tutto.
 * Ritorna l'audio (mono, 48 kHz) e quante frasi ha detto.
 */
export async function doppia(p: Project, o: OpzioniDoppiaggio, stato: (testo: string, k: number) => void, segnale?: AbortSignal): Promise<{ audio: Float32Array; sr: number; frasi: number }> {
  const fermo = () => { if (segnale?.aborted) throw new Error('fermato'); };
  const nem = motoreNemo();
  if (!nem) throw new Error('la voce AI serve l\'app per Windows o Mac');
  const enunc = enunciatiDaRighe(sottotitoliDi(p).righe, p);
  if (!enunc.length) throw new Error('senza-righe');
  if (!LINGUE_VOCE.includes(o.lingua)) throw new Error('lingua');
  await assicuraMotore(nem, ['tts'], (k, t) => stato(t, k * 0.3), segnale);
  fermo();
  const parlati = await nem.sintetizza(enunc.map((e) => ({ id: e.id, testo: e.testo })), { lingua: o.lingua, voce: o.voce }, (k, t) => stato(t, 0.3 + k * 0.62), segnale);
  fermo();
  stato('Metto le frasi al loro posto…', 0.94);
  const audio = componiVoce(enunc, parlati);
  if (!audio.length) throw new Error('muto');
  stato('Fatto', 1);
  return { audio, sr: SR_VOCE, frasi: enunc.length };
}

/**
 * Mette la voce nel montaggio: su una traccia audio nuova ("Voce AI"), dall'inizio. Se `silenzia`, le voci originali
 * vanno a zero: la traccia si silenzia se contiene solo dialoghi, altrimenti si abbassano quelle clip.
 */
export function posaVoce(p: Project, mediaId: string, duratasec: number, silenzia: boolean): string[] {
  const tr = newTrack('audio', nextTrackName(p, 'audio'));
  tr.name = 'Voce AI';
  const dialoghi = silenzia ? clipDialogo(p) : [];
  p.tracks.push(tr);
  const nuovi = M.placeSource(p, { mediaId, srcIn: 0, srcOut: duratasec }, 0, null, { video: null, audio: [tr.id] }, 'libero');
  for (const c of p.clips) if (nuovi.includes(c.id)) c.name = 'Voce AI';
  if (silenzia) {
    const usati = new Set(dialoghi.map((c) => c.track));
    for (const t of p.tracks) {
      if (!usati.has(t.id) || t.id === tr.id) continue;
      const soloDialoghi = p.clips.filter((c) => c.track === t.id && c.kind !== 'fx').every((c) => dialoghi.some((d) => d.id === c.id));
      if (soloDialoghi) t.mute = true;
      else for (const c of dialoghi) if (c.track === t.id) { c.gain = -40; c.gainKeys = []; }
    }
  }
  return nuovi;
}

/** quanto dura in secondi la fine del montaggio (per dire quanto è lungo il parlato rispetto al video) */
export const fineSecondi = (p: Project) => f2s(Math.max(0, ...p.clips.map(end)), p.rate);
