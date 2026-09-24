// Timecode SMPTE: HH:MM:SS:FF, con il drop-frame per 29,97 e 59,94 (separatore ';').
import type { Rate } from './tipi';

export const fps = (r: Rate) => r.num / r.den;
/** fotogrammi interi per secondo usati per contare il timecode (29,97 -> 30) */
export const tcBase = (r: Rate) => Math.round(r.num / r.den);
export const f2s = (f: number, r: Rate) => (f * r.den) / r.num;
export const s2f = (s: number, r: Rate) => Math.round((s * r.num) / r.den);
export const s2fFloor = (s: number, r: Rate) => Math.floor((s * r.num) / r.den + 1e-6);

const pad = (n: number, l = 2) => String(Math.floor(n)).padStart(l, '0');

export function frameToTc(frame: number, r: Rate, drop = false): string {
  const neg = frame < 0;
  let f = Math.abs(Math.round(frame));
  const base = tcBase(r);
  if (drop && (base === 30 || base === 60)) {
    const d = base === 30 ? 2 : 4; // fotogrammi saltati ogni minuto (tranne ogni 10)
    const perMin = base * 60 - d;
    const per10 = perMin * 10 + d;
    const tens = Math.floor(f / per10);
    let rem = f % per10;
    if (rem > d) f += d * 9 * tens + d * Math.floor((rem - d) / perMin);
    else f += d * 9 * tens;
    const ff = f % base, ss = Math.floor(f / base) % 60, mm = Math.floor(f / (base * 60)) % 60, hh = Math.floor(f / (base * 3600));
    return (neg ? '-' : '') + `${pad(hh)}:${pad(mm)}:${pad(ss)};${pad(ff)}`;
  }
  const ff = f % base, ss = Math.floor(f / base) % 60, mm = Math.floor(f / (base * 60)) % 60, hh = Math.floor(f / (base * 3600));
  return (neg ? '-' : '') + `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

export function tcToFrame(hh: number, mm: number, ss: number, ff: number, r: Rate, drop = false): number {
  const base = tcBase(r);
  let total = ((hh * 60 + mm) * 60 + ss) * base + ff;
  if (drop && (base === 30 || base === 60)) {
    const d = base === 30 ? 2 : 4;
    const mins = hh * 60 + mm;
    total -= d * (mins - Math.floor(mins / 10));
  }
  return total;
}

/**
 * Timecode scritto a mano, come sul tastierino della centralina:
 * "1000" = 00:00:10:00 · "1:2:3:4" · "+25" / "-10" = sposta di fotogrammi · "+2s" secondi.
 * Ritorna il fotogramma assoluto o null se non si capisce.
 */
export function parseTc(input: string, r: Rate, drop: boolean, current: number): number | null {
  const t = input.trim().replace(/[.,]/g, ':');
  if (!t) return null;
  const rel = t.match(/^([+-])(\d+)(s|f)?$/i);
  if (rel) {
    const n = Number(rel[2]) * (rel[3]?.toLowerCase() === 's' ? tcBase(r) : 1);
    return Math.max(0, current + (rel[1] === '-' ? -n : n));
  }
  let parts: number[];
  if (/[:;]/.test(t)) {
    parts = t.split(/[:;]/).map((x) => Number(x || 0));
    if (parts.some((x) => !Number.isFinite(x))) return null;
  } else {
    if (!/^\d+$/.test(t)) return null;
    const s = t.padStart(8, '0').slice(-8);
    parts = [Number(s.slice(0, 2)), Number(s.slice(2, 4)), Number(s.slice(4, 6)), Number(s.slice(6, 8))];
  }
  while (parts.length < 4) parts.unshift(0);
  const [hh, mm, ss, ff] = parts.slice(-4);
  return Math.max(0, tcToFrame(hh, mm, ss, ff, r, drop));
}

/** durata leggibile: 1:02:03 oppure 12,4 s */
export function durataUmana(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return '—';
  if (sec < 60) return `${sec.toFixed(1).replace('.', ',')} s`;
  const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = Math.floor(sec % 60);
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
