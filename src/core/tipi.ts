// Il modello del progetto: tutto quello che finisce nel file .dpv e nell'autosalvataggio.
// I tempi sulla timeline sono in FOTOGRAMMI interi (come sulle centraline di montaggio a nastro):
// niente mezzi fotogrammi, niente errori di arrotondamento sui tagli. Solo il punto d'ingresso nella
// sorgente (srcIn) è in secondi, perché la sorgente può avere un'altra cadenza.

export type Rate = { num: number; den: number };

export type TrackKind = 'video' | 'audio';

export interface Track {
  id: string;
  kind: TrackKind;
  name: string;
  height: number;
  /** video: traccia spenta (non si vede) · audio: muto */
  mute: boolean;
  solo: boolean;
  lock: boolean;
  /** video: trasparenza della traccia intera, 0..1: i "livelli al volo" */
  opacity: number;
  /** audio: volume della traccia in dB */
  volume: number;
  /** audio: panorama -1 (sinistra) .. 1 (destra) */
  pan: number;
}

export type ClipKind = 'media' | 'color' | 'bars' | 'tone' | 'countdown' | 'title' | 'beep';

/** Un punto della linea elastica (rubber band): f = fotogrammi dall'inizio della clip. */
export interface Key { f: number; v: number }

export type TransitionType = 'mix' | 'wipe' | 'dip';

export interface Transition {
  type: TransitionType;
  /** durata in fotogrammi */
  len: number;
  /** numero di tendina SMPTE (per 'wipe') */
  pattern: number;
  /** bordo morbido 0..1 */
  soft: number;
  /** spessore del bordo 0..1 */
  border: number;
  borderColor: string;
  reverse: boolean;
  /** colore del passaggio per 'dip' */
  color: string;
}

export type Look = 'none' | 'vhs' | 'film' | 'bn' | 'seppia' | 'crt';

export interface VideoFx {
  /** livello del nero / luminosità -1..1 */
  bright: number;
  /** guadagno / contrasto 0..2 */
  contrast: number;
  /** croma / saturazione 0..2 */
  sat: number;
  /** fase / tinta in gradi -180..180 */
  hue: number;
  look: Look;
  /** chiave: none, luma (toglie il nero o il bianco), chroma (toglie un colore) */
  key: 'none' | 'luma' | 'chroma';
  keyColor: string;
  keyLevel: number;
  keySoft: number;
  keyInvert: boolean;
}

export interface Transform {
  /** spostamento in pixel del progetto, dal centro */
  x: number;
  y: number;
  scale: number;
  /** gradi */
  rot: number;
  /** ritaglio in frazione 0..0.5 per lato */
  cropL: number;
  cropR: number;
  cropT: number;
  cropB: number;
}

export interface TitleSpec {
  text: string;
  /** 'fisso' | 'sottopancia' (lower third) | 'rullo' (scorre in su) | 'crawl' (scorre di lato) */
  style: 'fisso' | 'sottopancia' | 'rullo' | 'crawl';
  font: string;
  size: number;
  color: string;
  outline: string;
  shadow: boolean;
  box: boolean;
  boxColor: string;
  align: 'left' | 'center' | 'right';
  y: number;
}

export interface GenSpec {
  color?: string;
  /** barre: 'smpte' | 'ebu' */
  bars?: 'smpte' | 'ebu';
  /** tono: frequenza e livello */
  freq?: number;
  level?: number;
  title?: TitleSpec;
}

export interface Clip {
  id: string;
  track: string;
  kind: ClipKind;
  media?: string;
  name: string;
  /** fotogramma d'inizio sulla timeline */
  start: number;
  /** durata in fotogrammi */
  len: number;
  /** ingresso nella sorgente, in secondi */
  srcIn: number;
  speed: number;
  /** clip video e audio della stessa ripresa condividono il link: si muovono insieme */
  link?: string;
  label: number;
  // video
  opacity: number;
  opKeys: Key[];
  tf: Transform;
  fx: VideoFx;
  trIn?: Transition;
  /** dissolvenze in fotogrammi (video: dal trasparente · audio: dal silenzio) */
  fadeIn: number;
  fadeOut: number;
  // audio
  gain: number;
  gainKeys: Key[];
  pan: number;
  gen?: GenSpec;
}

export type MediaType = 'video' | 'audio' | 'image';

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  /** fine della sorgente in secondi (le immagini non hanno durata: 0) */
  duration: number;
  /** primo istante della sorgente (i file MTS non partono da zero) */
  t0: number;
  width: number;
  height: number;
  fps: number;
  rotation: number;
  hasVideo: boolean;
  hasAudio: boolean;
  channels: number;
  sampleRate: number;
  vcodec: string;
  acodec: string;
  container: string;
  size: number;
  lastModified: number;
  /** percorso sul disco (app desktop): serve a ricollegare i file quando si riapre il progetto */
  path?: string;
  /** punti di attacco e stacco marcati nel Player (secondi) */
  markIn?: number | null;
  markOut?: number | null;
}

export interface Marker { id: string; f: number; name: string; color: string }

export interface Project {
  format: 'daprod-video';
  v: 1;
  name: string;
  w: number;
  h: number;
  rate: Rate;
  drop: boolean;
  sampleRate: number;
  tracks: Track[];
  clips: Clip[];
  media: MediaItem[];
  markers: Marker[];
  /** attacco e stacco sulla timeline (il "record in/out" della centralina) */
  inF: number | null;
  outF: number | null;
  /** preroll/postroll in secondi, come i registratori a nastro */
  preroll: number;
  created: number;
  saved: number;
}

export const FORMATI = [
  { id: 'hd25', nome: 'HD 1080 · 25p (PAL)', w: 1920, h: 1080, rate: { num: 25, den: 1 }, drop: false },
  { id: 'hd50', nome: 'HD 1080 · 50p', w: 1920, h: 1080, rate: { num: 50, den: 1 }, drop: false },
  { id: 'hd2997', nome: 'HD 1080 · 29,97 DF (NTSC)', w: 1920, h: 1080, rate: { num: 30000, den: 1001 }, drop: true },
  { id: 'hd30', nome: 'HD 1080 · 30p', w: 1920, h: 1080, rate: { num: 30, den: 1 }, drop: false },
  { id: 'hd24', nome: 'HD 1080 · 24p cinema', w: 1920, h: 1080, rate: { num: 24, den: 1 }, drop: false },
  { id: 'hd60', nome: 'HD 1080 · 60p', w: 1920, h: 1080, rate: { num: 60, den: 1 }, drop: false },
  { id: 'hd720', nome: 'HD 720 · 25p', w: 1280, h: 720, rate: { num: 25, den: 1 }, drop: false },
  { id: 'uhd25', nome: 'UHD 4K · 25p', w: 3840, h: 2160, rate: { num: 25, den: 1 }, drop: false },
  { id: 'pal43', nome: 'SD PAL 4:3 · 720×576 25', w: 768, h: 576, rate: { num: 25, den: 1 }, drop: false },
  { id: 'pal169', nome: 'SD PAL 16:9 · 1024×576 25', w: 1024, h: 576, rate: { num: 25, den: 1 }, drop: false },
  { id: 'vert25', nome: 'Verticale 1080×1920 · 25p', w: 1080, h: 1920, rate: { num: 25, den: 1 }, drop: false },
  { id: 'quad25', nome: 'Quadrato 1080×1080 · 25p', w: 1080, h: 1080, rate: { num: 25, den: 1 }, drop: false },
] as const;

export const ETICHETTE = ['#4a8cff', '#5dd39e', '#ffd54a', '#ff8a3d', '#ff4d6d', '#c86bff', '#35e8ff', '#9aa3b5'];
