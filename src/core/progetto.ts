// Fabbrica del progetto, delle tracce e delle clip, più le piccole utilità sul modello.
import type { Clip, ClipKind, MediaItem, Project, Rate, Track, TrackKind, Transition, VideoFx, Transform, TitleSpec } from './tipi';
import { f2s } from './timecode';

let seq = 0;
export const uid = (p = '') => p + Date.now().toString(36).slice(-5) + (seq++).toString(36) + Math.random().toString(36).slice(2, 6);

export const FX0: VideoFx = {
  bright: 0, contrast: 1, sat: 1, hue: 0, look: 'none',
  key: 'none', keyColor: '#00b140', keyLevel: 0.35, keySoft: 0.1, keyInvert: false,
};
export const TF0: Transform = { x: 0, y: 0, scale: 1, rot: 0, cropL: 0, cropR: 0, cropT: 0, cropB: 0 };

export function newTrack(kind: TrackKind, name: string): Track {
  return {
    id: uid('t'), kind, name, height: kind === 'video' ? 58 : 46,
    mute: false, solo: false, lock: false, opacity: 1, volume: 0, pan: 0,
  };
}

export function newProject(fmt: { w: number; h: number; rate: Rate; drop: boolean }, name = 'Montaggio senza nome'): Project {
  const now = Date.now();
  return {
    format: 'daprod-video', v: 1, name,
    w: fmt.w, h: fmt.h, rate: { ...fmt.rate }, drop: fmt.drop, sampleRate: 48000,
    // in alto le tracce video (V3 sopra a tutto), poi le audio
    tracks: [newTrack('video', 'V3'), newTrack('video', 'V2'), newTrack('video', 'V1'),
      newTrack('audio', 'A1'), newTrack('audio', 'A2'), newTrack('audio', 'A3'), newTrack('audio', 'A4')],
    clips: [], media: [], markers: [], inF: null, outF: null, preroll: 3,
    created: now, saved: 0,
  };
}

export function newClip(kind: ClipKind, track: string, start: number, len: number, extra: Partial<Clip> = {}): Clip {
  return {
    id: uid('c'), track, kind, name: extra.name ?? kind, start, len, srcIn: 0, speed: 1, label: 0,
    opacity: 1, opKeys: [], tf: { ...TF0 }, fx: { ...FX0 }, fadeIn: 0, fadeOut: 0,
    gain: 0, gainKeys: [], pan: 0, ...extra,
  };
}

export function newTransition(type: Transition['type'], len: number, pattern = 1): Transition {
  return { type, len, pattern, soft: 0.03, border: 0, borderColor: '#ffd54a', reverse: false, color: '#000000' };
}

export const TITLE0: TitleSpec = {
  text: 'DaProd Video', style: 'fisso', font: 'Rajdhani', size: 90, color: '#ffffff', outline: '#000000',
  shadow: true, box: false, boxColor: '#000000aa', align: 'center', y: 0.5,
};

export const end = (c: Clip) => c.start + c.len;
export const trackOf = (p: Project, id: string) => p.tracks.find((t) => t.id === id)!;
export const mediaOf = (p: Project, c: Clip): MediaItem | undefined => (c.media ? p.media.find((m) => m.id === c.media) : undefined);
export const clipById = (p: Project, id: string) => p.clips.find((c) => c.id === id);
export const clipsOn = (p: Project, trackId: string) => p.clips.filter((c) => c.track === trackId).sort((a, b) => a.start - b.start);
export const videoTracks = (p: Project) => p.tracks.filter((t) => t.kind === 'video');
export const audioTracks = (p: Project) => p.tracks.filter((t) => t.kind === 'audio');
export const isVideoClip = (c: Clip) => c.kind === 'media' || c.kind === 'color' || c.kind === 'bars' || c.kind === 'countdown' || c.kind === 'title';

/** fine del montaggio: l'ultimo fotogramma occupato */
export const projectEnd = (p: Project) => p.clips.reduce((m, c) => Math.max(m, end(c)), 0);

/** secondi nella sorgente per il fotogramma f della timeline */
export function srcTimeAt(p: Project, c: Clip, f: number): number {
  return c.srcIn + f2s(f - c.start, p.rate) * c.speed;
}

/** quanti fotogrammi di sorgente restano prima e dopo la clip (le "maniglie") */
export function handles(p: Project, c: Clip): { head: number; tail: number } {
  const m = mediaOf(p, c);
  if (!m || m.type === 'image' || !m.duration) return { head: Infinity, tail: Infinity };
  const r = p.rate.num / p.rate.den;
  const head = Math.floor(((c.srcIn - (m.t0 || 0)) / c.speed) * r + 1e-6);
  const usedEnd = c.srcIn + (c.len / r) * c.speed;
  const tail = Math.floor(((m.duration - usedEnd) / c.speed) * r + 1e-6);
  return { head: Math.max(0, head), tail: Math.max(0, tail) };
}

/** valore di una linea elastica al fotogramma locale lf (interpolazione lineare) */
export function keyValue(keys: { f: number; v: number }[], lf: number, base: number): number {
  if (!keys.length) return base;
  if (lf <= keys[0].f) return keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (lf <= b.f) return a.v + ((b.v - a.v) * (lf - a.f)) / Math.max(1e-9, b.f - a.f);
  }
  return keys[keys.length - 1].v;
}

/** opacità di una clip al fotogramma f (clip × linea elastica × dissolvenze) */
export function clipOpacity(c: Clip, f: number): number {
  const lf = f - c.start;
  let o = c.opKeys.length ? keyValue(c.opKeys, lf, c.opacity) : c.opacity;
  if (c.fadeIn > 0 && lf < c.fadeIn) o *= Math.max(0, lf / c.fadeIn);
  if (c.fadeOut > 0 && lf > c.len - c.fadeOut) o *= Math.max(0, (c.len - lf) / c.fadeOut);
  return Math.max(0, Math.min(1, o));
}

export const dbToGain = (db: number) => (db <= -60 ? 0 : Math.pow(10, db / 20));
export const gainToDb = (g: number) => (g <= 0.001 ? -60 : 20 * Math.log10(g));

/** nome della prossima traccia libera: V4, A5… */
export function nextTrackName(p: Project, kind: TrackKind): string {
  const pre = kind === 'video' ? 'V' : 'A';
  let n = 1;
  while (p.tracks.some((t) => t.name === pre + n)) n++;
  return pre + n;
}
