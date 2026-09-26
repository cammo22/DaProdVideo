// Gli effetti al volo della clip si sommano: ognuno aggiunge il suo ritocco a quello che c'è (le regolazioni a mano
// delle proprietà più tutti gli effetti accesi), così si mescolano sempre e ne vengono fuori di nuovi. Caldo e B/N
// insieme fanno un bianco e nero caldo, VHS e pellicola una cassetta vecchia, vivace e notte una notte piena di colori.
// Lo usano il compositore (monitor ed export) e i menu.
import type { Look, VideoFx } from './tipi';

export interface Ritocco {
  bright?: number;
  /** si aggiunge al contrasto */
  contrast?: number;
  /** moltiplica la saturazione */
  sat?: number;
  hue?: number;
  temp?: number;
  vignette?: number;
  zoom?: number;
  mirror?: boolean;
  look?: Look;
}

export const RITOCCHI: Record<string, Ritocco> = {
  vivace: { sat: 1.35, contrast: 0.06 },
  luminoso: { bright: 0.1, contrast: 0.05 },
  caldo: { temp: 0.4 },
  freddo: { temp: -0.4 },
  vignetta: { vignette: 0.55 },
  zoom: { zoom: 0.15 },
  specchia: { mirror: true },
  bn: { look: 'bn' },
  seppia: { look: 'seppia' },
  pellicola: { look: 'film' },
  vhs: { look: 'vhs' },
  crt: { look: 'crt' },
  pop: { sat: 1.5, contrast: 0.14 },
  contrasto: { contrast: 0.24, bright: -0.02 },
  notte: { bright: -0.09, temp: -0.55, sat: 0.8, vignette: 0.25 },
  sbiadito: { contrast: -0.18, bright: 0.06, sat: 0.7 },
  tramonto: { temp: 0.8, sat: 1.12, hue: -5 },
  cinema: { contrast: 0.12, sat: 0.88, temp: 0.12, vignette: 0.3 },
  sogno: { bright: 0.07, contrast: -0.12, sat: 1.15, vignette: 0.2 },
  gelo: { temp: -0.8, sat: 0.75, bright: 0.04 },
};

/** i look come bit: se ne possono accendere tanti insieme */
export const BIT_LOOK: Record<string, number> = { none: 0, vhs: 1, film: 2, bn: 4, seppia: 8, crt: 16 };

export interface FxEffettivo { bright: number; contrast: number; sat: number; hue: number; temp: number; vignette: number; zoom: number; mirror: boolean; looks: number }

/** le regolazioni della clip con tutti i suoi effetti accesi sommati */
export function fxEffettivo(fx: VideoFx): FxEffettivo {
  const o: FxEffettivo = {
    bright: fx.bright, contrast: fx.contrast, sat: fx.sat, hue: fx.hue, temp: fx.temp ?? 0, vignette: fx.vignette ?? 0,
    zoom: fx.zoom ?? 0, mirror: !!fx.mirror, looks: BIT_LOOK[fx.look] ?? 0,
  };
  for (const id of fx.effetti ?? []) {
    const r = RITOCCHI[id];
    if (!r) continue;
    o.bright += r.bright ?? 0;
    o.contrast += r.contrast ?? 0;
    o.sat *= r.sat ?? 1;
    o.hue += r.hue ?? 0;
    o.temp += r.temp ?? 0;
    o.vignette += r.vignette ?? 0;
    o.zoom += r.zoom ?? 0;
    if (r.mirror) o.mirror = !o.mirror;
    if (r.look) o.looks |= BIT_LOOK[r.look] ?? 0;
  }
  o.temp = Math.max(-1.5, Math.min(1.5, o.temp));
  o.vignette = Math.min(1, o.vignette);
  o.contrast = Math.max(0.2, o.contrast);
  return o;
}
