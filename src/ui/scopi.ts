// Gli strumenti di misura del tavolo di controllo: monitor di forma d'onda (luminanza, IRE) e vettorscopio,
// con il fosforo verde dei Tektronix. Leggono l'uscita del Recorder in piccolo, una decina di volte al secondo.
import { motore } from '../motore';
import { h } from './dom';

const W = 192, H = 108;

export class Scopi {
  el: HTMLElement;
  private onda: HTMLCanvasElement;
  private vettori: HTMLCanvasElement;
  private px = new Uint8Array(W * H * 4);
  private ultimo = 0;
  private acceso = false;

  constructor() {
    this.onda = h('canvas', { class: 'scopio', width: 256, height: 140 });
    this.vettori = h('canvas', { class: 'scopio', width: 160, height: 160 });
    this.el = h('div', { class: 'scopi' },
      h('figure', null, this.onda, h('figcaption', null, 'Forma d\'onda · IRE')),
      h('figure', null, this.vettori, h('figcaption', null, 'Vettorscopio')),
      h('p', { class: 'nota' }, 'Il bianco non deve passare 100 IRE e il nero non scendere sotto 0: sono i limiti delle trasmissioni. Le macchie del vettorscopio dentro i quadratini = colori legali.'));
    motore.ogniGiro(() => this.giro());
  }

  attiva(on: boolean) { this.acceso = on; }

  private giro() {
    if (!this.acceso || !this.el.isConnected || !motore.rec) return;
    const now = performance.now();
    if (now - this.ultimo < (motore.playing ? 90 : 250)) return;
    this.ultimo = now;
    try { motore.rec.leggiPiccolo(W, H, this.px); } catch { return; }
    this.disegnaOnda();
    this.disegnaVettori();
  }

  private disegnaOnda() {
    const c = this.onda, ctx = c.getContext('2d')!;
    const cw = c.width, ch = c.height;
    ctx.fillStyle = '#020604';
    ctx.fillRect(0, 0, cw, ch);
    const img = ctx.getImageData(0, 0, cw, ch);
    const d = img.data;
    const top = 10, bot = ch - 10;
    const yOf = (ire: number) => bot - ((ire + 10) / 120) * (bot - top);
    // la lettura è capovolta (OpenGL): la riga 0 è in basso, qui non importa perché si guarda per colonne
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const Y = 0.2126 * this.px[i] + 0.7152 * this.px[i + 1] + 0.0722 * this.px[i + 2];
        const ire = (Y / 255) * 100;
        const cx = Math.floor((x / W) * cw);
        const cy = Math.round(yOf(ire));
        if (cy < 0 || cy >= ch) continue;
        const j = (cy * cw + cx) * 4;
        d[j] = Math.min(255, d[j] + 18);
        d[j + 1] = Math.min(255, d[j + 1] + 60);
        d[j + 2] = Math.min(255, d[j + 2] + 30);
        d[j + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.font = '600 9px Rajdhani, sans-serif';
    for (const ire of [0, 25, 50, 75, 100]) {
      const y = Math.round(yOf(ire)) + 0.5;
      ctx.strokeStyle = ire === 100 || ire === 0 ? 'rgba(255,120,90,.5)' : 'rgba(120,255,170,.18)';
      ctx.beginPath(); ctx.moveTo(18, y); ctx.lineTo(cw, y); ctx.stroke();
      ctx.fillStyle = 'rgba(160,255,200,.6)';
      ctx.fillText(String(ire), 2, y + 3);
    }
  }

  private disegnaVettori() {
    const c = this.vettori, ctx = c.getContext('2d')!;
    const S = c.width, R = S / 2 - 8, cx = S / 2, cy = S / 2;
    ctx.fillStyle = '#020604';
    ctx.fillRect(0, 0, S, S);
    const img = ctx.getImageData(0, 0, S, S);
    const d = img.data;
    for (let i = 0; i < W * H * 4; i += 4) {
      const r = this.px[i] / 255, g = this.px[i + 1] / 255, b = this.px[i + 2] / 255;
      const u = -0.147 * r - 0.289 * g + 0.436 * b;
      const v = 0.615 * r - 0.515 * g - 0.1 * b;
      const x = Math.round(cx + (u / 0.62) * R), y = Math.round(cy - (v / 0.62) * R);
      if (x < 0 || y < 0 || x >= S || y >= S) continue;
      const j = (y * S + x) * 4;
      d[j] = Math.min(255, d[j] + 20);
      d[j + 1] = Math.min(255, d[j + 1] + 70);
      d[j + 2] = Math.min(255, d[j + 2] + 35);
      d[j + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    ctx.strokeStyle = 'rgba(120,255,170,.25)';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    // i quadratini dei colori delle barre al 75%
    const bersagli: [string, number, number, number][] = [['R', 0.75, 0, 0], ['G', 0, 0.75, 0], ['B', 0, 0, 0.75], ['Cy', 0, 0.75, 0.75], ['Mg', 0.75, 0, 0.75], ['Yl', 0.75, 0.75, 0]];
    ctx.font = '600 9px Rajdhani, sans-serif';
    for (const [n, r, g, b] of bersagli) {
      const u = -0.147 * r - 0.289 * g + 0.436 * b, v = 0.615 * r - 0.515 * g - 0.1 * b;
      const x = cx + (u / 0.62) * R, y = cy - (v / 0.62) * R;
      ctx.strokeStyle = 'rgba(255,213,74,.55)';
      ctx.strokeRect(x - 5, y - 5, 10, 10);
      ctx.fillStyle = 'rgba(255,213,74,.7)';
      ctx.fillText(n, x + 7, y + 3);
    }
  }
}
