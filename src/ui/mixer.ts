// Gli strumenti del banco: i due VU a lancetta (con la loro inerzia vera), il mixer delle tracce audio
// e dei livelli video (trasparenza al volo).
import { store } from '../core/store';
import { motore } from '../motore';
import { banco } from '../media/audio';
import { h, clamp } from './dom';

/** coppia di VU analogici: 0 VU = −18 dBFS (taratura EBU), lancetta con molla e smorzamento */
export class VuMetri {
  el: HTMLCanvasElement;
  private pos = [0, 0];
  private vel = [0, 0];
  private picco = [0, 0];
  private barra = [0, 0];
  private tPicco = [0, 0];
  private ultimo = performance.now();
  private dpr = 1;

  constructor() {
    this.el = h('canvas', { class: 'vu' });
    new ResizeObserver(() => this.adatta()).observe(this.el);
    motore.ogniGiro(() => this.giro());
  }

  private adatta() {
    this.dpr = Math.min(2, devicePixelRatio || 1);
    const r = this.el.getBoundingClientRect();
    this.el.width = Math.round(r.width * this.dpr);
    this.el.height = Math.round(r.height * this.dpr);
  }

  private giro() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.ultimo) / 1000);
    this.ultimo = now;
    const m = banco.misure();
    const rms = [m.l, m.r], pk = [m.lPeak, m.rPeak];
    let fermo = true;
    for (let i = 0; i < 2; i++) {
      const db = 20 * Math.log10(Math.max(1e-6, rms[i] * Math.SQRT2)); // rms di un seno = picco/√2
      const vu = db + 18;
      // scala del VU: da −20 a +3, non lineare come quelli veri (posizione ~ tensione)
      const target = clamp((Math.pow(10, vu / 20) - 0.1) / (Math.pow(10, 3 / 20) - 0.1), -0.02, 1.08);
      // molla-smorzatore: 300 ms di salita con un filo di rimbalzo
      const k = 180, c = 20;
      const a = k * (target - this.pos[i]) - c * this.vel[i];
      this.vel[i] += a * dt;
      this.pos[i] += this.vel[i] * dt;
      if (Math.abs(this.vel[i]) > 0.001 || this.pos[i] > 0.01) fermo = false;
      const pdb = 20 * Math.log10(Math.max(1e-6, pk[i]));
      if (pdb > -3) { this.picco[i] = 1; this.tPicco[i] = now; }
      else if (now - this.tPicco[i] > 900) this.picco[i] = 0;
      const b = clamp((pdb + 60) / 60, 0, 1);
      this.barra[i] = b > this.barra[i] ? b : Math.max(b, this.barra[i] - dt * 0.8);
    }
    if (fermo && !motore.playing && this.disegnato) return;
    this.disegna();
  }
  private disegnato = false;

  private disegna() {
    this.disegnato = true;
    const c = this.el, ctx = c.getContext('2d')!;
    const W = c.width, H = c.height;
    if (!W || !H) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const gap = 8 * this.dpr;
    const w = (W - gap) / 2;
    for (let i = 0; i < 2; i++) this.strumento(ctx, i * (w + gap), 0, w, H, i);
  }

  private strumento(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, hh: number, i: number) {
    const d = this.dpr;
    const bh = 7 * d;
    const fh = hh - bh - 3 * d;
    // cornice e quadrante crema retroilluminato
    ctx.fillStyle = '#0c0b10';
    ctx.beginPath(); ctx.roundRect(x, y, w, fh, 5 * d); ctx.fill();
    const g = ctx.createRadialGradient(x + w / 2, y + fh * 0.9, fh * 0.1, x + w / 2, y + fh * 0.7, w * 0.8);
    g.addColorStop(0, '#fff6d6'); g.addColorStop(0.6, '#f3dfa4'); g.addColorStop(1, '#b89a52');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(x + 3 * d, y + 3 * d, w - 6 * d, fh - 6 * d, 3 * d); ctx.fill();
    const cx = x + w / 2, cy = y + fh * 1.02, R = Math.min(w * 0.62, fh * 0.9);
    const a0 = -Math.PI / 2 - 0.78, a1 = -Math.PI / 2 + 0.78;
    const ang = (k: number) => a0 + (a1 - a0) * k;
    const kv = (vu: number) => (Math.pow(10, vu / 20) - 0.1) / (Math.pow(10, 3 / 20) - 0.1);
    // zona rossa
    ctx.strokeStyle = '#c8202a';
    ctx.lineWidth = 4 * d;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.86, ang(kv(0)), ang(1)); ctx.stroke();
    ctx.strokeStyle = '#1b1a1f';
    ctx.lineWidth = 1.2 * d;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.86, ang(0), ang(kv(0))); ctx.stroke();
    ctx.font = `700 ${Math.max(7, 8 * d)}px Rajdhani, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const vu of [-20, -10, -7, -5, -3, -2, -1, 0, 1, 2, 3]) {
      const a = ang(kv(vu));
      ctx.strokeStyle = vu > 0 ? '#c8202a' : '#1b1a1f';
      ctx.lineWidth = (vu === 0 ? 2 : 1.2) * d;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86); ctx.lineTo(cx + Math.cos(a) * R * 0.95, cy + Math.sin(a) * R * 0.95); ctx.stroke();
      if ([-20, -10, -5, -3, 0, 3].includes(vu)) {
        ctx.fillStyle = vu > 0 ? '#c8202a' : '#1b1a1f';
        ctx.fillText(String(Math.abs(vu)), cx + Math.cos(a) * R * 1.05, cy + Math.sin(a) * R * 1.05);
      }
    }
    ctx.fillStyle = '#1b1a1f';
    ctx.font = `900 ${Math.max(8, 10 * d)}px Orbitron, sans-serif`;
    ctx.fillText('VU', cx, y + fh * 0.62);
    ctx.font = `700 ${Math.max(6, 7 * d)}px Rajdhani, sans-serif`;
    ctx.fillText(i === 0 ? 'SINISTRO' : 'DESTRO', cx, y + fh * 0.76);
    // lancetta
    const a = ang(clamp(this.pos[i], -0.03, 1.1));
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.6 * d;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * 0.25, cy + Math.sin(a) * R * 0.25); ctx.lineTo(cx + Math.cos(a) * R * 0.98, cy + Math.sin(a) * R * 0.98); ctx.stroke();
    // led di picco
    ctx.fillStyle = this.picco[i] ? '#ff2a3a' : '#4a1418';
    ctx.shadowColor = '#ff2a3a';
    ctx.shadowBlur = this.picco[i] ? 10 * d : 0;
    ctx.beginPath(); ctx.arc(x + w - 11 * d, y + 11 * d, 3.5 * d, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // vetro
    const v = ctx.createLinearGradient(0, y, 0, y + fh);
    v.addColorStop(0, 'rgba(255,255,255,.28)'); v.addColorStop(0.35, 'rgba(255,255,255,0)');
    ctx.fillStyle = v;
    ctx.beginPath(); ctx.roundRect(x + 3 * d, y + 3 * d, w - 6 * d, fh - 6 * d, 3 * d); ctx.fill();
    // barra di picco digitale sotto (il moderno)
    const by = y + fh + 3 * d;
    ctx.fillStyle = '#0c0b10';
    ctx.fillRect(x, by, w, bh);
    const n = 30;
    for (let s = 0; s < n; s++) {
      const k = s / n;
      const on = k < this.barra[i];
      const db = -60 + k * 60;
      ctx.fillStyle = db > -6 ? (on ? '#ff3a4a' : '#3a1418') : db > -18 ? (on ? '#ffd54a' : '#3a3214') : (on ? '#5dffb4' : '#143a28');
      ctx.fillRect(x + 1 + (s * (w - 2)) / n, by + 1, (w - 2) / n - 1, bh - 2);
    }
  }
}

/** il mixer: una striscia per ogni traccia audio (fader, pan, muto, solo, livello) e i livelli video */
export class Mixer {
  el: HTMLElement;
  private misure = new Map<string, HTMLElement>();
  constructor() {
    this.el = h('div', { class: 'mixer' });
    store.on('doc', () => { if (!this.trascinando) this.costruisci(); });
    motore.ogniGiro(() => this.livelli());
    this.costruisci();
  }
  private trascinando = false;

  private costruisci() {
    const p = store.doc;
    this.misure.clear();
    const strisce: HTMLElement[] = [];
    for (const t of p.tracks) {
      const video = t.kind === 'video';
      const fader = h('input', {
        type: 'range', class: 'fader-v', min: video ? 0 : -60, max: video ? 100 : 12, step: video ? 1 : 0.5,
        value: String(video ? Math.round(t.opacity * 100) : t.volume), orient: 'vertical',
      }) as HTMLInputElement;
      const val = h('span', { class: 'striscia-val' }, video ? `${Math.round(t.opacity * 100)}%` : `${t.volume > 0 ? '+' : ''}${t.volume} dB`);
      fader.addEventListener('pointerdown', () => { this.trascinando = true; store.begin(video ? 'Livello video' : 'Volume traccia'); });
      fader.addEventListener('input', () => {
        const tr = store.doc.tracks.find((x) => x.id === t.id)!;
        const v = Number(fader.value);
        if (video) tr.opacity = v / 100; else tr.volume = v;
        val.textContent = video ? `${v}%` : `${v > 0 ? '+' : ''}${v} dB`;
        if (!this.trascinando) { this.trascinando = true; store.begin('Livello'); }
        store.liveChange();
      });
      fader.addEventListener('change', () => { this.trascinando = false; store.commit(true); });
      fader.addEventListener('dblclick', () => store.edit('Livello a zero', (pp) => { const tr = pp.tracks.find((x) => x.id === t.id)!; if (video) tr.opacity = 1; else tr.volume = 0; }));
      const mis = h('div', { class: 'striscia-misura' }, h('i'));
      if (!video) this.misure.set(t.id, mis);
      const pan = video ? null : h('input', { type: 'range', class: 'pan', min: -100, max: 100, step: 1, value: String(Math.round(t.pan * 100)), title: 'Panorama (doppio clic = centro)' }) as HTMLInputElement;
      if (pan) {
        pan.addEventListener('input', () => { const tr = store.doc.tracks.find((x) => x.id === t.id)!; tr.pan = Number(pan.value) / 100; store.liveChange(); });
        pan.addEventListener('pointerdown', () => { this.trascinando = true; store.begin('Panorama'); });
        pan.addEventListener('change', () => { this.trascinando = false; store.commit(true); });
        pan.addEventListener('dblclick', () => store.edit('Panorama al centro', (pp) => { pp.tracks.find((x) => x.id === t.id)!.pan = 0; }));
      }
      const bt = (lbl: string, on: boolean, cls: string, fn: () => void, title: string) => h('button', { class: 'tt-btn ' + (on ? cls : ''), title, on: { click: fn } }, lbl);
      strisce.push(h('div', { class: 'striscia ' + t.kind },
        h('b', { class: 'striscia-nome' }, t.name),
        pan ?? h('span', { class: 'striscia-tipo' }, 'LIVELLO'),
        h('div', { class: 'striscia-fader' }, video ? null : mis, fader),
        val,
        h('div', { class: 'striscia-btn' },
          bt(video ? 'OFF' : 'M', t.mute, 'on-rosso', () => store.edit('Muto', (pp) => { const tr = pp.tracks.find((x) => x.id === t.id)!; tr.mute = !tr.mute; }), video ? 'Spegni la traccia' : 'Muto'),
          video ? null : bt('S', t.solo, 'on-oro', () => store.edit('Solo', (pp) => { const tr = pp.tracks.find((x) => x.id === t.id)!; tr.solo = !tr.solo; }), 'Solo'))));
    }
    // master
    const mf = h('input', { type: 'range', class: 'fader-v', min: 0, max: 150, step: 1, value: String(Math.round(banco.volumeMaster * 100)), orient: 'vertical' }) as HTMLInputElement;
    const mv = h('span', { class: 'striscia-val' }, Math.round(banco.volumeMaster * 100) + '%');
    mf.addEventListener('input', () => { banco.volumeMaster = Number(mf.value) / 100; mv.textContent = mf.value + '%'; banco.aggiornaTracce(store.doc); });
    strisce.push(h('div', { class: 'striscia master' }, h('b', { class: 'striscia-nome' }, 'ASCOLTO'), h('span', { class: 'striscia-tipo' }, 'CUFFIA'), h('div', { class: 'striscia-fader' }, mf), mv, h('div', { class: 'striscia-btn' })));
    this.el.replaceChildren(h('p', { class: 'nota' }, 'Doppio clic su un fader = torna a zero. I livelli video sono la trasparenza di tutta la traccia.'), h('div', { class: 'strisce' }, strisce));
  }

  private livelli() {
    if (!this.el.isConnected || !motore.playing) {
      for (const m of this.misure.values()) (m.firstChild as HTMLElement).style.height = '0%';
      return;
    }
    for (const [id, m] of this.misure) {
      const pk = banco.livelloTraccia(id);
      const db = 20 * Math.log10(Math.max(1e-6, pk));
      (m.firstChild as HTMLElement).style.height = clamp(((db + 60) / 60) * 100, 0, 100) + '%';
      m.classList.toggle('rosso', db > -3);
    }
  }
}
